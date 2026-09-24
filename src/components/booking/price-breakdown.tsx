import { Money } from "@/components/ui/money";
import { Skeleton } from "@/components/ui/skeleton";
import type { PriceBreakdown as Price } from "@/lib/types";

function Row({ label, paise, negative = false }: { label: string; paise: number; negative?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className="text-sm text-ink-muted">{label}</dt>
      <dd className="text-sm font-medium">
        <Money paise={negative ? -paise : paise} />
      </dd>
    </div>
  );
}

/** Every line of what is charged. Never collapsed to a single number. */
export function PriceBreakdown({ price, serviceLabel }: { price: Price; serviceLabel?: string }) {
  return (
    <dl className="space-y-2">
      <Row label={serviceLabel ? `Service: ${serviceLabel}` : "Service"} paise={price.servicePaise} />
      <Row label="Platform fee" paise={price.platformFeePaise} />
      <Row label="Taxes (GST on the platform fee)" paise={price.taxesPaise} />
      {price.tipPaise > 0 ? <Row label="Tip for your carer" paise={price.tipPaise} /> : null}
      {price.discountPaise > 0 ? <Row label="Discount" paise={price.discountPaise} negative /> : null}
      <div className="flex items-baseline justify-between gap-4 border-t border-hairline pt-3">
        <dt className="font-semibold">Total</dt>
        <dd>
          <Money paise={price.totalPaise} display className="text-subhead" />
        </dd>
      </div>
    </dl>
  );
}

export function PriceBreakdownSkeleton() {
  return (
    <div className="space-y-3" role="status" aria-label="Loading price">
      {[0, 1, 2].map((i) => (
        <div key={i} className="flex justify-between">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-14" />
        </div>
      ))}
      <div className="flex justify-between border-t border-hairline pt-3">
        <Skeleton className="h-5 w-16" />
        <Skeleton className="h-6 w-20" />
      </div>
    </div>
  );
}
