import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export const STEPS = ["Service", "Pet", "When", "Where"] as const;

/** The four booking steps. Finished steps can be revisited; later ones cannot be skipped to. */
export function Stepper({
  current,
  canOpen,
  onOpen,
}: {
  current: number;
  canOpen: (step: number) => boolean;
  onOpen: (step: number) => void;
}) {
  return (
    <ol className="grid grid-cols-4 gap-1.5 sm:gap-3" aria-label="Booking steps">
      {STEPS.map((label, index) => {
        const done = index < current;
        const active = index === current;
        const openable = !active && canOpen(index);
        return (
          <li key={label}>
            <button
              type="button"
              disabled={!openable}
              onClick={() => onOpen(index)}
              aria-current={active ? "step" : undefined}
              className={cn(
                "flex w-full flex-col items-center gap-1.5 rounded-field py-1.5 text-center transition-colors sm:flex-row sm:gap-2 sm:px-2 sm:text-left",
                openable && "hover:bg-canvas",
                !openable && !active && "cursor-default",
              )}
            >
              <span
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-bold",
                  active && "bg-leash text-surface",
                  done && !active && "bg-trail-soft text-trail",
                  !done && !active && "bg-canvas text-ink-muted",
                )}
              >
                {done && !active ? <Check className="size-4" strokeWidth={3} aria-hidden /> : index + 1}
              </span>
              <span className={cn("text-small font-semibold sm:text-sm", active ? "text-ink" : "text-ink-muted")}>
                {label}
                {done && !active ? <span className="sr-only"> (done)</span> : null}
              </span>
            </button>
            <div
              aria-hidden
              className={cn("mt-1.5 h-1 rounded-full", index <= current ? "bg-leash" : "bg-hairline")}
            />
          </li>
        );
      })}
    </ol>
  );
}
