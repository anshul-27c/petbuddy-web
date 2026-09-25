import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

/** The two white paws on the brand tile, with the wordmark set in Fraunces. */
export function Logo({ className, tone = "ink" }: { className?: string; tone?: "ink" | "light" }) {
  return (
    <Link href="/" className={cn("inline-flex items-center gap-3 rounded-field", className)} aria-label="PetBuddy home">
      <LogoMark />
      <span className={cn("font-display text-[1.375rem] font-semibold tracking-tight", tone === "light" ? "text-surface" : "text-ink")}>
        PetBuddy
      </span>
    </Link>
  );
}

export function LogoMark({ size = "md" }: { size?: "md" | "lg" }) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-[10px] bg-leash",
        size === "md" ? "size-9" : "size-14 rounded-field",
      )}
      aria-hidden
    >
      <Image src="/paw_mark.png" width={468} height={448} alt="" className={size === "md" ? "h-auto w-6" : "h-auto w-9"} loading="eager" />
    </span>
  );
}
