import { Check } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ChipProps extends Omit<ComponentProps<"button">, "onChange"> {
  selected: boolean;
  icon?: ReactNode;
}

/** A toggle chip. `aria-pressed` carries the state for assistive tech. */
export function Chip({ selected, icon, className, children, type = "button", ...rest }: ChipProps) {
  return (
    <button
      type={type}
      aria-pressed={selected}
      className={cn(
        "inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-full border px-4 text-sm font-medium whitespace-nowrap transition-colors",
        selected
          ? "border-leash bg-sky text-leash-dark"
          : "border-hairline bg-surface text-ink hover:border-ink-faint",
        className,
      )}
      {...rest}
    >
      {selected ? <Check className="size-4" aria-hidden /> : icon}
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
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-small font-medium",
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
