"use client";

import { ShieldCheck } from "lucide-react";
import type { UseQueryResult } from "@tanstack/react-query";
import { PaymentMethodPicker } from "@/components/booking/payment-method-picker";
import { PriceBreakdown, PriceBreakdownSkeleton } from "@/components/booking/price-breakdown";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ErrorNotice } from "@/components/ui/notice";
import { ErrorState } from "@/components/ui/states";
import { formatMoney } from "@/lib/format";
import { usePolicy } from "@/lib/queries";
import type { PaymentMethod, PriceBreakdown as Price } from "@/lib/types";

/** The full price, the cancellation policy and the payment method, next to the button that charges. */
export function PayPanel({
  quote,
  serviceLabel,
  method,
  onMethod,
  onPay,
  busy,
  error,
  ready,
}: {
  quote: UseQueryResult<Price>;
  serviceLabel: string;
  method: PaymentMethod;
  onMethod: (method: PaymentMethod) => void;
  onPay: () => void;
  busy: boolean;
  error: unknown;
  ready: boolean;
}) {
  const { freeCancelHours, lateCancelFeePercent } = usePolicy();
  const hours = `${freeCancelHours} ${freeCancelHours === 1 ? "hour" : "hours"}`;

  return (
    <Card className="space-y-5">
      <div>
        <h2 className="text-title font-semibold">What you&apos;ll pay</h2>
        <div className="mt-4">
          {quote.data ? (
            <PriceBreakdown price={quote.data} serviceLabel={serviceLabel} />
          ) : quote.isError ? (
            <ErrorState
              error={quote.error}
              onRetry={() => void quote.refetch()}
              retrying={quote.isFetching}
              compact
            />
          ) : (
            <PriceBreakdownSkeleton />
          )}
        </div>
      </div>

      <p className="flex gap-2 rounded-field bg-trail-soft p-4 text-sm text-ink">
        <span className="flex h-5 shrink-0 items-center" aria-hidden>
          <ShieldCheck className="size-4 text-trail" />
        </span>
        <span>
          Free cancellation up to {hours} before the visit. After that, {lateCancelFeePercent}% of the service price is
          kept as a fee.
        </span>
      </p>

      <PaymentMethodPicker value={method} onChange={onMethod} disabled={busy} />

      {error ? <ErrorNotice error={error} /> : null}

      <Button
        variant="accent"
        size="lg"
        block
        sheen
        onClick={onPay}
        loading={busy}
        disabled={!quote.data || !ready || quote.isFetching}
      >
        {quote.data ? `Book and pay ${formatMoney(quote.data.totalPaise)}` : "Book and pay"}
      </Button>
      <p className="text-center text-small text-ink-muted">
        Your carer confirms the request after you pay. If they do not, you are refunded in full.
      </p>
    </Card>
  );
}
