import { CalendarCheck, CircleCheck, Clock3, Footprints, MapPinned, XCircle } from "lucide-react";
import type { ReactNode } from "react";
import { Money } from "@/components/ui/money";
import { formatDayTime, formatTime } from "@/lib/format";
import { CANCELLED_BY_LABELS, firstName } from "@/lib/labels";
import type { Booking } from "@/lib/types";
import { cn } from "@/lib/utils";

function Shell({
  icon,
  tone,
  title,
  children,
}: {
  icon: ReactNode;
  tone: "amber" | "leash" | "trail" | "alert";
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="flex gap-4 rounded-card border border-hairline bg-surface p-4 sm:p-5">
      <span
        className={cn(
          "flex size-11 shrink-0 items-center justify-center rounded-full [&_svg]:size-5",
          tone === "amber" && "bg-amber-soft text-amber",
          tone === "leash" && "bg-sky text-leash-dark",
          tone === "trail" && "bg-trail-soft text-trail",
          tone === "alert" && "bg-alert-soft text-alert",
        )}
        aria-hidden
      >
        {icon}
      </span>
      <div className="min-w-0">
        <h2 className="text-title font-semibold">{title}</h2>
        <div className="mt-1 space-y-1 text-sm text-ink-muted">{children}</div>
      </div>
    </div>
  );
}

/** Where the booking stands and what happens next, in plain words. */
export function StatusGuide({ booking }: { booking: Booking }) {
  const first = firstName(booking.earner.name);
  switch (booking.status) {
    case "requested":
      return (
        <Shell icon={<Clock3 />} tone="amber" title={`Waiting for ${first} to confirm`}>
          <p>
            Carers usually answer within a few minutes.
            {booking.respondBy
              ? ` If ${first} has not confirmed by ${formatDayTime(booking.respondBy).toLowerCase()}, the request lapses and you are refunded in full.`
              : " If they cannot take it, you are refunded in full."}
          </p>
        </Shell>
      );
    case "confirmed":
      return (
        <Shell icon={<CalendarCheck />} tone="leash" title={`${first} has confirmed`}>
          <p>
            They will set off in time for {formatTime(booking.start)}. Once they do, you can follow them live on this
            page.
          </p>
        </Shell>
      );
    case "onTheWay":
      return (
        <Shell icon={<MapPinned />} tone="leash" title={`${first} is on the way`}>
          <p>Follow them on the map below, or message them if anything has changed.</p>
        </Shell>
      );
    case "inProgress":
      return (
        <Shell icon={<Footprints />} tone="trail" title="The visit has started">
          <p>Photo updates appear in the timeline as {first} sends them.</p>
        </Shell>
      );
    case "completed":
      return (
        <Shell icon={<CircleCheck />} tone="trail" title="Visit finished">
          <p>
            {booking.canRate
              ? `How did it go? Rating ${first} helps other owners choose.`
              : booking.ratingGiven
                ? `You rated this visit ${booking.ratingGiven} out of 5. Thank you.`
                : "Thanks for booking with PetBuddy."}
          </p>
        </Shell>
      );
    case "cancelled": {
      const c = booking.cancellation;
      return (
        <Shell icon={<XCircle />} tone="alert" title={c ? CANCELLED_BY_LABELS[c.by] : "This booking was cancelled"}>
          {c ? (
            <>
              <p>Cancelled {formatDayTime(c.at).toLowerCase()}.</p>
              {c.reason ? <p>Reason: {c.reason}</p> : null}
              <p>
                {c.refundPaise > 0 ? (
                  <>
                    <Money paise={c.refundPaise} className="font-semibold text-ink" /> refunded to your original
                    payment method
                  </>
                ) : (
                  "No refund was due"
                )}
                {c.feePaise > 0 ? (
                  <>
                    , <Money paise={c.feePaise} className="font-semibold text-ink" /> kept as a cancellation fee
                  </>
                ) : null}
                .
              </p>
            </>
          ) : (
            <p>Any refund goes back to your original payment method.</p>
          )}
        </Shell>
      );
    }
  }
}
