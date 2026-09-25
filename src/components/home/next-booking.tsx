"use client";

import { useQuery } from "@tanstack/react-query";
import { BookingCard } from "@/components/booking/booking-card";
import { useAuth } from "@/components/auth/auth-provider";
import { Reveal } from "@/components/ui/motion";
import { SectionHeader } from "@/components/ui/section-header";
import { api } from "@/lib/api";
import { qk } from "@/lib/query-keys";

/** For signed-in owners: the soonest upcoming booking, when there is one. */
export function NextBooking() {
  const { status } = useAuth();
  const query = useQuery({
    queryKey: qk.nextBooking,
    queryFn: api.bookings.next,
    enabled: status === "signedIn",
  });
  if (!query.data) return null;
  return (
    <section aria-labelledby="next-booking">
      <SectionHeader id="next-booking" eyebrow="Upcoming" title="Your next booking" />
      <Reveal self>
        <BookingCard booking={query.data} pinned />
      </Reveal>
    </section>
  );
}
