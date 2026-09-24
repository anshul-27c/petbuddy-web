"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { PageSkeleton } from "@/components/ui/skeleton";
import { loginHref, useAuth } from "./auth-provider";

/**
 * Client-side guard for signed-in pages. Renders a neutral skeleton until the
 * stored token has been read, then either the page or a redirect to sign in.
 */
export function RequireAuth({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  const { status, exiting } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // After a deliberate sign-out the caller navigates; only bounce unexpected sign-outs.
    if (status === "signedOut" && !exiting) {
      router.replace(loginHref(pathname + window.location.search));
    }
  }, [status, exiting, router, pathname]);

  if (status !== "signedIn") return <>{fallback ?? <PageSkeleton />}</>;
  return <>{children}</>;
}
