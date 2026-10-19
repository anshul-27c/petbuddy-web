/**
 * The hosted checkout path, used when `/config` reports `paymentProvider: "razorpay"`.
 * Everything specific to that provider lives in this file.
 *
 * The server opens the order (pinning the amount) and hands over the
 * publishable key; the checkout's payment id, order id and signature go back
 * with whatever is being bought, and the server verifies them before it
 * accepts the payment. Switching the gateway on is a server setting only.
 */
import { api, ApiError } from "../api";
import type { PaymentMethod, PaymentProof, PaymentPurpose, PublicConfig } from "../types";
import { PaymentCancelledError } from "./errors";

const CHECKOUT_SRC = "https://checkout.razorpay.com/v1/checkout.js";

interface CheckoutSuccess {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface CheckoutFailure {
  error?: { description?: string; reason?: string };
}

interface CheckoutOptions {
  key: string;
  order_id: string;
  amount: number;
  currency: "INR";
  name: string;
  description: string;
  prefill?: { method?: PaymentMethod; contact?: string; name?: string };
  theme?: { color: string };
  retry?: { enabled: boolean; max_count?: number };
  handler: (response: CheckoutSuccess) => void;
  modal?: { ondismiss?: () => void; escape?: boolean };
}

interface CheckoutInstance {
  open: () => void;
  on: (event: "payment.failed", handler: (response: CheckoutFailure) => void) => void;
}

type CheckoutConstructor = new (options: CheckoutOptions) => CheckoutInstance;

let scriptPromise: Promise<void> | null = null;

function checkoutConstructor(): CheckoutConstructor | undefined {
  return (window as unknown as { Razorpay?: CheckoutConstructor }).Razorpay;
}

function loadCheckout(): Promise<void> {
  if (checkoutConstructor()) return Promise.resolve();
  scriptPromise ??= new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = CHECKOUT_SRC;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      scriptPromise = null;
      reject(
        new ApiError({
          status: 0,
          code: "E_CHECKOUT_UNAVAILABLE",
          message: "The payment page did not load",
          action: "Check your connection and try again.",
        }),
      );
    };
    document.head.appendChild(script);
  });
  return scriptPromise;
}

/** Who is paying, so the sheet doesn't ask again. */
export interface Payer {
  phone?: string | null;
  name?: string | null;
}

export async function payWithHostedCheckout(
  request: { amountPaise: number; purpose: PaymentPurpose; description: string; method: PaymentMethod },
  config: PublicConfig,
  payer: Payer = {},
): Promise<PaymentProof> {
  const order = await api.payments.createOrder({
    purpose: request.purpose,
    amountPaise: request.amountPaise,
  });
  await loadCheckout();

  const Checkout = checkoutConstructor();
  const key = order.keyId ?? config.razorpayKeyId;
  if (!Checkout || !key) {
    throw new ApiError({
      status: 0,
      code: "E_CHECKOUT_UNAVAILABLE",
      message: "Payments are not available right now",
      action: "Try again in a few minutes.",
    });
  }

  return new Promise<PaymentProof>((resolve, reject) => {
    let lastFailure: string | null = null;
    const checkout = new Checkout({
      key,
      order_id: order.orderId,
      amount: order.amountPaise,
      currency: "INR",
      name: "PetBuddy",
      description: request.description,
      prefill: {
        method: request.method,
        ...(payer.phone ? { contact: `+91${payer.phone}` } : {}),
        ...(payer.name ? { name: payer.name } : {}),
      },
      theme: { color: "#5170FF" },
      retry: { enabled: true, max_count: 3 },
      handler: (response) =>
        resolve({
          id: response.razorpay_payment_id,
          orderId: response.razorpay_order_id,
          signature: response.razorpay_signature,
          method: request.method,
        }),
      modal: {
        // The sheet lets people retry a failed attempt, so a failure only
        // surfaces if they close it without succeeding.
        ondismiss: () => {
          if (lastFailure) {
            reject(
              new ApiError({
                status: 402,
                code: "E_PAYMENT_FAILED",
                message: lastFailure,
                action: "Try again, or pick a different payment method.",
              }),
            );
          } else {
            reject(new PaymentCancelledError());
          }
        },
      },
    });
    checkout.on("payment.failed", (response) => {
      lastFailure = response.error?.description ?? "The payment did not go through";
    });
    checkout.open();
  });
}
