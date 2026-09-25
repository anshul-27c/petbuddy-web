import {
  BOOKING_STATUS_LABELS,
  ORDER_STATUS_LABELS,
  PAYMENT_STATUS_LABELS,
} from "@/lib/labels";
import type { ReactNode } from "react";
import type { BookingStatus, OrderStatus, PaymentStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

export type PillTone = "amber" | "leash" | "trail" | "alert" | "muted";

const TONES: Record<PillTone, string> = {
  amber: "bg-amber-soft text-amber",
  leash: "bg-sky text-leash-dark",
  trail: "bg-trail-soft text-trail",
  alert: "bg-alert-soft text-alert",
  muted: "bg-canvas text-ink-muted",
};

const BOOKING_TONES: Record<BookingStatus, PillTone> = {
  requested: "amber",
  confirmed: "leash",
  onTheWay: "leash",
  inProgress: "trail",
  completed: "trail",
  cancelled: "alert",
};

const PAYMENT_TONES: Record<PaymentStatus, PillTone> = {
  created: "amber",
  paid: "trail",
  failed: "alert",
  refunded: "muted",
  partiallyRefunded: "muted",
};

// Order statuses are not in the shared pill table; they follow the booking
// lifecycle they resemble (placed ~ requested, packed/shipped ~ confirmed).
const ORDER_TONES: Record<OrderStatus, PillTone> = {
  placed: "amber",
  packed: "leash",
  shipped: "leash",
  delivered: "trail",
  cancelled: "alert",
};

/** A status in a soft tinted capsule. `live` adds a pulsing ring to the dot. */
export function Pill({
  tone,
  children,
  dot = true,
  live = false,
  className,
}: {
  tone: PillTone;
  children: ReactNode;
  dot?: boolean;
  live?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-2 rounded-full px-3 py-1 text-label font-semibold whitespace-nowrap",
        TONES[tone],
        className,
      )}
    >
      {dot ? <span className={cn("size-1.5 rounded-full bg-current", live && "pulse-dot")} aria-hidden /> : null}
      {children}
    </span>
  );
}

const LIVE_STATUSES = new Set<BookingStatus>(["onTheWay", "inProgress"]);

export function BookingStatusPill({ status, className }: { status: BookingStatus; className?: string }) {
  return (
    <Pill tone={BOOKING_TONES[status]} live={LIVE_STATUSES.has(status)} className={className}>
      {BOOKING_STATUS_LABELS[status]}
    </Pill>
  );
}

export function PaymentStatusPill({ status, className }: { status: PaymentStatus; className?: string }) {
  return (
    <Pill tone={PAYMENT_TONES[status]} className={className}>
      {PAYMENT_STATUS_LABELS[status]}
    </Pill>
  );
}

export function OrderStatusPill({ status, className }: { status: OrderStatus; className?: string }) {
  return (
    <Pill tone={ORDER_TONES[status]} className={className}>
      {ORDER_STATUS_LABELS[status]}
    </Pill>
  );
}
