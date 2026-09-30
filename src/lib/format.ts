/**
 * All user-facing formatting. Money is integer paise everywhere; this is the
 * only place it becomes rupees. Dates and times are shown in the business
 * timezone (India), whatever the viewer's device is set to, so a visit at
 * 9:00 am in Dehradun reads 9:00 am everywhere.
 */
import type { Earner } from "./types";

/** The business timezone: every day, time and "today" on the site uses it. */
export const BUSINESS_TZ = "Asia/Kolkata";

const LOCALE = "en-IN";

const rupeesWhole = new Intl.NumberFormat(LOCALE, {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const rupeesWithPaise = new Intl.NumberFormat(LOCALE, {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const plainNumber = new Intl.NumberFormat(LOCALE);

/** ₹1,20,000 — Indian grouping; paise only when it is not a whole rupee (₹12.50). */
export function formatMoney(paise: number): string {
  const negative = paise < 0;
  const abs = Math.abs(Math.round(paise));
  const text = abs % 100 === 0 ? rupeesWhole.format(abs / 100) : rupeesWithPaise.format(abs / 100);
  return negative ? `−${text}` : text;
}

/** "₹450/hr" */
export function formatRate(paisePerHour: number): string {
  return `${formatMoney(paisePerHour)}/hr`;
}

/** "1,248" */
export function formatCount(value: number): string {
  return plainNumber.format(value);
}

/** "1 job", "12 jobs", "1,248 reviews". Pass the plural when it is not just an added "s". */
export function plural(count: number, singular: string, pluralForm = `${singular}s`): string {
  return `${formatCount(count)} ${count === 1 ? singular : pluralForm}`;
}

/** "4.8" — one decimal so 5.0 does not read as 5. */
export function formatRating(value: number): string {
  return value.toFixed(1);
}

/** "800 m away", "1.2 km away", "12 km away" */
export function formatDistance(km: number): string {
  if (!Number.isFinite(km)) return "";
  if (km < 1) return `${Math.max(50, Math.round((km * 1000) / 50) * 50)} m away`;
  if (km < 10) return `${km.toFixed(1)} km away`;
  return `${Math.round(km)} km away`;
}

/** "Dalanwala, 1.2 km away", or only the part that is known. Never a dangling separator. */
export function carerPlace(area: string | null | undefined, distanceKm: number | null | undefined): string {
  const distance = typeof distanceKm === "number" ? formatDistance(distanceKm) : "";
  return [area?.trim(), distance].filter(Boolean).join(", ");
}

// ---- Carer track record ---------------------------------------------------

/** Below this many finished jobs a repeat-booking rate means little, so it is not shown. */
export const REPEAT_RATE_MIN_JOBS = 5;

/** Share of jobs that came from returning clients, as a whole percentage. */
export function repeatPercent(earner: Pick<Earner, "jobsDone" | "repeatClients">): number {
  if (!earner.jobsDone) return 0;
  return Math.min(100, Math.round((earner.repeatClients / earner.jobsDone) * 100));
}

/** True once a carer has done enough jobs for "N% book again" to be shown. */
export function showsRepeatRate(earner: Pick<Earner, "jobsDone">): boolean {
  return earner.jobsDone >= REPEAT_RATE_MIN_JOBS;
}

/** "New on PetBuddy", "3 jobs finished", or "12 jobs finished · 75% book again". */
export function carerTrackRecord(earner: Pick<Earner, "jobsDone" | "repeatClients">): string {
  if (earner.jobsDone <= 0) return "New on PetBuddy";
  const jobs = `${plural(earner.jobsDone, "job")} finished`;
  return showsRepeatRate(earner) ? `${jobs} · ${repeatPercent(earner)}% book again` : jobs;
}

// ---- Times and days (business timezone) -------------------------------------

function clean(text: string): string {
  return text.replace(/[  ]/g, " ").toLowerCase();
}

const timeFormat = new Intl.DateTimeFormat(LOCALE, {
  timeZone: BUSINESS_TZ,
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
});

/** "9:00 am" */
export function formatTime(iso: string | Date): string {
  return clean(timeFormat.format(new Date(iso)));
}

/** "9:00 – 10:00 am", dropping the repeated meridiem. */
export function formatTimeRange(startIso: string, endIso: string): string {
  const start = formatTime(startIso);
  const end = formatTime(endIso);
  const startMeridiem = start.slice(-2);
  if (startMeridiem === end.slice(-2)) return `${start.slice(0, -3)} – ${end}`;
  return `${start} – ${end}`;
}

const hourFormat = new Intl.DateTimeFormat("en-GB", { timeZone: BUSINESS_TZ, hour: "2-digit", hourCycle: "h23" });

/** The hour of the day (0–23) an instant falls in. */
export function businessHour(iso: string | Date): number {
  return Number(hourFormat.format(new Date(iso))) % 24;
}

const businessDateKey = new Intl.DateTimeFormat("en-CA", {
  timeZone: BUSINESS_TZ,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/** "2026-09-24" for the business day an instant falls in. */
export function businessDate(iso: string | Date): string {
  return businessDateKey.format(new Date(iso));
}

/** True when the instant falls on today's business day. */
export function isBusinessToday(iso: string | Date, now: Date = new Date()): boolean {
  return businessDate(iso) === businessDate(now);
}

/** Whole business days from `now` to `iso`: 0 today, 1 tomorrow, -1 yesterday. */
function businessDayOffset(iso: string | Date, now: Date): number {
  const a = Date.parse(`${businessDate(iso)}T00:00:00Z`);
  const b = Date.parse(`${businessDate(now)}T00:00:00Z`);
  return Math.round((a - b) / 86_400_000);
}

const dayFormat = new Intl.DateTimeFormat(LOCALE, {
  timeZone: BUSINESS_TZ,
  weekday: "short",
  day: "numeric",
  month: "short",
});

/** "Today", "Tomorrow", "Yesterday", else "Mon, 14 Sept". */
export function formatDay(iso: string | Date, now: Date = new Date()): string {
  const diff = businessDayOffset(iso, now);
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  if (diff === -1) return "Yesterday";
  return dayFormat.format(new Date(iso));
}

/** "Today, 9:00 am" */
export function formatDayTime(iso: string, now: Date = new Date()): string {
  return `${formatDay(iso, now)}, ${formatTime(iso)}`;
}

/**
 * The same, for the middle of a sentence: "today, 9:00 am" but "Fri, 2 Oct,
 * 9:00 am" (only the relative words drop their capital).
 */
export function formatDayTimeInline(iso: string, now: Date = new Date()): string {
  return formatDayTime(iso, now).replace(/^(Today|Tomorrow|Yesterday)\b/, (word) => word.toLowerCase());
}

/** "Tue, 24 Sept, 5:00 – 6:00 pm", or both days when it runs overnight. */
export function formatSlot(startIso: string, endIso: string): string {
  if (businessDate(startIso) === businessDate(endIso)) {
    return `${formatDay(startIso)}, ${formatTimeRange(startIso, endIso)}`;
  }
  return `${formatDay(startIso)}, ${formatTime(startIso)} – ${formatDay(endIso)}, ${formatTime(endIso)}`;
}

const dateFormat = new Intl.DateTimeFormat(LOCALE, {
  timeZone: BUSINESS_TZ,
  day: "numeric",
  month: "short",
  year: "numeric",
});

/** "14 Sept 2026" */
export function formatDate(iso: string | Date): string {
  return dateFormat.format(new Date(iso));
}

const yearFormat = new Intl.DateTimeFormat("en-GB", { timeZone: BUSINESS_TZ, year: "numeric" });

/** "2024" */
export function formatYear(iso: string | Date): string {
  return yearFormat.format(new Date(iso));
}

/** "just now", "5 min ago", "2 hours ago", "3 days ago", else a date. */
export function formatAgo(iso: string, now: Date = new Date()): string {
  const minutes = Math.floor((now.getTime() - new Date(iso).getTime()) / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} ${days === 1 ? "day" : "days"} ago`;
  return formatDate(iso);
}

/** "45 min", "1 hr", "1 hr 30 min", "24 hr" */
export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (hours === 0) return `${rest} min`;
  if (rest === 0) return `${hours} hr`;
  return `${hours} hr ${rest} min`;
}

/** "+91 98765 43210" */
export function formatPhone(tenDigits: string): string {
  if (!/^\d{10}$/.test(tenDigits)) return tenDigits;
  return `+91 ${tenDigits.slice(0, 5)} ${tenDigits.slice(5)}`;
}

/** "987654••••" → "+91 98765 4••••" */
export function formatMaskedPhone(masked: string): string {
  const compact = masked.replace(/\s+/g, "");
  if (compact.length !== 10) return masked;
  return `+91 ${compact.slice(0, 5)} ${compact.slice(5)}`;
}

// ---- Availability day chips -------------------------------------------------

const businessWeekday = new Intl.DateTimeFormat(LOCALE, {
  timeZone: BUSINESS_TZ,
  weekday: "short",
});
const businessDayOfMonth = new Intl.DateTimeFormat(LOCALE, {
  timeZone: BUSINESS_TZ,
  day: "numeric",
});
const businessDayLong = new Intl.DateTimeFormat(LOCALE, {
  timeZone: BUSINESS_TZ,
  weekday: "long",
  day: "numeric",
  month: "long",
});
const businessMonth = new Intl.DateTimeFormat(LOCALE, {
  timeZone: BUSINESS_TZ,
  month: "short",
});

/** Labels for an availability day chip. */
export function availabilityDayParts(iso: string, now: Date = new Date()) {
  const offset = businessDayOffset(iso, now);
  const date = new Date(iso);
  return {
    weekday: offset === 0 ? "Today" : offset === 1 ? "Tmrw" : businessWeekday.format(date),
    day: businessDayOfMonth.format(date),
    month: businessMonth.format(date),
    long:
      offset === 0
        ? `Today, ${businessDayLong.format(date)}`
        : offset === 1
          ? `Tomorrow, ${businessDayLong.format(date)}`
          : businessDayLong.format(date),
  };
}
