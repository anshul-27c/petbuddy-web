import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface CardProps extends ComponentProps<"div"> {
  tone?: "plain" | "selected" | "pinned";
  inset?: "standard" | "tight" | "none";
}

/** White on the canvas with a hairline border and no shadow. */
export function Card({ tone = "plain", inset = "standard", className, ...rest }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-card border",
        tone === "plain" && "border-hairline bg-surface",
        tone === "selected" && "border-leash bg-sky",
        tone === "pinned" && "border-leash bg-surface",
        inset === "standard" && "p-4 sm:p-5",
        inset === "tight" && "p-3",
        className,
      )}
      {...rest}
    />
  );
}

export function SectionTitle({
  title,
  subtitle,
  action,
  as: Tag = "h2",
  id,
  className,
}: {
  id?: string;
  title: string;
  subtitle?: string;
  action?: ReactNode;
  as?: "h2" | "h3";
  className?: string;
}) {
  return (
    <div className={cn("mb-3 flex items-end justify-between gap-4", className)}>
      <div className="min-w-0">
        <Tag id={id} className="text-subhead font-bold text-ink">
          {title}
        </Tag>
        {subtitle ? <p className="mt-0.5 text-sm text-ink-muted">{subtitle}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export function Divider({ className }: { className?: string }) {
  return <hr className={cn("border-0 border-t border-hairline", className)} />;
}
