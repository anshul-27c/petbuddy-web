"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Logo } from "./logo";

const COLUMNS = [
  {
    title: "Pet care",
    links: [
      { href: "/carers", label: "Find a carer" },
      { href: "/carers?availableToday=true", label: "Available today" },
      { href: "/bookings", label: "Your bookings" },
      { href: "/messages", label: "Messages" },
    ],
  },
  {
    title: "Store",
    links: [
      { href: "/store", label: "Pet store" },
      { href: "/orders", label: "Your orders" },
    ],
  },
  {
    title: "PetBuddy",
    links: [
      { href: "/become-a-carer", label: "Become a carer" },
      { href: "/account", label: "Your account" },
    ],
  },
];

export function SiteFooter() {
  // An open conversation is a full-screen chat on phones, with nothing to
  // scroll to below it.
  const inThread = /^\/messages\/[^/]+/.test(usePathname() ?? "");

  return (
    <footer className={cn("border-t border-hairline bg-surface", inThread && "hidden lg:block")}>
      <div className="container-page grid gap-8 py-10 sm:py-12 md:grid-cols-[1.5fr_3fr] md:gap-10">
        <div>
          <Logo />
          <p className="mt-4 max-w-xs text-sm text-ink-muted">
            Vetted carers for walks, sitting, boarding, grooming and vet visits, close to home.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-4 sm:gap-6">
          {COLUMNS.map((column) => (
            <nav key={column.title} aria-label={column.title} className="min-w-0">
              <h2 className="text-sm font-bold text-ink">{column.title}</h2>
              <ul className="mt-2">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="inline-flex min-h-11 items-center text-sm text-ink-muted transition-colors hover:text-leash-dark"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
      </div>
    </footer>
  );
}
