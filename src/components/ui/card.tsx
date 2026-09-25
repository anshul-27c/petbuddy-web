import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

interface CardProps extends ComponentProps<"div"> {
  tone?: "plain" | "selected" | "pinned" | "quiet";
  /** `standard` is 16 px on phones and 20 px from 640 px up: the one card padding used everywhere. */
  inset?: "standard" | "none";
}

/** White on the canvas with a hairline border and a whisper of shadow. */
export function Card({ tone = "plain", inset = "standard", className, ...rest }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-card border",
        tone === "plain" && "border-hairline bg-surface shadow-card",
        tone === "selected" && "border-leash bg-sky",
        tone === "pinned" && "border-leash bg-surface shadow-card",
        tone === "quiet" && "border-hairline bg-mist",
        inset === "standard" && "p-4 sm:p-5",
        className,
      )}
      {...rest}
    />
  );
}

/** A card-level heading: sans, semibold, 17 px. */
export function CardTitle({
  as: Tag = "h2",
  className,
  ...rest
}: ComponentProps<"h2"> & { as?: "h2" | "h3" }) {
  return <Tag className={cn("text-title font-semibold text-ink", className)} {...rest} />;
}

export function Divider({ className }: { className?: string }) {
  return <hr className={cn("border-0 border-t border-hairline", className)} />;
}
