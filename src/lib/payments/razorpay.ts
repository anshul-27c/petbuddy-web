/**
 * The hosted checkout path, used when `/config` reports `paymentProvider: "razorpay"`.
 * Everything specific to that provider lives in this file.
 * Not yet exercised against a live key.
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
  prefill?: { method?: PaymentMethod };
  theme?: { color: string };
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

export async function payWithHostedCheckout(
  request: { amountPaise: number; purpose: PaymentPurpose; description: string; method: PaymentMethod },
  config: PublicConfig,
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
      prefill: { method: request.method },
      theme: { color: "#5170FF" },
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
