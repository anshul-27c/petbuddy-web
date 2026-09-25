"use client";

import { ChevronRight, MapPin } from "lucide-react";
import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { IconTile } from "@/components/ui/icon-tile";
import { ServiceIcon } from "@/components/ui/icons";
import { Money } from "@/components/ui/money";
import { Skeleton } from "@/components/ui/skeleton";
import { BookingStatusPill } from "@/components/ui/status-pill";
import { formatSlot } from "@/lib/format";
import { useServiceCatalogue } from "@/lib/queries";
import type { Booking } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * A booking row: stacked on phones, one aligned line from 1024 px (the
 * carer, place and price sit in fixed-width columns so rows line up).
 * `pinned` marks the soonest upcoming one with a travelling border beam.
 */
export function BookingCard({ booking, pinned = false }: { booking: Booking; pinned?: boolean }) {
  const catalogue = useServiceCatalogue();
  return (
    <Link
      href={`/bookings/${booking.id}`}
      className={cn(
        "group block rounded-card border bg-surface p-4 shadow-card sm:p-5 lg:flex lg:items-center lg:gap-6",
        pinned ? "border-beam border-leash-tint" : "lift border-hairline hover:border-ink-faint",
      )}
    >
      <div className="flex items-start gap-3 lg:min-w-0 lg:flex-1 lg:items-center lg:gap-4">
        <IconTile size="lg">
          <ServiceIcon service={booking.service} />
        </IconTile>
        <div className="min-w-0 flex-1">
          <p className="text-title font-semibold">
            {catalogue.label(booking.service)} for {booking.pet.name}
          </p>
          <p className="mt-1 text-sm text-ink-muted">{formatSlot(booking.start, booking.end)}</p>
        </div>
        <BookingStatusPill status={booking.status} className="lg:hidden" />
      </div>
      <div className="mt-4 flex items-center gap-4 border-t border-hairline pt-4 text-small text-ink-muted lg:mt-0 lg:shrink-0 lg:border-0 lg:pt-0">
        <span className="inline-flex min-w-0 items-center gap-2 lg:w-44">
          <Avatar name={booking.earner.name} size="xs" />
          <span className="truncate">{booking.earner.name}</span>
        </span>
        <span className="inline-flex min-w-0 items-center gap-1 lg:w-28">
          <MapPin className="size-3.5 shrink-0" aria-hidden />
          <span className="truncate">{booking.address.label}</span>
        </span>
        <span className="ml-auto text-sm font-semibold text-ink lg:ml-0 lg:w-24 lg:text-right">
          <Money paise={booking.price.totalPaise} />
        </span>
      </div>
      <div className="hidden w-32 shrink-0 items-center justify-end gap-2 lg:flex">
        <BookingStatusPill status={booking.status} />
        <ChevronRight
          className="size-4 text-ink-faint transition-transform duration-150 group-hover:translate-x-1"
          aria-hidden
        />
      </div>
    </Link>
  );
}

export function BookingCardSkeleton() {
  return (
    <div
      aria-hidden
      className="rounded-card border border-hairline bg-surface p-4 shadow-card sm:p-5 lg:flex lg:items-center lg:gap-6"
    >
      <div className="flex items-start gap-3 lg:flex-1 lg:items-center lg:gap-4">
        <Skeleton className="size-12" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-3 w-2/3" />
        </div>
        <Skeleton className="h-6 w-20 rounded-full lg:hidden" />
      </div>
      <div className="mt-4 flex gap-4 border-t border-hairline pt-4 lg:mt-0 lg:border-0 lg:pt-0">
        <Skeleton className="h-4 w-28 lg:w-44" />
        <Skeleton className="h-4 w-16 lg:w-28" />
        <Skeleton className="ml-auto h-4 w-14 lg:ml-0 lg:w-24" />
      </div>
      <Skeleton className="hidden h-6 w-32 rounded-full lg:block" />
    </div>
  );
}
