/**
 * The customer bearer token, kept in localStorage.
 * A tiny external store so React can subscribe with useSyncExternalStore.
 */

export const TOKEN_KEY = "petbuddy.token";

const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token: string) {
  try {
    window.localStorage.setItem(TOKEN_KEY, token);
  } finally {
    emit();
  }
}

export function clearToken() {
  try {
    window.localStorage.removeItem(TOKEN_KEY);
  } finally {
    emit();
  }
}

export function subscribeToken(listener: () => void) {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key === TOKEN_KEY || event.key === null) listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}
