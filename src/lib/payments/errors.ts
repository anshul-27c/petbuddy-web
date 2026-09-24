/** Thrown when the person closes the payment sheet. The UI treats it as a no-op. */
export class PaymentCancelledError extends Error {
  readonly code = "cancelled" as const;

  constructor() {
    super("Payment cancelled");
    this.name = "PaymentCancelledError";
  }
}

export function isPaymentCancelled(error: unknown): error is PaymentCancelledError {
  return error instanceof PaymentCancelledError;
}
