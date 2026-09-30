import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * The two white paws on the brand tile, with the wordmark in the brand serif
 * (its only use on the site). `compact`: inside an `@container` that gets too
 * narrow (a small phone with large text), only the tile shows.
 */
export function Logo({
  className,
  tone = "ink",
  compact = false,
}: {
  className?: string;
  tone?: "ink" | "light";
  compact?: boolean;
}) {
  return (
    <Link href="/" className={cn("inline-flex min-w-0 items-center gap-2 rounded-field sm:gap-3", className)} aria-label="PetBuddy home">
      <LogoMark />
      <span
        className={cn(
          "font-brand text-xl font-semibold tracking-tight whitespace-nowrap sm:text-2xl",
          compact && "@max-[19rem]:hidden",
          tone === "light" ? "text-surface" : "text-ink",
        )}
      >
        PetBuddy
      </span>
    </Link>
  );
}

export function LogoMark({ size = "md" }: { size?: "md" | "lg" }) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-tile bg-leash",
        size === "md" ? "size-9" : "size-14 rounded-field",
      )}
      aria-hidden
    >
      <Image src="/paw_mark.png" width={468} height={448} alt="" className={size === "md" ? "h-auto w-6" : "h-auto w-9"} loading="eager" />
    </span>
  );
}
