"use client";

import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { bentoLayout } from "@/components/ui/grid";
import { IconTile } from "@/components/ui/icon-tile";
import { ServiceIcon } from "@/components/ui/icons";
import { Reveal, revealItem, trackPointer } from "@/components/ui/motion";
import { Skeleton } from "@/components/ui/skeleton";
import { QueryView } from "@/components/ui/states";
import { formatMoney } from "@/lib/format";
import { SERVICE_KEYS } from "@/lib/labels";
import { useServices } from "@/lib/queries";
import { cn } from "@/lib/utils";

// A list on phones; a bento from 640 px.
const COLUMNS = { base: 1, sm: 2, md: 3, lg: 4 } as const;
const SKELETON = bentoLayout(SERVICE_KEYS.length, COLUMNS);

/** A dotted walk across the feature tile. Decorative. */
function Trail() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 220 120"
      className="pointer-events-none absolute top-4 right-4 hidden h-24 w-auto text-leash/25 sm:block"
    >
      <path
        d="M8 108 C 60 100, 70 40, 120 52 S 190 30, 214 8"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeDasharray="2 10"
        strokeLinecap="round"
      />
      {[
        [58, 88],
        [118, 50],
        [176, 34],
      ].map(([x, y]) => (
        <g key={x} transform={`translate(${x} ${y})`} fill="currentColor">
          <ellipse cx="0" cy="4" rx="5" ry="4.2" />
          <circle cx="-5.5" cy="-3" r="2" />
          <circle cx="-1.8" cy="-6" r="2" />
          <circle cx="2.2" cy="-6" r="2" />
          <circle cx="5.8" cy="-3" r="2" />
        </g>
      ))}
    </svg>
  );
}

/**
 * Every active service with its starting price, as a bento: the first service
 * is the feature tile and spans just enough columns for the rows to finish full.
 */
export function ServicesGrid() {
  const services = useServices();
  return (
    <QueryView
      query={services}
      loading={
        <div className={cn("grid grid-cols-1 gap-3 sm:gap-6", SKELETON.grid)} role="status" aria-label="Loading services">
          {SERVICE_KEYS.map((key, i) => (
            <Skeleton key={key} className={cn("h-20 rounded-card sm:h-44", i === 0 && SKELETON.featureSpan)} />
          ))}
        </div>
      }
      isEmpty={(list) => list.length === 0}
      empty={<p className="text-ink-muted">Services will appear here soon.</p>}
    >
      {(list) => {
        const sorted = [...list].sort((a, b) => a.sortOrder - b.sortOrder);
        const layout = bentoLayout(sorted.length, COLUMNS);
        return (
          <Reveal as="ul" className={cn("grid grid-cols-1 gap-3 sm:gap-6", layout.grid)}>
            {sorted.map((service, index) => {
              const feature = index === 0;
              return (
                <li key={service.key} className={cn("flex", feature && layout.featureSpan)} {...revealItem(index)}>
                  <Link
                    href={`/carers?service=${service.key}`}
                    onPointerMove={trackPointer}
                    className={cn(
                      "spotlight lift group flex w-full items-center gap-4 overflow-hidden rounded-card border border-hairline p-4 shadow-card",
                      "sm:flex-col sm:items-stretch sm:gap-0 sm:p-5",
                      feature ? "bg-linear-to-br from-surface via-surface to-sky" : "bg-surface",
                    )}
                  >
                    {feature ? <Trail /> : null}
                    <IconTile size="lg">
                      <ServiceIcon service={service.key} />
                    </IconTile>
                    <span className="flex min-w-0 flex-1 flex-col sm:mt-4">
                      <span className="flex items-baseline justify-between gap-3">
                        <span className="text-title font-semibold text-ink">{service.label}</span>
                        <span className="shrink-0 text-sm font-semibold text-leash-dark tabular-nums sm:hidden">
                          from {formatMoney(service.fromPaise)}
                        </span>
                      </span>
                      <span
                        className={cn(
                          "mt-1 text-small text-ink-muted",
                          feature ? "sm:max-w-xs sm:text-body" : "line-clamp-2",
                        )}
                      >
                        {service.blurb}
                      </span>
                      <span className="mt-auto hidden items-center justify-between gap-2 pt-4 sm:flex">
                        <span className="text-sm font-semibold text-leash-dark tabular-nums">
                          from {formatMoney(service.fromPaise)}
                        </span>
                        <ArrowUpRight
                          className="size-4 text-ink-faint transition duration-200 group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-leash"
                          aria-hidden
                        />
                      </span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </Reveal>
        );
      }}
    </QueryView>
  );
}
