"use client";

import { useEffect, useState } from "react";

/** Returns `value` once it has stopped changing for `delayMs`. */
export function useDebouncedValue<T>(value: T, delayMs = 300): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(timer);
  }, [value, delayMs]);
  return debounced;
}

/** Seconds left until `deadline` (ms since epoch), ticking once a second. */
export function useCountdown(deadline: number | null): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!deadline) return;
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [deadline]);
  if (!deadline) return 0;
  return Math.max(0, Math.ceil((deadline - now) / 1000));
}
