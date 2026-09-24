"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, CalendarClock, CalendarX2, MapPin, NotebookPen, Star } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState, type ReactNode } from "react";
import { RequireAuth } from "@/components/auth/require-auth";
import { CancelDialog } from "@/components/booking/cancel-dialog";
import { CarerContact } from "@/components/booking/carer-contact";
import { ConfirmedBanner } from "@/components/booking/confirmed-banner";
import { LivePanel } from "@/components/booking/live-panel";
import { PriceBreakdown } from "@/components/booking/price-breakdown";
import { RateDialog } from "@/components/booking/rate-dialog";
import { RescheduleDialog } from "@/components/booking/reschedule-dialog";
import { StatusGuide } from "@/components/booking/status-guide";
import { Timeline } from "@/components/booking/timeline";
import { Container } from "@/components/layout/container";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tag } from "@/components/ui/chip";
import { ServiceIcon, SpeciesIcon } from "@/components/ui/icons";
import { CardSkeleton, PageSkeleton, Skeleton } from "@/components/ui/skeleton";
import { EmptyState, ErrorState } from "@/components/ui/states";
import { BookingStatusPill, PaymentStatusPill } from "@/components/ui/status-pill";
import { StarRow } from "@/components/ui/stars";
import { api, isApiError } from "@/lib/api";
import { formatDuration, formatSlot } from "@/lib/format";
import { addressLine, petSummary, TEMPERAMENT_LABELS } from "@/lib/labels";
import { useServiceCatalogue } from "@/lib/queries";
import { qk } from "@/lib/query-keys";
import type { Booking } from "@/lib/types";
import { PageTitle } from "@/components/layout/page-title";

const LIVE = new Set(["onTheWay", "inProgress"]);

function Detail({ icon, label, children }: { icon: ReactNode; label: string; children: ReactNode }) {
  return (
    <div className="flex gap-3">
      <span className="mt-0.5 text-ink-muted [&_svg]:size-5" aria-hidden>
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <dt className="text-small font-semibold text-ink-muted">{label}</dt>
        <dd className="mt-0.5 text-body">{children}</dd>
      </div>
    </div>
  );
}

function Actions({ booking }: { booking: Booking }) {
  const [open, setOpen] = useState<"cancel" | "reschedule" | "rate" | null>(null);
  if (!booking.canCancel && !booking.canReschedule && !booking.canRate) return null;
  return (
    <Card className="space-y-2">
      <h2 className="mb-1 text-title font-semibold">Manage booking</h2>
      {booking.canRate ? (
        <Button block size="lg" onClick={() => setOpen("rate")} icon={<Star className="size-4" aria-hidden />}>
          Rate this visit
        </Button>
      ) : null}
      {booking.canReschedule ? (
        <Button block variant="tonal" onClick={() => setOpen("reschedule")} icon={<CalendarClock className="size-4" aria-hidden />}>
          Reschedule
        </Button>
      ) : null}
      {booking.canCancel ? (
        <Button block variant="outline" onClick={() => setOpen("cancel")} icon={<CalendarX2 className="size-4" aria-hidden />}>
          Cancel booking
        </Button>
      ) : null}
      {booking.canCancel ? <CancelDialog booking={booking} open={open === "cancel"} onClose={() => setOpen(null)} /> : null}
      {booking.canReschedule ? (
        <RescheduleDialog booking={booking} open={open === "reschedule"} onClose={() => setOpen(null)} />
      ) : null}
      {booking.canRate ? <RateDialog booking={booking} open={open === "rate"} onClose={() => setOpen(null)} /> : null}
    </Card>
  );
}

