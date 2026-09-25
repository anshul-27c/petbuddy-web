"use client";

import { useQuery } from "@tanstack/react-query";
import { CalendarX2 } from "lucide-react";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState, QueryView } from "@/components/ui/states";
import { api } from "@/lib/api";
import { availabilityDayParts, formatTime } from "@/lib/format";
import { qk } from "@/lib/query-keys";
import type { DayAvailability, ServiceKey, Slot } from "@/lib/types";
import { cn } from "@/lib/utils";

export const AVAILABILITY_DAYS = 14;

/**
 * The carer's next fortnight. Passing `service` marks slots too short for it
 * as taken; `excludeBookingId` frees the slot of a booking being moved.
 */
export function useAvailability(earnerId: string, service?: ServiceKey, excludeBookingId?: string) {
  return useQuery({
    queryKey: qk.availability(earnerId, service, excludeBookingId),
    queryFn: () => api.earners.availability(earnerId, { days: AVAILABILITY_DAYS, service, excludeBookingId }),
    staleTime: 15_000,
  });
}

export function sameInstant(a: string | null | undefined, b: string | null | undefined): boolean {
  if (!a || !b) return false;
  return new Date(a).getTime() === new Date(b).getTime();
}

/** True when `start` is still an open slot in the loaded days. */
export function isOpenSlot(days: DayAvailability[] | undefined, start: string | null): boolean {
  if (!days || !start) return false;
  return days.some((day) => day.slots.some((slot) => slot.available && sameInstant(slot.start, start)));
}

const openCount = (day: DayAvailability) => day.slots.filter((slot) => slot.available).length;

const PERIODS = [
  { key: "morning", label: "Morning", test: (hour: number) => hour < 12 },
  { key: "afternoon", label: "Afternoon", test: (hour: number) => hour >= 12 && hour < 17 },
  { key: "evening", label: "Evening", test: (hour: number) => hour >= 17 },
] as const;

/**
 * A day strip and an hourly slot grid grouped into morning, afternoon and
 * evening. Shared by the carer profile, the booking flow and rescheduling.
 */
export function AvailabilityPicker({
  earnerId,
  service,
  excludeBookingId,
  selected,
  onSelect,
  carerName,
}: {
  earnerId: string;
  service?: ServiceKey;
  excludeBookingId?: string;
  selected: string | null;
  onSelect: (slot: Slot) => void;
  carerName: string;
}) {
  const query = useAvailability(earnerId, service, excludeBookingId);
  return (
    <QueryView
      query={query}
      loading={<PickerSkeleton />}
      isEmpty={(days) => days.every((day) => openCount(day) === 0)}
      empty={
        <EmptyState
          icon={<CalendarX2 />}
          title="Nothing free in the next two weeks"
          body={`${carerName} has no open slots${service ? " long enough for this service" : ""} right now. Try another carer, or check back later.`}
        />
      }
    >
      {(days) => <PickerBody days={days} selected={selected} onSelect={onSelect} />}
    </QueryView>
  );
}

function PickerBody({
  days,
  selected,
  onSelect,
}: {
  days: DayAvailability[];
  selected: string | null;
  onSelect: (slot: Slot) => void;
}) {
  const [chosenDay, setChosenDay] = useState<number | null>(null);
  const selectedDay = days.findIndex((day) => day.slots.some((slot) => sameInstant(slot.start, selected)));
  const firstOpen = Math.max(0, days.findIndex((day) => openCount(day) > 0));
  const dayIndex = chosenDay ?? (selectedDay >= 0 ? selectedDay : firstOpen);
  const day = days[Math.min(dayIndex, days.length - 1)];

  return (
    <div>
      <div
        className="scrollbar-none fade-x-end relative flex snap-x snap-mandatory gap-2 overflow-x-auto pb-1"
        role="group"
        aria-label="Pick a day"
      >
        {days.map((item, index) => {
          const parts = availabilityDayParts(item.date);
          const free = openCount(item);
          const active = index === dayIndex;
          return (
            <button
              key={item.date}
              type="button"
              aria-pressed={active}
              aria-label={`${parts.long}, ${free === 0 ? "fully booked" : `${free} ${free === 1 ? "slot" : "slots"} free`}`}
              onClick={() => setChosenDay(index)}
              className={cn(
                "flex w-16 shrink-0 snap-start flex-col items-center rounded-field border py-3 transition duration-150 ease-out active:scale-95",
                active
                  ? "border-leash bg-leash text-surface shadow-cta"
                  : free > 0
                    ? "border-hairline bg-surface text-ink shadow-card hover:border-leash"
                    : "border-hairline bg-canvas text-ink-faint",
              )}
            >
              <span className={cn("text-label font-semibold", active ? "text-surface" : free ? "text-ink-muted" : "")}>
                {parts.weekday}
              </span>
              <span className="mt-1 text-title font-bold tabular-nums">{parts.day}</span>
              <span
                className={cn(
                  "mt-1 text-label font-semibold",
                  active ? "text-surface" : free ? "text-trail" : "text-ink-faint",
                )}
              >
                {free ? `${free} free` : "Full"}
              </span>
            </button>
          );
        })}
      </div>

      <h3 className="mt-5 text-sm font-semibold text-ink">{availabilityDayParts(day.date).long}</h3>
      {openCount(day) === 0 ? (
        <p className="mt-3 rounded-field bg-canvas px-4 py-3 text-sm text-ink-muted">
          No free slots that day. Try another day.
        </p>
      ) : (
        <div className="mt-3 space-y-4">
          {PERIODS.map((period) => {
            const slots = day.slots.filter((slot) => period.test(new Date(slot.start).getHours()));
            if (slots.length === 0) return null;
            return (
              <div key={period.key} role="group" aria-label={period.label}>
                <p className="mb-2 text-small font-semibold text-ink-muted">{period.label}</p>
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-5">
                  {slots.map((slot) => {
                    const active = sameInstant(slot.start, selected);
                    return (
                      <button
                        key={slot.start}
                        type="button"
                        disabled={!slot.available}
                        aria-pressed={active}
                        onClick={() => onSelect(slot)}
                        className={cn(
                          "min-h-11 rounded-field border px-2 text-sm font-semibold tabular-nums transition duration-150 ease-out",
                          active
                            ? "border-leash bg-leash text-surface shadow-cta"
                            : slot.available
                              ? "border-hairline bg-surface text-ink shadow-card hover:border-leash hover:text-leash-dark active:scale-95"
                              : "cursor-not-allowed border-hairline bg-canvas font-medium text-ink-faint line-through",
                        )}
                      >
                        {formatTime(slot.start)}
                        {!slot.available ? <span className="sr-only"> (taken)</span> : null}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function PickerSkeleton() {
  return (
    <div role="status" aria-label="Loading availability">
      <div className="flex gap-2 overflow-hidden">
        {Array.from({ length: 7 }, (_, i) => (
          <Skeleton key={i} className="h-20 w-16 shrink-0" />
        ))}
      </div>
      <Skeleton className="mt-5 h-4 w-40" />
      <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-5">
        {Array.from({ length: 8 }, (_, i) => (
          <Skeleton key={i} className="h-11" />
        ))}
      </div>
    </div>
  );
}
