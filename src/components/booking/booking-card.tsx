"use client";

import { MapPin } from "lucide-react";
import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { ServiceIcon } from "@/components/ui/icons";
import { Money } from "@/components/ui/money";
import { Skeleton } from "@/components/ui/skeleton";
import { BookingStatusPill } from "@/components/ui/status-pill";
import { formatSlot } from "@/lib/format";
import { useServiceCatalogue } from "@/lib/queries";
import type { Booking } from "@/lib/types";
import { cn } from "@/lib/utils";

/** A booking row. `pinned` gives the soonest upcoming one a leash border. */
export function BookingCard({ booking, pinned = false }: { booking: Booking; pinned?: boolean }) {
  const catalogue = useServiceCatalogue();
  return (
    <Link
      href={`/bookings/${booking.id}`}
      className={cn(
        "block rounded-card border bg-surface p-4 transition-colors sm:p-5",
        pinned ? "border-2 border-leash" : "border-hairline hover:border-ink-faint",
      )}
    >
      <div className="flex items-start gap-3">
        <span
          className={cn(
            "flex size-11 shrink-0 items-center justify-center rounded-field text-leash",
            pinned ? "bg-sky" : "bg-canvas",
          )}
        >
          <ServiceIcon service={booking.service} className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-semibold">
            {catalogue.label(booking.service)} for {booking.pet.name}
          </p>
          <p className="mt-0.5 text-sm text-ink-muted">{formatSlot(booking.start, booking.end)}</p>
        </div>
        <BookingStatusPill status={booking.status} />
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 border-t border-hairline pt-3 text-small text-ink-muted">
        <span className="inline-flex min-w-0 items-center gap-1.5">
          <Avatar name={booking.earner.name} size="xs" />
          <span className="truncate">{booking.earner.name}</span>
        </span>
        <span className="inline-flex min-w-0 items-center gap-1">
          <MapPin className="size-3.5 shrink-0" aria-hidden />
          <span className="truncate">{booking.address.label}</span>
        </span>
        <span className="ml-auto text-sm font-semibold text-ink">
          <Money paise={booking.price.totalPaise} />
        </span>
      </div>
    </Link>
  );
}

export function BookingCardSkeleton() {
  return (
    <div aria-hidden className="rounded-card border border-hairline bg-surface p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <Skeleton className="size-11" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-3 w-2/3" />
        </div>
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
      <div className="mt-3 flex gap-3 border-t border-hairline pt-3">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-4 w-16" />
        <Skeleton className="ml-auto h-4 w-14" />
      </div>
    </div>
  );
}
