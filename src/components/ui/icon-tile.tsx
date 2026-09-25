import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type IconTileTone = "leash" | "trail" | "tail" | "amber" | "alert" | "muted";

const TONES: Record<IconTileTone, string> = {
  leash: "bg-sky text-leash",
  trail: "bg-trail-soft text-trail",
  tail: "bg-tail-soft text-tail",
  amber: "bg-amber-soft text-amber",
  alert: "bg-alert-soft text-alert",
  muted: "bg-canvas text-ink-muted",
};

const SIZES = {
  sm: "size-8 rounded-[10px] [&_svg]:size-4",
  md: "size-10 rounded-field [&_svg]:size-5",
  lg: "size-12 rounded-field [&_svg]:size-6",
  xl: "size-14 rounded-card [&_svg]:size-7",
} as const;

/** An icon on a soft tinted squircle: the one icon container used on cards and rows. */
export function IconTile({
  children,
  tone = "leash",
  size = "md",
  className,
}: {
  children: ReactNode;
  tone?: IconTileTone;
  size?: keyof typeof SIZES;
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={cn(
        "inline-flex shrink-0 items-center justify-center shadow-[inset_0_1px_0_rgb(255_255_255/0.7)]",
        TONES[tone],
        SIZES[size],
        className,
      )}
    >
      {children}
    </span>
  );
}
