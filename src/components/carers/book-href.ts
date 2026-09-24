"use client";

import { loginHref, useAuth } from "@/components/auth/auth-provider";

/** Where "Book" goes: straight into the flow, or to sign in first and then back. */
export function useBookHref(earnerId: string, params?: Record<string, string | undefined>): string {
  const { status } = useAuth();
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params ?? {})) {
    if (value) search.set(key, value);
  }
  const query = search.toString();
  const target = `/book/${earnerId}${query ? `?${query}` : ""}`;
  return status === "signedOut" ? loginHref(target) : target;
}
