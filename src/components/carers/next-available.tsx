import { Clock } from "lucide-react";
import { formatDay, formatTime, isBusinessToday } from "@/lib/format";
import { cn } from "@/lib/utils";

/** The next free slot: the most useful fact about a carer when choosing one. */
export function NextAvailable({
  at,
  online = true,
  className,
}: {
  at: string | null;
  /** An offline carer is not taking bookings, whatever their calendar says. */
  online?: boolean;
  className?: string;
}) {
  if (!online) {
    return (
      <span className={cn("inline-flex items-center gap-1.5 text-sm text-ink-muted", className)}>
        <Clock className="size-4 shrink-0" aria-hidden />
        Not taking bookings right now
      </span>
    );
  }
  if (!at) {
    return (
      <span className={cn("inline-flex items-center gap-1.5 text-sm text-ink-muted", className)}>
        <Clock className="size-4 shrink-0" aria-hidden />
        No free slots in the next two weeks
      </span>
    );
  }
  if (isBusinessToday(at)) {
    return (
      <span className={cn("inline-flex items-center gap-1.5 text-sm font-semibold text-trail", className)}>
        <Clock className="size-4 shrink-0" aria-hidden />
        Available today, from {formatTime(at)}
      </span>
    );
  }
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-sm text-ink-muted", className)}>
      <Clock className="size-4 shrink-0" aria-hidden />
      Next free {formatDay(at).replace(/^(Today|Tomorrow)$/, (d) => d.toLowerCase())} at {formatTime(at)}
    </span>
  );
}
