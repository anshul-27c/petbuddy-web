"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { ACCOUNT_LINKS } from "@/components/layout/account-menu";
import { Container, PageHeader } from "@/components/layout/container";
import { cn } from "@/lib/utils";

/**
 * The account sections (the same five, with the same names, as the account
 * menu in the header): a sideways-scrolling row of pills on phones and
 * tablets, a list down the side from 1024 px.
 */
export function AccountNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Account">
      <ul className="rail gap-2 lg:sticky lg:top-24 lg:mx-0 lg:flex-col lg:gap-1 lg:overflow-visible lg:px-0">
        {ACCOUNT_LINKS.map(({ href, label, icon: Icon }) => {
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

/**
 * The frame for every account page: title, the section nav, then the page
 * itself. The page column fills the rest of the page area, so an empty state
 * centres in it (beside the nav from 1024 px, under it below that).
 */
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
    <Container grow>
      <PageHeader title={title} subtitle={subtitle} action={action} />
      <div className="flex flex-1 flex-col gap-6 sm:gap-8 lg:grid lg:grid-cols-[13rem_minmax(0,1fr)] lg:gap-10">
        <AccountNav />
        <div className="flex min-w-0 flex-1 flex-col">{children}</div>
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
