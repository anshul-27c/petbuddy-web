/**
 * Client-side checks that mirror the API's validators, so most mistakes are
 * caught before a request. The server's 422 field errors still win when they
 * differ. Every function here is pure, so it can be tested on its own.
 */

export type FieldErrors<K extends string = string> = Partial<Record<K, string>>;

export function hasErrors(errors: FieldErrors): boolean {
  return Object.values(errors).some(Boolean);
}

/** Length caps from the API contract, used for both `maxLength` and the checks. */
export const LIMITS = {
  profileName: 80,
  email: 254,
  petName: 40,
  breed: 60,
  vetName: 120,
  vaccinationNote: 200,
  temperament: 5,
  ageMonths: 360,
  weightMin: 0.1,
  weightMax: 120,
  addressLabel: 40,
  line1: 120,
  line2: 120,
  area: 80,
  city: 60,
  landmark: 120,
  gateCode: 20,
  bookingNotes: 1000,
  cancelReason: 500,
  sosNote: 1000,
  reviewText: 1000,
  chatMessage: 2000,
  search: 80,
  cartQuantity: 20,
} as const;

// ---- Phone and code --------------------------------------------------------

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

export function phoneError(value: string): string | undefined {
  if (!value) return "Enter your mobile number.";
  if (value.length < 10) return "Enter all 10 digits of your mobile number.";
  if (!isValidPhone(value)) return "Indian mobile numbers start with 6, 7, 8 or 9.";
  return undefined;
}

export function otpError(code: string): string | undefined {
  if (!/^\d{6}$/.test(code)) return "Enter all six digits of the code.";
  return undefined;
}

// ---- Small parsers and input filters ---------------------------------------

/** Six digits, not starting with 0 (no Indian pincode does). */
export const PINCODE_PATTERN = /^[1-9]\d{5}$/;

/** A complete address with a dot-separated domain and a real top-level part. */
export const EMAIL_PATTERN = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)*\.[A-Za-z]{2,}$/;

/** Parses a decimal typed by a person ("12.5", " 7 ", "7,5"), or returns null. */
export function parseDecimal(value: string): number | null {
  const trimmed = value.trim().replace(",", ".");
  if (!trimmed || !/^\d*\.?\d*$/.test(trimmed) || trimmed === ".") return null;
  const number = Number(trimmed);
  return Number.isFinite(number) ? number : null;
}

export function parseWhole(value: string): number | null {
  const trimmed = value.trim();
  if (!/^\d+$/.test(trimmed)) return null;
  return Number(trimmed);
}

/** Digits only, capped: for whole-number fields such as pincode and age. */
export function digitsOnly(value: string, max: number): string {
  return value.replace(/\D/g, "").slice(0, max);
}

/**
 * Filters typing in a decimal field: digits and one decimal point (a comma
 * counts as one), at most `whole` digits before it and `decimals` after.
 */
export function decimalInput(value: string, whole = 3, decimals = 1): string {
  const cleaned = value.replace(",", ".").replace(/[^\d.]/g, "");
  const dot = cleaned.indexOf(".");
  if (dot === -1) return cleaned.slice(0, whole);
  const before = cleaned.slice(0, dot).slice(0, whole);
  const after = cleaned.slice(dot + 1).replace(/\./g, "").slice(0, decimals);
  return `${before}.${after}`;
}

function tooLong(value: string, max: number) {
  return value.trim().length > max;
}

// ---- Profile ---------------------------------------------------------------

export type ProfileField = "name" | "email";

export function validateProfile(values: { name: string; email: string }): FieldErrors<ProfileField> {
  const errors: FieldErrors<ProfileField> = {};
  const name = values.name.trim();
  const email = values.email.trim();
  if (tooLong(name, LIMITS.profileName)) errors.name = `Keep your name to ${LIMITS.profileName} characters.`;
  else if (name && !/\p{L}/u.test(name)) errors.name = "Use letters for your name.";
  if (email.length > LIMITS.email) errors.email = "That email address is too long.";
  else if (email && !EMAIL_PATTERN.test(email)) errors.email = "Enter a complete email address, like name@example.com.";
  return errors;
}

// ---- Pet -------------------------------------------------------------------

export type PetField = "name" | "species" | "breed" | "age" | "weightKg" | "temperament" | "vaccinationNote" | "vetName";

export interface PetDraftValues {
  name: string;
  breed: string;
  years: string;
  months: string;
  weight: string;
  temperament: readonly string[];
  vaccinationNote: string;
  vetName: string;
}

export interface PetNumbers {
  ageMonths: number;
  weightKg: number;
}