function BookingView({ booking, updatedAt }: { booking: Booking; updatedAt: number }) {
  const catalogue = useServiceCatalogue();
  const params = useSearchParams();
  const router = useRouter();
  const serviceLabel = catalogue.label(booking.service);
  const live = LIVE.has(booking.status);
  const confirmed = params.get("confirmed") === "1";

  return (
    <div className="space-y-6">
      {confirmed ? (
        <ConfirmedBanner
          booking={booking}
          serviceLabel={serviceLabel}
          onDismiss={() => router.replace(`/bookings/${booking.id}`, { scroll: false })}
        />
      ) : null}

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-field bg-sky text-leash">
            <ServiceIcon service={booking.service} className="size-6" />
          </span>
          <div>
            <h1 className="font-display text-headline font-semibold">
              {serviceLabel} for {booking.pet.name}
            </h1>
            <p className="text-sm text-ink-muted">Reference {booking.code}</p>
          </div>
        </div>
        <BookingStatusPill status={booking.status} className="mt-1" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
        <div className="min-w-0 space-y-6">
          <StatusGuide booking={booking} />
          {live ? <LivePanel booking={booking} updatedAt={updatedAt} /> : null}

          <Card>
            <dl className="space-y-4">
              <Detail icon={<CalendarClock />} label="When">
                {formatSlot(booking.start, booking.end)}
                <span className="text-ink-muted"> · {formatDuration(booking.durationMinutes)}</span>
              </Detail>
              <Detail icon={<MapPin />} label="Where">
                <span className="font-semibold">{booking.address.label}</span>
                <br />
                {addressLine(booking.address)}
                {booking.address.landmark ? (
                  <>
                    <br />
                    <span className="text-ink-muted">Landmark: {booking.address.landmark}</span>
                  </>
                ) : null}
              </Detail>
              <Detail icon={<SpeciesIcon species={booking.pet.species} />} label="Pet">
                <span className="font-semibold">{booking.pet.name}</span>
                <span className="text-ink-muted"> · {petSummary(booking.pet)}</span>
                {booking.pet.temperament.length ? (
                  <span className="mt-2 flex flex-wrap gap-1.5">
                    {booking.pet.temperament.map((trait) => (
                      <Tag key={trait}>{TEMPERAMENT_LABELS[trait]}</Tag>
                    ))}
                  </span>
                ) : null}
              </Detail>
              {booking.notes ? (
                <Detail icon={<NotebookPen />} label="Notes for your carer">
                  <span className="whitespace-pre-line">{booking.notes}</span>
                </Detail>
              ) : null}
            </dl>
          </Card>

          {booking.ratingGiven ? (
            <Card>
              <h2 className="text-title font-semibold">Your review</h2>
              <StarRow value={booking.ratingGiven} className="mt-2" />
              {booking.reviewGiven ? <p className="mt-2 whitespace-pre-line">{booking.reviewGiven}</p> : null}
            </Card>
          ) : null}

          <Card>
            <h2 className="mb-4 text-title font-semibold">Timeline</h2>
            <Timeline events={booking.timeline} />
          </Card>
        </div>

        <aside className="space-y-4">
          <CarerContact booking={booking} />
          <Actions booking={booking} />
          <Card>
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-title font-semibold">Price</h2>
              <PaymentStatusPill status={booking.paymentStatus} />
            </div>
            <PriceBreakdown price={booking.price} serviceLabel={serviceLabel} />
          </Card>
        </aside>
      </div>
    </div>
  );
}

function BookingDetail() {
  const { id } = useParams<{ id: string }>();
  const query = useQuery({
    queryKey: qk.booking(id),
    queryFn: () => api.bookings.get(id),
    // Follow the carer while they are on the way or with your pet.
    refetchInterval: (q) => (q.state.data && LIVE.has(q.state.data.status) ? 5000 : false),
  });
  const catalogue = useServiceCatalogue();

  return (
    <>
      <PageTitle title={query.data ? `${catalogue.label(query.data.service)} for ${query.data.pet.name}` : "Booking"} />
      <Container className="pt-4 sm:pt-6">
        <Link
          href="/bookings"
          className="mb-4 inline-flex min-h-11 items-center gap-2 rounded-field text-sm font-semibold text-leash-dark hover:underline"
        >
          <ArrowLeft className="size-4" aria-hidden />
          All bookings
        </Link>
        {query.data ? (
          <BookingView booking={query.data} updatedAt={query.dataUpdatedAt} />
        ) : query.isError ? (
          isApiError(query.error) && query.error.status === 404 ? (
            <EmptyState
              icon={<CalendarX2 />}
              title="We could not find that booking"
              body="It may belong to another account, or the link is wrong."
              action={<ButtonLink href="/bookings">See your bookings</ButtonLink>}
            />
          ) : (
            <ErrorState error={query.error} onRetry={() => void query.refetch()} retrying={query.isFetching} />
          )
        ) : (
          <div className="space-y-6" role="status" aria-label="Loading booking">
            <Skeleton className="h-10 w-2/3" />
            <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
              <div className="space-y-6">
                <CardSkeleton lines={2} />
                <CardSkeleton lines={4} />
              </div>
              <CardSkeleton lines={3} />
            </div>
          </div>
        )}
      </Container>
    </>
  );
}

export default function BookingDetailPage() {
  return (
    <RequireAuth>
      <Suspense fallback={<PageSkeleton />}>
        <BookingDetail />
      </Suspense>
    </RequireAuth>
  );
}
