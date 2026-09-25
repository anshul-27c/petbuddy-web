"use client";

import { ChevronDown, Heart, LogOut, MapPin, Package, PawPrint, UserRound } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/components/auth/auth-provider";
import { Avatar } from "@/components/ui/avatar";
import { Popover } from "@/components/ui/popover";
import { useToast } from "@/components/ui/toast";
import { formatPhone } from "@/lib/format";

export const ACCOUNT_LINKS = [
  { href: "/account", label: "Account", icon: UserRound },
  { href: "/account/pets", label: "My pets", icon: PawPrint },
  { href: "/account/addresses", label: "Addresses", icon: MapPin },
  { href: "/account/favourites", label: "Favourites", icon: Heart },
  { href: "/orders", label: "Store orders", icon: Package },
] as const;

export function useSignOutAndLeave() {
  const { signOut } = useAuth();
  const toast = useToast();
  return async () => {
    await signOut("/");
    toast({ title: "You have signed out", tone: "info" });
  };
}

export function AccountMenu() {
  const { user } = useAuth();
  const signOutAndLeave = useSignOutAndLeave();
  const name = user?.name?.trim() || "Your account";

  return (
    <Popover
      panelClassName="absolute top-full right-0 mt-2 w-64 p-2"
      trigger={(props) => (
        <button
          type="button"
          {...props}
          className="inline-flex min-h-11 items-center gap-2 rounded-full py-1 pr-2 pl-1 transition-colors duration-150 hover:bg-canvas"
          aria-label="Account menu"
        >
          <Avatar
            name={user?.name?.trim() || "You"}
            size="sm"
            icon={user?.name?.trim() ? undefined : <UserRound className="size-4" aria-hidden />}
          />
          <ChevronDown className="size-4 text-ink-muted" aria-hidden />
        </button>
      )}
    >
      {(close) => (
        <div>
          <div className="border-b border-hairline px-3 pt-2 pb-3">
            <p className="truncate font-semibold">{name}</p>
            {user?.phone ? <p className="mt-1 text-sm text-ink-muted">{formatPhone(user.phone)}</p> : null}
          </div>
          <ul className="py-1">
            {ACCOUNT_LINKS.map(({ href, label, icon: Icon }) => (
              <li key={href}>
                <Link
                  href={href}
                  onClick={close}
                  className="flex min-h-11 items-center gap-3 rounded-field px-3 text-sm font-medium transition-colors duration-150 hover:bg-canvas"
                >
                  <Icon className="size-4 text-ink-muted" aria-hidden />
                  {label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="border-t border-hairline pt-1">
            <button
              type="button"
              onClick={() => {
                close();
                void signOutAndLeave();
              }}
              className="flex min-h-11 w-full items-center gap-3 rounded-field px-3 text-sm font-medium text-alert hover:bg-alert-soft"
            >
              <LogOut className="size-4" aria-hidden />
              Sign out
            </button>
          </div>
        </div>
      )}
    </Popover>
  );
}
