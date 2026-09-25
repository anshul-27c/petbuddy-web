"use client";

import { useQuery } from "@tanstack/react-query";
import { Languages, MapPin, Route, ShieldCheck, UserX } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { loginHref, useAuth } from "@/components/auth/auth-provider";
import { AvailabilityPicker } from "@/components/carers/availability-picker";
import { useBookHref } from "@/components/carers/book-href";
import { FavouriteButton } from "@/components/carers/favourite-button";
import { NextAvailable } from "@/components/carers/next-available";
import { AllReviewsDialog, NoReviews, ReviewItem, ReviewSummaryBlock } from "@/components/carers/reviews";
import { ServicePrices } from "@/components/carers/service-prices";
import { TrustBlock } from "@/components/carers/trust-block";
import { VerificationBadges } from "@/components/carers/verification-badges";
import { Container, PageBack } from "@/components/layout/container";
import { Avatar } from "@/components/ui/avatar";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { Money } from "@/components/ui/money";
import { Notice } from "@/components/ui/notice";
import { CardSkeleton, Skeleton } from "@/components/ui/skeleton";
import { EmptyState, ErrorState } from "@/components/ui/states";
import { RatingInline } from "@/components/ui/stars";
import { api, isApiError } from "@/lib/api";
import { formatDistance } from "@/lib/format";
import { firstName } from "@/lib/labels";
import { usePolicy } from "@/lib/queries";
import { qk } from "@/lib/query-keys";
import type { EarnerDetail } from "@/lib/types";
import { PageTitle } from "@/components/layout/page-title";
import { cn } from "@/lib/utils";

function BookPanel({ earner }: { earner: EarnerDetail }) {
  const href = useBookHref(earner.id);
  const { freeCancelHours } = usePolicy();
  const first = firstName(earner.name);
  return (
    <Card className="space-y-4">
      <div className="flex items-baseline justify-between gap-3">
        <Money paise={earner.pricePerHourPaise} display suffix="/hr" className="text-headline" />
        <RatingInline rating={earner.rating} count={earner.reviewCount} />
      </div>
      <NextAvailable at={earner.nextAvailableAt} />
      {earner.isOnline ? (
        <ButtonLink href={href} size="lg" block sheen>
          Book {first}
        </ButtonLink>
      ) : (
        <Notice tone="warning" title={`${first} is not taking bookings right now`}>
          Save them to your favourites and check back later, or find another carer.
        </Notice>
      )}
      <p className="flex gap-2 border-t border-hairline pt-4 text-small text-ink-muted">
        <span className="flex h-[1lh] shrink-0 items-center" aria-hidden>
          <ShieldCheck className="size-4 text-trail" />
        </span>
        <span>
          You see the full price before paying. Free cancellation up to {freeCancelHours}{" "}
          {freeCancelHours === 1 ? "hour" : "hours"} before the visit.
        </span>
      </p>
    </Card>
  );
}

/** Fixed to the bottom on phones and tablets; the page reserves its 80 px (see `pb-bar`). */
function MobileBookBar({ earner }: { earner: EarnerDetail }) {
  const href = useBookHref(earner.id);
  if (!earner.isOnline) return null;
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 bg-surface/90 shadow-[0_-1px_0_var(--color-hairline)] pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden">
      <div className="container-page flex h-20 items-center justify-between gap-3">
        <div className="min-w-0">
          <Money paise={earner.pricePerHourPaise} display suffix="/hr" className="text-title" />
          <NextAvailable at={earner.nextAvailableAt} size="xs" className="mt-1" />
        </div>
        <ButtonLink href={href} size="lg" sheen className="shrink-0">
          Book {firstName(earner.name)}
        </ButtonLink>
      </div>
    </div>
  );
}

/** The top of the profile: a soft aurora cover, the avatar overlapping it, then name, rating and badges. */
function ProfileHero({ earner }: { earner: EarnerDetail }) {
  const { status } = useAuth();
  return (
    <section aria-labelledby="carer-name" className="overflow-hidden rounded-panel border border-hairline bg-surface shadow-card">
      <div aria-hidden className="relative h-24 sm:h-32">
        <div className="bg-aurora absolute inset-0" />
        <div className="bg-dot-grid absolute inset-0" />
      </div>
      <div className="px-4 pb-5 sm:px-6 sm:pb-6">
        <div className="-mt-10 flex items-end justify-between gap-3 sm:-mt-12">
          <Avatar
            name={earner.name}
            size="hero"
            verified={earner.idVerified}
            className="rounded-full ring-4 ring-surface"
          />
          {status === "signedIn" ? (
            <FavouriteButton
              earnerId={earner.id}
              name={earner.name}
              isFavourite={earner.isFavourite}
              className="-mr-2 border border-hairline bg-surface shadow-card"
            />
          ) : null}
        </div>
        <h1 id="carer-name" className="mt-4 font-display text-headline font-semibold sm:text-display">
          {earner.name}
        </h1>
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-ink-muted">
          <RatingInline rating={earner.rating} count={earner.reviewCount} />
          <span className="inline-flex items-center gap-1">
            <MapPin className="size-3.5" aria-hidden />
            {earner.area}, {formatDistance(earner.distanceKm)}
          </span>
        </div>
        {earner.idVerified || earner.policeVerified ? (
          <div className="mt-4 flex flex-wrap gap-2">
            <VerificationBadges idVerified={earner.idVerified} policeVerified={earner.policeVerified} />
          </div>
        ) : null}
      </div>
    </section>
  );
}

