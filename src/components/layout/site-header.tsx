"use client";

import { LogOut, Menu, ShoppingBag, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { loginHref, useAuth } from "@/components/auth/auth-provider";
import { useCartDrawer } from "@/components/store/cart-drawer";
import { useCartQuantities } from "@/components/store/use-cart";
import { ButtonLink } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { ACCOUNT_LINKS, AccountMenu, useSignOutAndLeave } from "./account-menu";
import { Logo } from "./logo";
import { NotificationsMenu } from "./notifications-menu";
import { useUnreadMessages } from "./use-activity";

interface NavItem {
  href: string;
  label: string;
  dot?: boolean;
}

function isActive(pathname: string, href: string) {
  // "/account" has its own children in the menu, so it only matches itself.
  if (href === "/" || href === "/account") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavLink({ item, pathname, className }: { item: NavItem; pathname: string; className?: string }) {
  const active = isActive(pathname, item.href);
  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "relative inline-flex min-h-11 items-center gap-2 rounded-field px-3 text-sm font-semibold transition-colors",
        active ? "bg-sky text-leash-dark" : "text-ink hover:bg-canvas",
        className,
      )}
    >
      {item.label}
      {item.dot ? (
        <span className="size-2 rounded-full bg-leash">
          <span className="sr-only">, unread messages</span>
        </span>
      ) : null}
    </Link>
  );
}

function CartButton() {
  const { openCart } = useCartDrawer();
  const { count } = useCartQuantities();
  return (
    <button
      type="button"
      onClick={openCart}
      className="relative inline-flex size-11 items-center justify-center rounded-full text-ink hover:bg-canvas"
      aria-label={count > 0 ? `Basket, ${count} ${count === 1 ? "item" : "items"}` : "Basket"}
    >
      <ShoppingBag className="size-5" aria-hidden />
      {count > 0 ? (
        <span className="absolute top-1 right-0.5 inline-flex min-w-4.5 items-center justify-center rounded-full bg-leash px-1 text-[0.625rem] leading-4.5 font-bold text-surface tabular-nums">
          {count > 99 ? "99+" : count}
        </span>
      ) : null}
    </button>
  );
}

export function SiteHeader() {
  const { status } = useAuth();
  const pathname = usePathname();
  const unread = useUnreadMessages();
  const signOutAndLeave = useSignOutAndLeave();
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPath, setMenuPath] = useState(pathname);

  // Close the phone menu whenever the route changes.
  if (menuPath !== pathname) {
    setMenuPath(pathname);
    setMenuOpen(false);
  }

  const signedIn = status === "signedIn";
  const nav: NavItem[] = signedIn
    ? [
        { href: "/carers", label: "Find carers" },
        { href: "/store", label: "Store" },
        { href: "/bookings", label: "Bookings" },
        { href: "/messages", label: "Messages", dot: unread > 0 },
      ]
    : [
        { href: "/carers", label: "Find carers" },
        { href: "/store", label: "Store" },
        { href: "/become-a-carer", label: "Become a carer" },
      ];

  return (
    <header className="sticky top-0 z-40 border-b border-hairline bg-surface/95 backdrop-blur supports-[backdrop-filter]:bg-surface/85">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-field focus:bg-surface focus:px-4 focus:py-2 focus:shadow-float"
      >
        Skip to content
      </a>
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-2 px-4 sm:px-6">
        <Logo className="mr-2 shrink-0" />

        <nav aria-label="Main" className="hidden flex-1 items-center gap-1 md:flex">
          {nav.map((item) => (
            <NavLink key={item.href} item={item} pathname={pathname} />
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-0.5">
          {status === "loading" ? (
            <Skeleton className="h-10 w-24 rounded-full" />
          ) : signedIn ? (
            <>
              <NotificationsMenu />
              <CartButton />
              <div className="hidden md:block">
                <AccountMenu />
              </div>
            </>
          ) : (
            pathname === "/login" ? null : (
              <ButtonLink href={loginHref(pathname)} variant="tonal">
                Sign in
              </ButtonLink>
            )
          )}
          <button
            type="button"
            className="inline-flex size-11 items-center justify-center rounded-full text-ink hover:bg-canvas md:hidden"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X className="size-5" aria-hidden /> : <Menu className="size-5" aria-hidden />}
          </button>
        </div>
      </div>

      <div id="mobile-menu" hidden={!menuOpen} className="border-t border-hairline bg-surface md:hidden">
        <nav aria-label="Main menu" className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-3">
          {nav.map((item) => (
            <NavLink key={item.href} item={item} pathname={pathname} className="w-full" />
          ))}
          {signedIn ? (
            <>
              <div className="my-2 border-t border-hairline" />
              {ACCOUNT_LINKS.map((link) => (
                <NavLink key={link.href} item={link} pathname={pathname} className="w-full" />
              ))}
              <button
                type="button"
                onClick={() => void signOutAndLeave()}
                className="inline-flex min-h-11 w-full items-center gap-2 rounded-field px-3 text-sm font-semibold text-alert hover:bg-alert-soft"
              >
                <LogOut className="size-4" aria-hidden />
                Sign out
              </button>
            </>
          ) : null}
        </nav>
      </div>
    </header>
  );
}
