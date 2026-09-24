import { isApiError } from "./api";

/** Title and body for any thrown error: the server's message and action when present. */
export function errorCopy(error: unknown): { title: string; body: string } {
  if (isApiError(error)) {
    return { title: error.message, body: error.action ?? "Try again." };
  }
  return { title: "Something went wrong", body: "Try again in a moment." };
}

/** Field errors from a 422, keyed by field name. Empty for any other error. */
export function fieldErrorsOf(error: unknown): Record<string, string> {
  return isApiError(error) ? error.fieldErrors : {};
}

/** True for a 409 with one of the given codes (or any 409 when none are given). */
export function isConflict(error: unknown, ...codes: string[]): boolean {
  if (!isApiError(error) || error.status !== 409) return false;
  return codes.length === 0 || codes.includes(error.code);
}
