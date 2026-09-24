"use client";

import Link from "next/link";
import { ServiceIcon } from "@/components/ui/icons";
import { Skeleton } from "@/components/ui/skeleton";
import { QueryView } from "@/components/ui/states";
import { formatMoney } from "@/lib/format";
import { useServices } from "@/lib/queries";

/** Every active service with its starting price; each opens the carer list filtered to it. */
export function ServicesGrid() {
  const services = useServices();
  return (
    <QueryView
      query={services}
      loading={
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4" role="status" aria-label="Loading services">
          {Array.from({ length: 8 }, (_, i) => (
            <Skeleton key={i} className="h-36 rounded-card" />
          ))}
        </div>
      }
      isEmpty={(list) => list.length === 0}
      empty={<p className="text-ink-muted">Services will appear here soon.</p>}
    >
      {(list) => (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {[...list]
            .sort((a, b) => a.sortOrder - b.sortOrder)
            .map((service) => (
              <li key={service.key}>
                <Link
                  href={`/carers?service=${service.key}`}
                  className="flex h-full flex-col rounded-card border border-hairline bg-surface p-4 transition-colors hover:border-leash"
                >
                  <span className="flex size-11 items-center justify-center rounded-full bg-sky text-leash">
                    <ServiceIcon service={service.key} className="size-5" />
                  </span>
                  <span className="mt-3 font-semibold">{service.label}</span>
                  <span className="mt-0.5 line-clamp-2 text-small text-ink-muted">{service.blurb}</span>
                  <span className="mt-auto pt-2 text-sm font-semibold text-leash-dark tabular-nums">
                    from {formatMoney(service.fromPaise)}
                  </span>
                </Link>
              </li>
            ))}
        </ul>
      )}
    </QueryView>
  );
}
