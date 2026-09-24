"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { qk } from "@/lib/query-keys";
import type { Booking } from "@/lib/types";

/**
 * After any booking action: store the returned booking and refresh everything
 * it touches (detail, both lists, the next booking, the carer's calendar).
 */
export function useBookingRefresh() {
  const queryClient = useQueryClient();
  return useCallback(
    (booking: Booking) => {
      queryClient.setQueryData(qk.booking(booking.id), booking);
      void queryClient.invalidateQueries({ queryKey: qk.bookingsAll });
      void queryClient.invalidateQueries({ queryKey: qk.availabilityAll(booking.earner.id) });
      void queryClient.invalidateQueries({ queryKey: qk.notifications });
    },
    [queryClient],
  );
}
