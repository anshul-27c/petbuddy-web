import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** The centred page column: 16 px gutters on phones, capped width on desktop. */
export function Container({
  children,
  className,
  width = "wide",
}: {
  children: ReactNode;
  className?: string;
  width?: "wide" | "narrow" | "medium";
}) {
  return (
    <div
      className={cn(
        "mx-auto w-full px-4 sm:px-6",
        width === "wide" && "max-w-6xl",
        width === "medium" && "max-w-4xl",
        width === "narrow" && "max-w-2xl",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function PageHeader({
  title,
  subtitle,
  action,
  back,
  className,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
  back?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("pt-6 pb-5 sm:pt-10 sm:pb-6", className)}>
      {back ? <div className="mb-3">{back}</div> : null}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <h1 className="font-display text-headline font-semibold sm:text-display">{title}</h1>
          {subtitle ? <div className="mt-1.5 text-body text-ink-muted">{subtitle}</div> : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
    </div>
  );
}
