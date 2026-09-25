import { Clock } from "lucide-react";
import type { ReactNode } from "react";
import { formatDay, formatTime, isBusinessToday } from "@/lib/format";
import { cn } from "@/lib/utils";

function Line({
  children,
  size,
  tone,
  className,
}: {
  children: ReactNode;
  size: "sm" | "xs";
  tone: "muted" | "trail";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-start gap-2",
        size === "sm" ? "text-sm" : "text-small",
        tone === "trail" ? "font-semibold text-trail" : "text-ink-muted",
        className,
      )}
    >
      {/* One line tall, so the clock centres on the first line if the text wraps. */}
      <span className="flex h-[1lh] shrink-0 items-center" aria-hidden>
        <Clock className={size === "sm" ? "size-4" : "size-3.5"} />
      </span>
      <span>{children}</span>
    </span>
  );
}

/** The next free slot: the most useful fact about a carer when choosing one. */
export function NextAvailable({
  at,
  online = true,
  size = "sm",
  className,
}: {
  at: string | null;
  /** An offline carer is not taking bookings, whatever their calendar says. */
  online?: boolean;
  size?: "sm" | "xs";
  className?: string;
}) {
  if (!online) {
    return (
      <Line size={size} tone="muted" className={className}>
        Not taking bookings right now
      </Line>
    );
  }
  if (!at) {
    return (
      <Line size={size} tone="muted" className={className}>
        No free slots in the next two weeks
      </Line>
    );
  }
  if (isBusinessToday(at)) {
    return (
      <Line size={size} tone="trail" className={className}>
        Available today, from {formatTime(at)}
      </Line>
    );
  }
  return (
    <Line size={size} tone="muted" className={className}>
      Next free {formatDay(at).replace(/^(Today|Tomorrow)$/, (d) => d.toLowerCase())} at {formatTime(at)}
    </Line>
  );
}
