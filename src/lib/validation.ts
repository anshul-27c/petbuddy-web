/**
 * Client-side checks that mirror the API contract, so most mistakes are caught
 * before a request. The server's 422 field errors still win when they differ.
 */

export const PHONE_PATTERN = /^[6-9]\d{9}$/;

export function isValidPhone(value: string): boolean {
  return PHONE_PATTERN.test(value);
}

/** Keeps the 10-digit national number from whatever was typed or pasted. */
export function normalisePhone(input: string): string {
  let digits = input.replace(/\D/g, "");
  if (digits.length > 10 && digits.startsWith("91")) digits = digits.slice(2);
  if (digits.length === 11 && digits.startsWith("0")) digits = digits.slice(1);
  return digits.slice(0, 10);
}

export const PINCODE_PATTERN = /^\d{6}$/;

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type FieldErrors<K extends string = string> = Partial<Record<K, string>>;

export function hasErrors(errors: FieldErrors): boolean {
  return Object.values(errors).some(Boolean);
}

/** Parses a decimal typed by a person ("12.5", " 7 "), or returns null. */
export function parseDecimal(value: string): number | null {
  const trimmed = value.trim().replace(",", ".");
  if (!trimmed) return null;
  const number = Number(trimmed);
  return Number.isFinite(number) ? number : null;
}

export function parseWhole(value: string): number | null {
  const trimmed = value.trim();
  if (!/^\d+$/.test(trimmed)) return null;
  return Number(trimmed);
}
