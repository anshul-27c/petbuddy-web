import { Check } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ChipProps extends Omit<ComponentProps<"button">, "onChange"> {
  selected: boolean;
  icon?: ReactNode;
}

/** A toggle chip. `aria-pressed` carries the state for assistive tech; the tick pops in when it is on. */
export function Chip({ selected, icon, className, children, type = "button", ...rest }: ChipProps) {
  return (
    <button
      type={type}
      aria-pressed={selected}
      className={cn(
        "inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full border px-4 text-sm font-semibold whitespace-nowrap",
        "transition duration-150 ease-out active:scale-97",
        selected
          ? "border-leash bg-sky text-leash-dark shadow-[inset_0_0_0_1px_var(--color-leash)]"
          : "border-hairline bg-surface text-ink shadow-card hover:border-ink-faint hover:bg-mist",
        className,
      )}
      {...rest}
    >
      {selected ? (
        <Check className="size-4 animate-pop-in" strokeWidth={2.75} aria-hidden />
      ) : icon ? (
        <span className="inline-flex text-ink-muted" aria-hidden>
          {icon}
        </span>
      ) : null}
      {children}
    </button>
  );
}

/** A static tag, for services or temperament on cards. */
export function Tag({
  children,
  icon,
  tone = "canvas",
  className,
}: {
  children: ReactNode;
  icon?: ReactNode;
  tone?: "canvas" | "sky" | "trail";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-3 py-1 text-small font-medium",
        tone === "canvas" && "bg-canvas text-ink-muted",
        tone === "sky" && "bg-sky text-leash-dark",
        tone === "trail" && "bg-trail-soft text-trail",
        className,
      )}
    >
      {icon}
      {children}
    </span>
  );
}
