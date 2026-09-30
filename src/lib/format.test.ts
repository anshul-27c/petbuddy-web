import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  businessHour,
  formatDayTimeInline,
  carerPlace,
  carerTrackRecord,
  formatDay,
  formatMoney,
  formatSlot,
  formatTime,
  plural,
  repeatPercent,
  showsRepeatRate,
} from "./format.ts";

describe("carer card text", () => {
  it("never prints a dangling separator", () => {
    assert.equal(carerPlace("Dalanwala", 1.2), "Dalanwala, 1.2 km away");
    assert.equal(carerPlace("", 0.04), "50 m away");
    assert.equal(carerPlace("  ", 0.04), "50 m away");
    assert.equal(carerPlace(null, 12.4), "12 km away");
    assert.equal(carerPlace("Dalanwala", null), "Dalanwala");
    assert.equal(carerPlace("", Number.NaN), "");
  });

  it("pluralises counts", () => {
    assert.equal(plural(1, "job"), "1 job");
    assert.equal(plural(0, "job"), "0 jobs");
    assert.equal(plural(1248, "review"), "1,248 reviews");
    assert.equal(plural(2, "match", "matches"), "2 matches");
  });

  it("shows the book-again rate only from five finished jobs", () => {
    assert.equal(carerTrackRecord({ jobsDone: 0, repeatClients: 0 }), "New on PetBuddy");
    assert.equal(carerTrackRecord({ jobsDone: 1, repeatClients: 1 }), "1 job finished");
    assert.equal(carerTrackRecord({ jobsDone: 4, repeatClients: 3 }), "4 jobs finished");
    assert.equal(carerTrackRecord({ jobsDone: 5, repeatClients: 4 }), "5 jobs finished · 80% book again");
    assert.equal(carerTrackRecord({ jobsDone: 20, repeatClients: 15 }), "20 jobs finished · 75% book again");
    assert.equal(showsRepeatRate({ jobsDone: 4 }), false);
    assert.equal(showsRepeatRate({ jobsDone: 5 }), true);
    assert.equal(repeatPercent({ jobsDone: 3, repeatClients: 9 }), 100);
  });
});

describe("money", () => {
  it("uses Indian grouping and paise only when needed", () => {
    assert.equal(formatMoney(12_000_000), "₹1,20,000");
    assert.equal(formatMoney(1250), "₹12.50");
    assert.equal(formatMoney(45000), "₹450");
    assert.equal(formatMoney(-5000), "−₹50");
  });
});

describe("times in the business timezone", () => {
  // 03:30 UTC is 9:00 am in India, whatever the machine's zone is.
  const start = "2026-10-02T03:30:00.000Z";
  const end = "2026-10-02T04:30:00.000Z";
  const now = new Date("2026-10-01T12:00:00.000Z");

  it("formats times and ranges in India time", () => {
    assert.equal(formatTime(start), "9:00 am");
    assert.equal(businessHour(start), 9);
    assert.equal(businessHour("2026-10-01T18:45:00.000Z"), 0);
  });

  it("names days relative to India's today", () => {
    assert.equal(formatDay(start, now), "Tomorrow");
    assert.equal(formatDay("2026-10-01T19:00:00.000Z", now), "Tomorrow");
    assert.equal(formatDay("2026-10-01T18:00:00.000Z", now), "Today");
    assert.equal(formatDay("2026-09-30T12:00:00.000Z", now), "Yesterday");
    assert.match(formatDay("2026-10-05T03:30:00.000Z", now), /Mon, 5 Oct/);
  });

  it("keeps weekday and month capitals mid-sentence", () => {
    assert.equal(formatDayTimeInline(start, now), "tomorrow, 9:00 am");
    assert.match(formatDayTimeInline("2026-10-05T03:30:00.000Z", now), /^Mon, 5 Oct, 9:00 am$/);
  });

  it("drops the repeated meridiem in a slot", () => {
    assert.match(formatSlot(start, end), /9:00 – 10:00 am$/);
  });
});