export function validatePet(draft: PetDraftValues): { errors: FieldErrors<PetField>; numbers: PetNumbers | null } {
  const errors: FieldErrors<PetField> = {};
  const name = draft.name.trim();
  if (!name) errors.name = "Enter your pet's name.";
  else if (name.length > LIMITS.petName) errors.name = `Keep the name to ${LIMITS.petName} characters.`;

  if (tooLong(draft.breed, LIMITS.breed)) errors.breed = `Keep the breed to ${LIMITS.breed} characters.`;

  const yearsText = draft.years.trim();
  const monthsText = draft.months.trim();
  const years = yearsText === "" ? 0 : parseWhole(yearsText);
  const months = monthsText === "" ? 0 : parseWhole(monthsText);
  if (yearsText === "" && monthsText === "") {
    errors.age = "Enter your pet's age in years and months.";
  } else if (years === null || months === null) {
    errors.age = "Use whole numbers for years and months.";
  } else if (months > 11) {
    errors.age = "Months go from 0 to 11. Add a year for every 12 months.";
  } else if (years * 12 + months > LIMITS.ageMonths) {
    errors.age = "Age can be at most 30 years.";
  }

  const weight = parseDecimal(draft.weight);
  const rounded = weight === null ? null : Math.round(weight * 10) / 10;
  if (draft.weight.trim() === "") errors.weightKg = "Enter a weight in kg, for example 12.5.";
  else if (rounded === null) errors.weightKg = "Enter the weight as a number, for example 12.5.";
  else if (rounded < LIMITS.weightMin || rounded > LIMITS.weightMax) {
    errors.weightKg = `Weight must be between ${LIMITS.weightMin} and ${LIMITS.weightMax} kg.`;
  }

  if (draft.temperament.length > LIMITS.temperament) errors.temperament = `Pick up to ${LIMITS.temperament}.`;
  if (tooLong(draft.vaccinationNote, LIMITS.vaccinationNote)) {
    errors.vaccinationNote = `Keep the note to ${LIMITS.vaccinationNote} characters.`;
  }
  if (tooLong(draft.vetName, LIMITS.vetName)) errors.vetName = `Keep this to ${LIMITS.vetName} characters.`;

  if (hasErrors(errors) || years === null || months === null || rounded === null) return { errors, numbers: null };
  return { errors, numbers: { ageMonths: years * 12 + months, weightKg: rounded } };
}

// ---- Address ---------------------------------------------------------------

export type AddressField = "label" | "line1" | "line2" | "area" | "city" | "pincode" | "landmark" | "gateCode";

export function validateAddress(values: Record<AddressField, string>): FieldErrors<AddressField> {
  const errors: FieldErrors<AddressField> = {};
  const required: [AddressField, number, string][] = [
    ["label", LIMITS.addressLabel, "Give it a short name, like Home."],
    ["line1", LIMITS.line1, "Enter the flat, house or building."],
    ["area", LIMITS.area, "Enter the area or locality."],
    ["city", LIMITS.city, "Enter the city."],
  ];
  for (const [field, max, missing] of required) {
    const value = values[field].trim();
    if (!value) errors[field] = missing;
    else if (value.length > max) errors[field] = `Keep this to ${max} characters.`;
  }
  const optional: [AddressField, number][] = [
    ["line2", LIMITS.line2],
    ["landmark", LIMITS.landmark],
    ["gateCode", LIMITS.gateCode],
  ];
  for (const [field, max] of optional) {
    if (tooLong(values[field], max)) errors[field] = `Keep this to ${max} characters.`;
  }
  const pincode = values.pincode.trim();
  if (!pincode) errors.pincode = "Enter the 6-digit pincode.";
  else if (!/^\d{6}$/.test(pincode)) errors.pincode = "A pincode has 6 digits.";
  else if (!PINCODE_PATTERN.test(pincode)) errors.pincode = "Pincodes do not start with 0.";
  return errors;
}

// ---- Booking, chat, reviews, cancellations ---------------------------------

/** The gate code line added under the owner's notes, as the carer sees it. */
export function gateCodeLine(gateCode: string): string {
  const code = gateCode.trim();
  return code ? `Gate code: ${code}` : "";
}

/** Notes sent with a booking: the owner's note, then the gate code on its own line. */
export function bookingNotes(notes: string, gateCode: string): string | null {
  const parts = [notes.trim(), gateCodeLine(gateCode)].filter(Boolean);
  return parts.length ? parts.join("\n") : null;
}

/** How long the owner's own note can be, once the gate code line is added. */
export function notesLimit(gateCode: string): number {
  const line = gateCodeLine(gateCode);
  return LIMITS.bookingNotes - (line ? line.length + 1 : 0);
}

export type BookingNotesField = "gateCode" | "notes";

export function validateBookingNotes(notes: string, gateCode: string): FieldErrors<BookingNotesField> {
  const errors: FieldErrors<BookingNotesField> = {};
  if (tooLong(gateCode, LIMITS.gateCode)) errors.gateCode = `Keep the code to ${LIMITS.gateCode} characters.`;
  const limit = notesLimit(gateCode);
  if (notes.trim().length > limit) {
    errors.notes = gateCode.trim()
      ? `Keep your notes to ${limit} characters, so the gate code fits too.`
      : `Keep your notes to ${limit} characters.`;
  }
  return errors;
}

export function messageError(text: string): string | undefined {
  const trimmed = text.trim();
  if (!trimmed) return "Type a message first.";
  if (trimmed.length > LIMITS.chatMessage) {
    return `Messages can be up to ${LIMITS.chatMessage} characters. This one is ${trimmed.length}.`;
  }
  return undefined;
}

export type ReviewField = "rating" | "text";

export function validateReview(rating: number, text: string): FieldErrors<ReviewField> {
  const errors: FieldErrors<ReviewField> = {};
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) errors.rating = "Pick a rating from 1 to 5 stars.";
  if (tooLong(text, LIMITS.reviewText)) errors.text = `Keep your review to ${LIMITS.reviewText} characters.`;
  return errors;
}

export function maxLengthError(value: string, max: number, what = "this"): string | undefined {
  return tooLong(value, max) ? `Keep ${what} to ${max} characters.` : undefined;
}
