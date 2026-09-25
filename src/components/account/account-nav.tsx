"use client";

import { Heart, MapPin, Package, PawPrint, UserRound } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Container, PageHeader } from "@/components/layout/container";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/account", label: "Profile", icon: UserRound },
  { href: "/account/pets", label: "Pets", icon: PawPrint },
  { href: "/account/addresses", label: "Addresses", icon: MapPin },
  { href: "/account/favourites", label: "Favourites", icon: Heart },
  { href: "/orders", label: "Orders", icon: Package },
];

/**
 * The account sections: a sideways-scrolling row of pills on phones and
 * tablets, a list down the side from 1024 px.
 */
export function AccountNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Account">
      <ul className="rail gap-2 lg:sticky lg:top-24 lg:mx-0 lg:flex-col lg:gap-1 lg:overflow-visible lg:px-0">
        {LINKS.map(({ href, label, icon: Icon }) => {
          const active = href === "/orders" ? pathname.startsWith("/orders") : pathname === href;
          return (
            <li key={href} className="shrink-0">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-sm font-semibold whitespace-nowrap transition-colors duration-150",
                  "lg:flex lg:w-full lg:rounded-field lg:border-transparent lg:px-3",
                  active
                    ? "border-leash bg-sky text-leash-dark lg:border-transparent"
                    : "border-hairline bg-surface text-ink-muted hover:text-ink lg:bg-transparent lg:hover:bg-surface",
                )}
              >
                <Icon className={cn("size-4", active ? "text-leash" : "text-ink-faint")} aria-hidden />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/** The frame for every account page: title, the section nav, then the page itself. */
export function AccountShell({
  title,
  subtitle,
  action,
  children,
}: {
  title: string;
  subtitle?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <Container>
      <PageHeader title={title} subtitle={subtitle} action={action} />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[13rem_minmax(0,1fr)] lg:gap-10">
        <AccountNav />
        <div className="min-w-0">{children}</div>
      </div>
    </Container>
  );
}

/**
 * A dashed "add another" tile. Shown only when a two-column list has an odd
 * count, so the last row is never half empty.
 */
export function AddTile({ label, icon, onClick }: { label: string; icon: ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex min-h-40 w-full flex-col items-center justify-center gap-3 rounded-card border border-dashed border-hairline bg-mist p-4 text-sm font-semibold text-ink-muted transition duration-150 hover:border-leash hover:bg-sky hover:text-leash-dark sm:p-5"
    >
      <span className="flex size-12 items-center justify-center rounded-full bg-surface text-leash shadow-card transition-transform duration-200 group-hover:scale-110 [&_svg]:size-5">
        {icon}
      </span>
      {label}
    </button>
  );
}
