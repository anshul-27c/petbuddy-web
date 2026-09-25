import { Camera, Check, MessageSquareText, X } from "lucide-react";
import Image from "next/image";
import { formatDayTime } from "@/lib/format";
import { TIMELINE_LABELS } from "@/lib/labels";
import type { TimelineEvent } from "@/lib/types";
import { cn } from "@/lib/utils";

function Dot({ kind }: { kind: TimelineEvent["kind"] }) {
  const base = "relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full ring-4 ring-surface";
  if (kind === "cancelled") {
    return (
      <span className={cn(base, "bg-alert-soft text-alert")}>
        <X className="size-4" aria-hidden />
      </span>
    );
  }
  if (kind === "photoUpdate") {
    return (
      <span className={cn(base, "bg-sky text-leash")}>
        <Camera className="size-4" aria-hidden />
      </span>
    );
  }
  if (kind === "note") {
    return (
      <span className={cn(base, "bg-sky text-leash")}>
        <MessageSquareText className="size-4" aria-hidden />
      </span>
    );
  }
  return (
    <span className={cn(base, "bg-trail-soft text-trail")}>
      <Check className="size-4" strokeWidth={3} aria-hidden />
    </span>
  );
}

/** What has happened so far, oldest first, with photo updates inline. */
export function Timeline({ events }: { events: TimelineEvent[] }) {
  if (events.length === 0) {
    return (
      <p className="rounded-field bg-canvas px-4 py-3 text-sm text-ink-muted">
        Nothing has happened yet. Updates from your carer will appear here.
      </p>
    );
  }
  return (
    <ol className="relative">
      {events.map((event, index) => (
        <li key={`${event.kind}-${event.at}-${index}`} className="relative flex gap-4 pb-6 last:pb-0">
          {index < events.length - 1 ? (
            <span
              aria-hidden
              className="absolute top-8 bottom-0 left-4 w-0.5 -translate-x-1/2 bg-linear-to-b from-leash-tint to-hairline"
            />
          ) : null}
          <Dot kind={event.kind} />
          <div className="min-w-0 flex-1 pt-1">
            <p className="text-sm font-semibold">{TIMELINE_LABELS[event.kind] ?? "Update"}</p>
            <p className="mt-1 text-small text-ink-muted">
              <time dateTime={event.at}>{formatDayTime(event.at)}</time>
            </p>
            {event.note ? (
              <p className="mt-2 rounded-field bg-mist px-3 py-2 text-sm whitespace-pre-line">{event.note}</p>
            ) : null}
            {event.photoUrl ? (
              <a
                href={event.photoUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-3 block w-full max-w-xs overflow-hidden rounded-field border border-hairline shadow-card transition-shadow duration-200 hover:shadow-lift"
              >
                <Image
                  src={event.photoUrl}
                  alt={event.note ? `Photo update: ${event.note}` : "Photo update from your carer"}
                  width={640}
                  height={480}
                  unoptimized
                  className="h-auto w-full object-cover"
                />
                <span className="sr-only"> (opens the full photo)</span>
              </a>
            ) : null}
          </div>
        </li>
      ))}
    </ol>
  );
}
