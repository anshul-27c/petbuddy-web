import { Check } from "lucide-react";
import type { ReactNode } from "react";
import { initials } from "@/lib/labels";
import { cn } from "@/lib/utils";

const SIZES = {
  xs: "size-7 text-label",
  sm: "size-9 text-small",
  md: "size-11 text-sm",
  lg: "size-14 text-body",
  xl: "size-18 text-title",
  // The profile hero: 72 px on phones, 96 px from 640 px up.
  hero: "size-18 text-title sm:size-24 sm:text-headline",
} as const;

/** Initials on the brand tint. An icon can stand in for pets. */
export function Avatar({
  name,
  size = "md",
  verified = false,
  icon,
  className,
}: {
  name: string;
  size?: keyof typeof SIZES;
  verified?: boolean;
  icon?: ReactNode;
  className?: string;
}) {
  return (
    <span className={cn("relative inline-flex shrink-0", className)}>
      <span
        aria-hidden
        className={cn(
          "inline-flex items-center justify-center rounded-full bg-linear-to-br from-sky to-leash-tint font-bold text-leash-dark ring-1 ring-leash/10",
          SIZES[size],
        )}
      >
        {icon ?? initials(name)}
      </span>
      {verified ? (
        <span
          className="absolute -right-0.5 -bottom-0.5 inline-flex size-4.5 items-center justify-center rounded-full border-2 border-surface bg-trail text-surface"
          title="ID verified"
        >
          <Check className="size-2.5" strokeWidth={4} aria-hidden />
          <span className="sr-only">ID verified</span>
        </span>
      ) : null}
    </span>
  );
}
