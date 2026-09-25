"use client";

import { CircleCheck, X } from "lucide-react";
import { IconButton } from "@/components/ui/button";
import { formatDayTime } from "@/lib/format";
import { firstName } from "@/lib/labels";
import type { Booking } from "@/lib/types";

const NEXT_STEPS = (first: string) => [
  `${first} gets the details and confirms, usually within a few minutes.`,
  "You can chat with them here. Numbers stay masked on both sides.",
  "On the day, follow the visit live and see photo updates.",
];

/** The success message after paying: the verb matches the button ("Book and pay" → "Booked"). */
export function ConfirmedBanner({
  booking,
  serviceLabel,
  onDismiss,
}: {
  booking: Booking;
  serviceLabel: string;
  onDismiss: () => void;
}) {
  const first = firstName(booking.earner.name);
  return (
    <section
      role="status"
      aria-labelledby="booked-title"
      className="relative animate-rise-in overflow-hidden rounded-panel border border-trail/30 bg-linear-to-br from-surface via-surface to-trail-soft p-5 shadow-card sm:p-6"
    >
      <IconButton label="Dismiss" onClick={onDismiss} className="absolute top-2 right-2">
        <X className="size-5" aria-hidden />
      </IconButton>
      <div className="flex items-start gap-4 pr-10">
        <span className="flex size-12 shrink-0 animate-pop-in items-center justify-center rounded-full bg-trail text-surface shadow-float">
          <CircleCheck className="size-6" aria-hidden />
        </span>
        <div className="min-w-0">
          <h2 id="booked-title" className="font-display text-headline font-semibold">
            Booked
          </h2>
          <p className="mt-1 text-ink-muted">
            {serviceLabel} for {booking.pet.name}, {formatDayTime(booking.start).toLowerCase()}. Reference{" "}
            <span className="font-semibold text-ink">{booking.code}</span>.
          </p>
        </div>
      </div>
      <h3 className="mt-6 text-sm font-semibold">What happens next</h3>
      <ol className="mt-3 grid gap-3 sm:grid-cols-3">
        {NEXT_STEPS(first).map((text, index) => (
          <li key={text} className="flex gap-3 rounded-field border border-hairline bg-surface p-4 text-sm shadow-card">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-sky text-label font-bold text-leash-dark">
              {index + 1}
            </span>
            {text}
          </li>
        ))}
      </ol>
    </section>
  );
}
