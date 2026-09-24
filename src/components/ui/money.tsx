import { formatMoney } from "@/lib/format";
import { cn } from "@/lib/utils";

/** An amount in paise, with tabular figures. `display` sets it in Fraunces. */
export function Money({
  paise,
  suffix,
  display = false,
  strike = false,
  className,
}: {
  paise: number;
  suffix?: string;
  display?: boolean;
  strike?: boolean;
  className?: string;
}) {
  const text = formatMoney(paise);
  if (strike) {
    return (
      <s className={cn("tabular-nums text-ink-faint", className)}>
        <span className="sr-only">Was </span>
        {text}
      </s>
    );
  }
  return (
    <span className={cn("tabular-nums", display && "font-display font-semibold", className)}>
      {text}
      {suffix ? <span className="font-sans text-small font-medium text-ink-muted">{suffix}</span> : null}
    </span>
  );
}
