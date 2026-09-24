"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/account", label: "Profile" },
  { href: "/account/pets", label: "Pets" },
  { href: "/account/addresses", label: "Addresses" },
  { href: "/account/favourites", label: "Favourites" },
  { href: "/orders", label: "Orders" },
];

/** Tabs across the account pages. Scrolls sideways on narrow screens. */
export function AccountNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Account" className="scrollbar-none relative -mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
      <ul className="flex min-w-max gap-1 border-b border-hairline">
        {LINKS.map((link) => {
          const active = link.href === "/orders" ? pathname.startsWith("/orders") : pathname === link.href;
          return (
            <li key={link.href}>
              <Link
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "-mb-px inline-flex min-h-11 items-center border-b-2 px-3 text-sm font-semibold transition-colors",
                  active ? "border-leash text-leash-dark" : "border-transparent text-ink-muted hover:text-ink",
                )}
              >
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
