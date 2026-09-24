import Link from "next/link";
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
  return (
    <footer className="mt-16 border-t border-hairline bg-surface">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-10 sm:px-6 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div>
          <Logo />
          <p className="mt-3 max-w-xs text-sm text-ink-muted">
            Vetted carers for walks, sitting, boarding, grooming and vet visits, close to home.
          </p>
        </div>
        {COLUMNS.map((column) => (
          <nav key={column.title} aria-label={column.title}>
            <h2 className="text-sm font-bold">{column.title}</h2>
            <ul className="mt-2">
              {column.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="inline-flex min-h-11 items-center text-sm text-ink-muted hover:text-leash-dark"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
    </footer>
  );
}
