import Link from "next/link";
import { cn } from "@/lib/utils";

/** A segmented set of links for switching between views of one list. */
export function LinkTabs({
  items,
  current,
  label,
}: {
  items: { key: string; label: string; href: string }[];
  current: string;
  label: string;
}) {
  return (
    <nav aria-label={label} className="inline-flex rounded-full border border-hairline bg-surface p-1">
      {items.map((item) => {
        const active = item.key === current;
        return (
          <Link
            key={item.key}
            href={item.href}
            replace
            scroll={false}
            aria-current={active ? "page" : undefined}
            className={cn(
              "inline-flex min-h-10 min-w-24 items-center justify-center rounded-full px-4 text-sm font-semibold transition-colors",
              active ? "bg-leash text-surface" : "text-ink-muted hover:text-ink",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
