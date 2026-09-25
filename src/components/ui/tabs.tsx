import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * A segmented control of links for switching between views of one list. The
 * segments share one width, so the thumb slides between them.
 */
export function LinkTabs({
  items,
  current,
  label,
}: {
  items: { key: string; label: string; href: string }[];
  current: string;
  label: string;
}) {
  const index = Math.max(
    0,
    items.findIndex((item) => item.key === current),
  );
  return (
    <nav
      aria-label={label}
      className="relative inline-grid auto-cols-fr grid-flow-col rounded-full border border-hairline bg-surface p-1 shadow-card"
    >
      <span
        aria-hidden
        className="absolute inset-y-1 left-1 rounded-full bg-leash shadow-cta transition-transform duration-300 ease-out-soft"
        style={{ width: `calc((100% - 0.5rem) / ${items.length})`, transform: `translateX(${index * 100}%)` }}
      />
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
              "relative inline-flex min-h-10 min-w-28 items-center justify-center rounded-full px-4 text-sm font-semibold transition-colors duration-200",
              active ? "text-surface" : "text-ink-muted hover:text-ink",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