function Profile({ earner }: { earner: EarnerDetail }) {
  const { status } = useAuth();
  const router = useRouter();
  const [allReviews, setAllReviews] = useState(false);
  const first = firstName(earner.name);

  return (
    <>
      <div className={cn("grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-10", earner.isOnline && "pb-bar lg:pb-0")}>
        <div className="stack-sections min-w-0">
          <div className="space-y-4">
            <ProfileHero earner={earner} />
            {!earner.isOnline ? (
              <Notice tone="warning" title={`${first} is not taking bookings right now`} className="lg:hidden">
                Save them to your favourites and check back later, or find another carer.
              </Notice>
            ) : null}
          </div>

          <section aria-labelledby="trust">
            <SectionHeader id="trust" title={`Why people book ${first}`} />
            <TrustBlock earner={earner} />
          </section>

          <section aria-labelledby="about">
            <SectionHeader id="about" title="About" />
            <Card>
              <p className="whitespace-pre-line">{earner.about || `${first} has not written an introduction yet.`}</p>
              <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 border-t border-hairline pt-4 text-sm text-ink-muted">
                {earner.languages.length ? (
                  <p className="flex items-center gap-2">
                    <Languages className="size-4" aria-hidden />
                    Speaks {earner.languages.join(", ")}
                  </p>
                ) : null}
                <p className="flex items-center gap-2">
                  <Route className="size-4" aria-hidden />
                  Travels up to {earner.serviceRadiusKm} km for visits.
                </p>
              </div>
            </Card>
          </section>

          <section aria-labelledby="services">
            <SectionHeader id="services" title="Services and prices" subtitle="Price of one booking at the usual length." />
            <ServicePrices earner={earner} />
          </section>

          <section aria-labelledby="availability">
            <SectionHeader
              id="availability"
              title="Availability"
              subtitle={earner.isOnline ? "Pick a time to start booking it." : "The next two weeks."}
            />
            <Card>
              <AvailabilityPicker
                earnerId={earner.id}
                carerName={first}
                selected={null}
                onSelect={(slot) => {
                  if (!earner.isOnline) return;
                  const target = `/book/${earner.id}?start=${encodeURIComponent(slot.start)}`;
                  router.push(status === "signedOut" ? loginHref(target) : target);
                }}
              />
            </Card>
          </section>

          <section aria-labelledby="reviews">
            <SectionHeader id="reviews" title="Reviews" />
            {earner.reviewSummary.total === 0 ? (
              <NoReviews />
            ) : (
              <Card>
                <ReviewSummaryBlock summary={earner.reviewSummary} />
                <div className="mt-5 divide-y divide-hairline border-t border-hairline">
                  {earner.recentReviews.map((review) => (
                    <ReviewItem key={review.id} review={review} carerFirstName={first} />
                  ))}
                </div>
                {earner.reviewSummary.total > earner.recentReviews.length ? (
                  <Button variant="outline" block onClick={() => setAllReviews(true)}>
                    See all {earner.reviewSummary.total} reviews
                  </Button>
                ) : null}
              </Card>
            )}
          </section>
        </div>

        <aside className="hidden lg:block">
          <div className="sticky top-24">
            <BookPanel earner={earner} />
          </div>
        </aside>
      </div>

      <MobileBookBar earner={earner} />
      <AllReviewsDialog
        earnerId={earner.id}
        carerFirstName={first}
        open={allReviews}
        onClose={() => setAllReviews(false)}
      />
    </>
  );
}

function ProfileSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-10" role="status" aria-label="Loading carer">
      <div className="space-y-10">
        <div className="overflow-hidden rounded-panel border border-hairline bg-surface">
          <Skeleton className="h-24 rounded-none sm:h-32" />
          <div className="px-4 pb-5 sm:px-6 sm:pb-6">
            <Skeleton className="-mt-10 size-18 rounded-full ring-4 ring-surface sm:-mt-12 sm:size-24" />
            <Skeleton className="mt-4 h-8 w-1/2" />
            <Skeleton className="mt-2 h-4 w-1/3" />
          </div>
        </div>
        <CardSkeleton lines={4} />
      </div>
      <Skeleton className="hidden h-64 rounded-card lg:block" />
    </div>
  );
}

export default function CarerProfilePage() {
  const { id } = useParams<{ id: string }>();
  const query = useQuery({ queryKey: qk.earner(id), queryFn: () => api.earners.get(id) });

  return (
    <>
      <PageTitle title={query.data?.name ?? "Carer"} />
      <Container>
        <PageBack href="/carers">All carers</PageBack>
        {query.data ? (
          <Profile earner={query.data} />
        ) : query.isError ? (
          isApiError(query.error) && query.error.status === 404 ? (
            <EmptyState
              icon={<UserX />}
              title="This carer is not on PetBuddy any more"
              body="Their profile may have been removed. There are plenty of other carers near you."
              action={<ButtonLink href="/carers">Find another carer</ButtonLink>}
            />
          ) : (
            <ErrorState error={query.error} onRetry={() => void query.refetch()} retrying={query.isFetching} />
          )
        ) : (
          <ProfileSkeleton />
        )}
      </Container>
    </>
  );
}
