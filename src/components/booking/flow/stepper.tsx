import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export const STEPS = ["Service", "Pet", "When", "Where"] as const;

/**
 * The four booking steps over one progress track. Finished steps can be
 * revisited; later ones cannot be skipped to.
 */
export function Stepper({
  current,
  canOpen,
  onOpen,
}: {
  current: number;
  canOpen: (step: number) => boolean;
  onOpen: (step: number) => void;
}) {
  const progress = ((current + 1) / STEPS.length) * 100;
  return (
    <div className="rounded-card border border-hairline bg-surface p-2 shadow-card sm:p-3">
      <ol className="grid grid-cols-4 gap-1 sm:gap-2" aria-label="Booking steps">
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
                  "flex min-h-11 w-full flex-col items-center gap-1 rounded-field px-1 py-2 text-center transition-colors duration-150 sm:flex-row sm:gap-3 sm:px-3 sm:text-left",
                  openable && "hover:bg-mist",
                  active && "bg-sky",
                  !openable && !active && "cursor-default",
                )}
              >
                <span
                  className={cn(
                    "flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-bold transition-colors duration-200",
                    active && "bg-leash text-surface shadow-cta",
                    done && !active && "bg-trail text-surface",
                    !done && !active && "border border-hairline bg-surface text-ink-muted",
                  )}
                >
                  {done && !active ? (
                    <Check className="size-4 animate-pop-in" strokeWidth={3} aria-hidden />
                  ) : (
                    index + 1
                  )}
                </span>
                <span className={cn("text-small font-semibold sm:text-sm", active ? "text-leash-dark" : "text-ink-muted")}>
                  {label}
                  {done && !active ? <span className="sr-only"> (done)</span> : null}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
      <div aria-hidden className="mx-2 mt-2 h-1 overflow-hidden rounded-full bg-canvas sm:mx-3">
        <div
          className="h-full rounded-full bg-linear-to-r from-leash to-leash-dark transition-[width] duration-500 ease-out-soft"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
