"use client";

import { useQueryClient } from "@tanstack/react-query";
import { ShieldCheck } from "lucide-react";
import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { METHOD_ICONS } from "@/components/ui/icons";
import { formatMoney } from "@/lib/format";
import { PAYMENT_METHOD_LABELS } from "@/lib/labels";
import { PaymentCancelledError } from "@/lib/payments/errors";
import { payWithHostedCheckout } from "@/lib/payments/razorpay";
import { configQuery } from "@/lib/queries";
import type { PaymentMethod, PaymentProof, PaymentPurpose } from "@/lib/types";

export interface PayRequest {
  amountPaise: number;
  purpose: PaymentPurpose;
  description: string;
  method: PaymentMethod;
}

type Pay = (request: PayRequest) => Promise<PaymentProof>;

const PaymentContext = createContext<Pay | null>(null);

/** "pay_mock_" + milliseconds + six random base-36 characters. */
function mockPaymentId(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  const suffix = Array.from(bytes, (byte) => (byte % 36).toString(36)).join("");
  return `pay_mock_${Date.now()}${suffix}`;
}

interface Pending {
  request: PayRequest;
  resolve: (proof: PaymentProof) => void;
  reject: (error: unknown) => void;
}

/**
 * Provides `pay()`: one function for every charge on the site. It resolves to
 * the payment proof the API expects, or rejects with `PaymentCancelledError`
 * when the person backs out. The provider comes from `/config`.
 */
export function PaymentProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [pending, setPending] = useState<Pending | null>(null);
  const pendingRef = useRef<Pending | null>(null);

  const settle = useCallback((next: Pending | null) => {
    pendingRef.current = next;
    setPending(next);
  }, []);

  const pay = useCallback<Pay>(
    async (request) => {
      const config = await queryClient.fetchQuery(configQuery);
      if (config.paymentProvider === "razorpay") {
        return payWithHostedCheckout(request, config);
      }
      // Test mode: a dialog stands in for the payment sheet.
      pendingRef.current?.reject(new PaymentCancelledError());
      return new Promise<PaymentProof>((resolve, reject) => {
        settle({ request, resolve, reject });
      });
    },
    [queryClient, settle],
  );

  const cancel = () => {
    pending?.reject(new PaymentCancelledError());
    settle(null);
  };

  const confirm = () => {
    if (!pending) return;
    pending.resolve({ id: mockPaymentId(), method: pending.request.method });
    settle(null);
  };

  const MethodIcon = pending ? METHOD_ICONS[pending.request.method] : null;

  return (
    <PaymentContext.Provider value={pay}>
      {children}
      <Dialog
        open={pending !== null}
        onClose={cancel}
        title="Test payment"
        description="This is a test build. No money moves and nothing is charged."
        size="sm"
        footer={
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="outline" onClick={cancel}>
              Cancel
            </Button>
            <Button variant="accent" onClick={confirm} autoFocus>
              Pay {pending ? formatMoney(pending.request.amountPaise) : ""}
            </Button>
          </div>
        }
      >
        {pending ? (
          <div className="space-y-4">
            <div className="rounded-card bg-canvas p-5 text-center">
              <p className="text-sm text-ink-muted">{pending.request.description}</p>
              <p className="mt-1 font-display text-display font-semibold tabular-nums">
                {formatMoney(pending.request.amountPaise)}
              </p>
            </div>
            <div className="flex items-center gap-3 rounded-field border border-hairline p-3.5">
              {MethodIcon ? (
                <span className="flex size-10 items-center justify-center rounded-full bg-sky text-leash">
                  <MethodIcon className="size-5" aria-hidden />
                </span>
              ) : null}
              <div className="text-sm">
                <p className="font-semibold">Paying by {PAYMENT_METHOD_LABELS[pending.request.method]}</p>
                <p className="text-ink-muted">Choose Pay to continue as if the payment went through.</p>
              </div>
            </div>
            <p className="flex items-center gap-2 text-small text-ink-muted">
              <ShieldCheck className="size-4 text-trail" aria-hidden />
              Live builds open a secure payment page here instead.
            </p>
          </div>
        ) : null}
      </Dialog>
    </PaymentContext.Provider>
  );
}

export function usePay(): Pay {
  const pay = useContext(PaymentContext);
  if (!pay) throw new Error("usePay must be used inside PaymentProvider");
  return pay;
}
