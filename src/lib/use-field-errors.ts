"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { isApiError } from "./api";
import { hasErrors, type FieldErrors } from "./validation";

/** The first field marked invalid inside `root`: an input, or a group marked with `data-invalid`. */
function firstInvalid(root: HTMLElement | null): HTMLElement | null {
  return root?.querySelector<HTMLElement>('[aria-invalid="true"], [data-invalid="true"]') ?? null;
}

/**
 * Field errors for one form, and the behaviour every form shares:
 * - `show` sets the errors and, when there are any, moves focus to the first
 *   invalid field (in page order), so its message is read out and in view;
 * - `clear` drops one field's message as soon as the person edits it;
 * - `fromServer` maps a 422's field errors onto the form's own field names and
 *   shows them the same way. It returns false when none of them landed on a
 *   field, so the caller can show the server's message instead.
 *
 * Put `ref` on the element that holds the fields (the form, or a dialog body).
 */
export function useFieldErrors<F extends string>() {
  const [errors, setErrors] = useState<FieldErrors<F>>({});
  const [attempt, setAttempt] = useState(0);
  const root = useRef<HTMLElement | null>(null);
  const ref = useCallback((element: HTMLElement | null) => {
    root.current = element;
  }, []);

  useEffect(() => {
    if (attempt === 0) return;
    const target = firstInvalid(root.current);
    if (!target) return;
    target.focus({ preventScroll: true });
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    target.scrollIntoView({ block: "center", behavior: reduce ? "auto" : "smooth" });
  }, [attempt]);

  const show = useCallback((next: FieldErrors<F>): boolean => {
    setErrors(next);
    const invalid = hasErrors(next);
    if (invalid) setAttempt((count) => count + 1);
    return invalid;
  }, []);

  const clear = useCallback((field: F) => {
    setErrors((current) => (current[field] ? { ...current, [field]: undefined } : current));
  }, []);

  const fromServer = useCallback(
    (error: unknown, fields: Partial<Record<string, F>>): boolean => {
      if (!isApiError(error)) return false;
      const next: FieldErrors<F> = {};
      for (const [apiField, message] of Object.entries(error.fieldErrors)) {
        const field = fields[apiField];
        if (field && !next[field]) next[field] = message;
      }
      return show(next);
    },
    [show],
  );

  return { errors, show, clear, fromServer, ref };
}
