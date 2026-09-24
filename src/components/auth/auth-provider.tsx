"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { usePathname, useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { api, setUnauthorizedHandler } from "@/lib/api";
import { clearToken, getToken, setToken, subscribeToken, TOKEN_KEY } from "@/lib/auth-token";
import { qk } from "@/lib/query-keys";
import type { AuthSession, UserProfile } from "@/lib/types";

/** `loading` until the browser has read the stored token (never during SSR). */
export type AuthStatus = "loading" | "signedOut" | "signedIn";

interface AuthContextValue {
  status: AuthStatus;
  user: UserProfile | null;
  /** True while leaving on purpose (sign-out, account deleted), so guards do not bounce to sign-in. */
  exiting: boolean;
  signIn: (session: AuthSession) => void;
  /** Revokes the token, forgets it locally and goes to `redirectTo`. */
  signOut: (redirectTo?: string) => Promise<void>;
  /** Forgets the token locally (it is already revoked) and goes to `redirectTo`. */
  endSession: (redirectTo?: string) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const serverSnapshot = () => undefined;

export function AuthProvider({ children }: { children: ReactNode }) {
  const token = useSyncExternalStore(subscribeToken, getToken, serverSnapshot);
  const status: AuthStatus = token === undefined ? "loading" : token ? "signedIn" : "signedOut";
  const queryClient = useQueryClient();
  const router = useRouter();
  const pathname = usePathname();
  const [exiting, setExiting] = useState(false);
  const [exitPath, setExitPath] = useState<string | null>(null);

  // A deliberate exit is over once the navigation away has happened.
  if (exiting && exitPath !== null && pathname !== exitPath) {
    setExiting(false);
    setExitPath(null);
  }

  const me = useQuery({
    queryKey: qk.me,
    queryFn: api.me.get,
    enabled: status === "signedIn",
    staleTime: 5 * 60_000,
  });

  // Any 401 clears the token (in the API client) and sends the person to sign in.
  useEffect(() => {
    setUnauthorizedHandler(() => {
      queryClient.clear();
      const { pathname, search } = window.location;
      if (pathname.startsWith("/login")) return;
      router.replace(`/login?next=${encodeURIComponent(pathname + search)}`);
    });
    return () => setUnauthorizedHandler(null);
  }, [queryClient, router]);

  // Signing out in another tab drops this tab's cached personal data too.
  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === TOKEN_KEY || event.key === null) queryClient.clear();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [queryClient]);

  const signIn = useCallback(
    (session: AuthSession) => {
      queryClient.clear();
      setExiting(false);
      setExitPath(null);
      setToken(session.token);
      queryClient.setQueryData(qk.me, { user: session.user, needsMode: session.needsMode });
    },
    [queryClient],
  );

  const endSession = useCallback(
    (redirectTo = "/") => {
      setExiting(true);
      setExitPath(pathname);
      clearToken();
      queryClient.clear();
      router.replace(redirectTo);
    },
    [pathname, queryClient, router],
  );

  const signOut = useCallback(
    async (redirectTo = "/") => {
      try {
        await api.auth.logout();
      } catch {
        // The token is dropped locally either way.
      }
      endSession(redirectTo);
    },
    [endSession],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      user: status === "signedIn" ? (me.data?.user ?? null) : null,
      exiting,
      signIn,
      signOut,
      endSession,
    }),
    [status, me.data, exiting, signIn, signOut, endSession],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthProvider");
  return value;
}

/** A sign-in link that brings the person back to `next` afterwards. */
export function loginHref(next: string): string {
  return `/login?next=${encodeURIComponent(next)}`;
}
