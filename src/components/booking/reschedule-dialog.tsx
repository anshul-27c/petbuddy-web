"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { AvailabilityPicker, sameInstant } from "@/components/carers/availability-picker";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { ErrorNotice } from "@/components/ui/notice";
import { useToast } from "@/components/ui/toast";
import { api } from "@/lib/api";
import { isConflict } from "@/lib/errors";
import { formatSlot } from "@/lib/format";
import { firstName } from "@/lib/labels";
import { qk } from "@/lib/query-keys";
import type { Booking } from "@/lib/types";
import { useBookingRefresh } from "./use-booking-refresh";

/** Moves a booking with the same picker as the booking flow. The price does not change. */
export function RescheduleDialog({
  booking,
  open,
  onClose,
}: {
  booking: Booking;
  open: boolean;
  onClose: () => void;
}) {
  const [picked, setPicked] = useState<string | null>(null);
  const refresh = useBookingRefresh();
  const queryClient = useQueryClient();
  const toast = useToast();
  const first = firstName(booking.earner.name);
  const minutes = booking.durationMinutes;

  const move = useMutation({
    mutationFn: (start: string) => api.bookings.reschedule(booking.id, start),
    onSuccess: (updated) => {
      refresh(updated);
      toast({ title: "Booking moved", body: `${first} has been told the new time.` });
      setPicked(null);
      onClose();
    },
    onError: (error) => {
      if (isConflict(error)) {
        setPicked(null);
        void queryClient.invalidateQueries({ queryKey: qk.availabilityAll(booking.earner.id) });
      }
    },
  });

  const pickedEnd = picked ? new Date(new Date(picked).getTime() + minutes * 60_000).toISOString() : null;
  const unchanged = sameInstant(picked, booking.start);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Pick a new time"
      description={`${first} is told straight away. The price does not change.`}
      size="lg"
      dismissible={!move.isPending}
      footer={
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-ink-muted" aria-live="polite">
            {unchanged ? (
              "That is the time it is booked for now."
            ) : picked && pickedEnd ? (
              <>
                Moving to <span className="font-semibold text-ink">{formatSlot(picked, pickedEnd)}</span>
              </>
            ) : (
              "Pick a day and a time."
            )}
          </p>
          <div className="flex flex-col-reverse gap-2 sm:flex-row">
            <Button variant="outline" onClick={onClose} disabled={move.isPending}>
              Cancel
            </Button>
            <Button
              onClick={() => picked && move.mutate(picked)}
              disabled={!picked || unchanged}
              loading={move.isPending}
            >
              Move booking
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        <p className="rounded-field bg-canvas px-4 py-3 text-sm">
          <span className="text-ink-muted">Currently booked for </span>
          <span className="font-semibold">{formatSlot(booking.start, booking.end)}</span>
        </p>
        {move.error ? <ErrorNotice error={move.error} /> : null}
        <AvailabilityPicker
          earnerId={booking.earner.id}
          service={booking.service}
          excludeBookingId={booking.id}
          carerName={first}
          selected={picked}
          onSelect={(slot) => {
            setPicked(slot.start);
            move.reset();
          }}
        />
      </div>
    </Dialog>
  );
}
