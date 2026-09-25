"use client";

import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { IconTile } from "@/components/ui/icon-tile";
import { ServiceIcon } from "@/components/ui/icons";
import { Money } from "@/components/ui/money";
import { formatDuration } from "@/lib/format";
import { useServiceCatalogue } from "@/lib/queries";
import type { Earner } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useBookHref } from "./book-href";

function ServiceRow({ earner, serviceKey }: { earner: Earner; serviceKey: Earner["services"][number] }) {
  const catalogue = useServiceCatalogue();
  const service = catalogue.get(serviceKey);
  const price = earner.prices[serviceKey];
  const href = useBookHref(earner.id, { service: serviceKey });
  const bookable = earner.isOnline;

  const body = (
    <>
      <IconTile>
        <ServiceIcon service={serviceKey} />
      </IconTile>
      <span className="min-w-0 flex-1">
        <span className="block font-semibold">{service.label}</span>
        <span className="mt-1 block text-small text-ink-muted">
          {service.blurb} · {formatDuration(service.defaultMinutes)}
        </span>
      </span>
      <span className="shrink-0 text-right">
        {price !== undefined ? (
          <Money paise={price} display className="text-title" />
        ) : (
          <Money paise={earner.pricePerHourPaise} display suffix="/hr" className="text-title" />
        )}
      </span>
      {bookable ? (
        <ChevronRight
          className="size-4 shrink-0 text-ink-faint transition-transform duration-150 group-hover:translate-x-1 group-hover:text-leash"
          aria-hidden
        />
      ) : null}
    </>
  );

  const row = "flex items-center gap-3 rounded-field border border-hairline bg-surface p-4 shadow-card";
  if (!bookable) {
    return <div className={row}>{body}</div>;
  }
  return (
    <Link href={href} className={cn(row, "group transition duration-150 hover:border-leash hover:shadow-lift")}>
      <span className="sr-only">Book </span>
      {body}
    </Link>
  );
}

/** Each offered service with the price of one booking at its default length. */
export function ServicePrices({ earner }: { earner: Earner }) {
  return (
    <ul className="grid grid-cols-1 gap-3">
      {earner.services.map((service) => (
        <li key={service}>
          <ServiceRow earner={earner} serviceKey={service} />
        </li>
      ))}
    </ul>
  );
}
