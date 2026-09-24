"use client";

import { useQuery } from "@tanstack/react-query";
import { CalendarPlus, History } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { RequireAuth } from "@/components/auth/require-auth";
import { BookingCard, BookingCardSkeleton } from "@/components/booking/booking-card";
import { Container, PageHeader } from "@/components/layout/container";
import { ButtonLink } from "@/components/ui/button";
import { PageSkeleton } from "@/components/ui/skeleton";
import { EmptyState, QueryView } from "@/components/ui/states";
import { LinkTabs } from "@/components/ui/tabs";
import { api } from "@/lib/api";
import { qk } from "@/lib/query-keys";
import type { BookingScope } from "@/lib/types";
import { PageTitle } from "@/components/layout/page-title";

function BookingList({ scope }: { scope: BookingScope }) {
  const query = useQuery({ queryKey: qk.bookings(scope), queryFn: () => api.bookings.list(scope) });
  return (
    <QueryView
      query={query}
      loading={
        <div className="space-y-3" role="status" aria-label="Loading bookings">
          {[0, 1, 2].map((i) => (
            <BookingCardSkeleton key={i} />
          ))}
        </div>
      }
      isEmpty={(list) => list.length === 0}
      empty={
        scope === "upcoming" ? (
          <EmptyState
            icon={<CalendarPlus />}
            title="No bookings coming up"
            body="Find a carer near you and book your first visit."
            action={<ButtonLink href="/carers">Find a carer</ButtonLink>}
          />
        ) : (
          <EmptyState
            icon={<History />}
            title="Nothing in your history yet"
            body="Finished and cancelled bookings will show up here."
          />
        )
      }
    >
      {(bookings) =>
        scope === "upcoming" ? (
          <div className="space-y-8">
            <section aria-labelledby="soonest">
              <h2 id="soonest" className="mb-3 text-title font-semibold">
                Your next booking
              </h2>
              <BookingCard booking={bookings[0]} pinned />
            </section>
            {bookings.length > 1 ? (
              <section aria-labelledby="later">
                <h2 id="later" className="mb-3 text-title font-semibold">
                  Later
                </h2>
                <ul className="space-y-3">
                  {bookings.slice(1).map((booking) => (
                    <li key={booking.id}>
                      <BookingCard booking={booking} />
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
          </div>
        ) : (
          <ul className="space-y-3">
            {bookings.map((booking) => (
              <li key={booking.id}>
                <BookingCard booking={booking} />
              </li>
            ))}
          </ul>
        )
      }
    </QueryView>
  );
}

function Bookings() {
  const params = useSearchParams();
  const scope: BookingScope = params.get("tab") === "past" ? "past" : "upcoming";
  return (
    <Container width="medium">
      <PageHeader
        title="Bookings"
        action={<ButtonLink href="/carers" variant="tonal">Book a visit</ButtonLink>}
      />
      <LinkTabs
        label="Booking lists"
        current={scope}
        items={[
          { key: "upcoming", label: "Upcoming", href: "/bookings" },
          { key: "past", label: "Past", href: "/bookings?tab=past" },
        ]}
      />
      <div className="mt-6">
        <BookingList key={scope} scope={scope} />
      </div>
    </Container>
  );
}

export default function BookingsPage() {
  return (
    <>
      <PageTitle title={"Bookings"} />
      <RequireAuth>
        <Suspense fallback={<PageSkeleton />}>
          <Bookings />
        </Suspense>
      </RequireAuth>
    </>
  );
}
