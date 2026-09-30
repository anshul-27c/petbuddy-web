import { formatMoney } from "@/lib/format";
import { cn } from "@/lib/utils";

/** An amount in paise, with tabular figures. `display` sets it semibold, for prices and totals that lead. */
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
      <s className={cn("tabular-nums text-ink-muted", className)}>
        <span className="sr-only">Was </span>
        {text}
      </s>
    );
  }
  return (
    <span className={cn("tabular-nums", display && "font-semibold", className)}>
      {text}
      {suffix ? <span className="text-caption font-normal tracking-normal text-ink-muted">{suffix}</span> : null}
    </span>
  );
}
