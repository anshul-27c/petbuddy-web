import { Check } from "lucide-react";
import { ORDER_STATUS_LABELS } from "@/lib/labels";
import type { OrderStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

const FLOW: OrderStatus[] = ["placed", "packed", "shipped", "delivered"];

/** Placed → packed → shipped → delivered. */
export function OrderSteps({ status }: { status: OrderStatus }) {
  const current = FLOW.indexOf(status);
  return (
    <ol className="grid grid-cols-4 gap-2" aria-label="Order progress">
      {FLOW.map((step, index) => {
        const done = index <= current;
        return (
          <li key={step} className="flex flex-col items-center text-center" aria-current={index === current ? "step" : undefined}>
            <div className="flex w-full items-center">
              <span
                className={cn(
                  "h-1 flex-1 rounded-full transition-colors duration-300",
                  index === 0 ? "invisible" : done ? "bg-trail" : "bg-hairline",
                )}
              />
              <span
                className={cn(
                  "mx-1 flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-bold",
                  done ? "bg-trail text-surface shadow-card" : "border border-hairline bg-surface text-ink-muted",
                  index === current && "ring-4 ring-trail-soft",
                )}
              >
                {done ? <Check className="size-4" strokeWidth={3} aria-hidden /> : index + 1}
              </span>
              <span
                className={cn(
                  "h-1 flex-1 rounded-full",
                  index === FLOW.length - 1 ? "invisible" : index < current ? "bg-trail" : "bg-hairline",
                )}
              />
            </div>
            <span className={cn("mt-2 text-small font-semibold", done ? "text-ink" : "text-ink-muted")}>
              {ORDER_STATUS_LABELS[step]}
              <span className="sr-only">{done ? " (done)" : " (not yet)"}</span>
            </span>
          </li>
        );
      })}
    </ol>
  );
}
