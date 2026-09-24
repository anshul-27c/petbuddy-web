"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Languages, MapPin, UserX } from "lucide-react";
import Link from "next/link";
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
import { Container } from "@/components/layout/container";
import { Avatar } from "@/components/ui/avatar";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card, SectionTitle } from "@/components/ui/card";
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
        <ButtonLink href={href} size="lg" block>
          Book {first}
        </ButtonLink>
      ) : (
        <Notice tone="warning" title={`${first} is not taking bookings right now`}>
          Save them to your favourites and check back later, or find another carer.
        </Notice>
      )}
      <p className="text-small text-ink-muted">
        You see the full price before paying. Free cancellation up to {freeCancelHours}{" "}
        {freeCancelHours === 1 ? "hour" : "hours"} before the visit.
      </p>
    </Card>
  );
}

function MobileBookBar({ earner }: { earner: EarnerDetail }) {
  const href = useBookHref(earner.id);
  if (!earner.isOnline) return null;
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-hairline bg-surface/95 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur lg:hidden">
      <div className="mx-auto flex max-w-2xl items-center justify-between gap-3">
        <div className="min-w-0">
          <Money paise={earner.pricePerHourPaise} display suffix="/hr" className="text-title" />
          <NextAvailable at={earner.nextAvailableAt} className="block truncate text-small" />
        </div>
        <ButtonLink href={href} size="lg" className="shrink-0">
          Book {firstName(earner.name)}
        </ButtonLink>
      </div>
    </div>
  );
}

function Profile({ earner }: { earner: EarnerDetail }) {
  const { status } = useAuth();
  const router = useRouter();
  const [allReviews, setAllReviews] = useState(false);
  const first = firstName(earner.name);

  return (
    <>
      <div className="grid gap-8 pb-28 lg:grid-cols-[1fr_22rem] lg:pb-0">
        <div className="min-w-0 space-y-8">
          <div className="flex items-start gap-4">
            <Avatar name={earner.name} size="xl" verified={earner.idVerified} />
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <h1 className="font-display text-headline font-semibold sm:text-display">{earner.name}</h1>
                {status === "signedIn" ? (
                  <FavouriteButton earnerId={earner.id} name={earner.name} isFavourite={earner.isFavourite} />
                ) : null}
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-ink-muted">
                <RatingInline rating={earner.rating} count={earner.reviewCount} />
                <span aria-hidden>·</span>
                <span className="inline-flex items-center gap-1">
                  <MapPin className="size-3.5" aria-hidden />
                  {earner.area}, {formatDistance(earner.distanceKm)}
                </span>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                <VerificationBadges idVerified={earner.idVerified} policeVerified={earner.policeVerified} />
              </div>
            </div>
          </div>

          {!earner.isOnline ? (
            <Notice tone="warning" title={`${first} is not taking bookings right now`} className="lg:hidden">
              Save them to your favourites and check back later, or find another carer.
            </Notice>
          ) : null}

          <section aria-labelledby="trust">
            <SectionTitle id="trust" title={`Why people book ${first}`} />
            <TrustBlock earner={earner} />
          </section>

          <section aria-labelledby="about">
            <SectionTitle id="about" title="About" />
            <Card>
              <p className="whitespace-pre-line">{earner.about || `${first} has not written an introduction yet.`}</p>
              {earner.languages.length ? (
                <p className="mt-4 flex items-center gap-2 text-sm text-ink-muted">
                  <Languages className="size-4" aria-hidden />
                  Speaks {earner.languages.join(", ")}
                </p>
              ) : null}
              <p className="mt-2 text-sm text-ink-muted">Travels up to {earner.serviceRadiusKm} km for visits.</p>
            </Card>
          </section>

          <section aria-labelledby="services">
            <SectionTitle id="services" title="Services and prices" subtitle="Price of one booking at the usual length." />
            <ServicePrices earner={earner} />
          </section>

          <section aria-labelledby="availability">
            <SectionTitle
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
            <SectionTitle id="reviews" title="Reviews" />
            {earner.reviewSummary.total === 0 ? (
              <NoReviews />
            ) : (
              <Card>
                <ReviewSummaryBlock summary={earner.reviewSummary} />
                <div className="mt-4 divide-y divide-hairline border-t border-hairline">
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
    <div className="grid gap-8 lg:grid-cols-[1fr_22rem]" role="status" aria-label="Loading carer">
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="size-18 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-7 w-1/2" />
            <Skeleton className="h-4 w-1/3" />
          </div>
        </div>
        <CardSkeleton />
        <CardSkeleton lines={4} />
      </div>
      <Skeleton className="hidden h-56 rounded-card lg:block" />
    </div>
  );
}

export default function CarerProfilePage() {
  const { id } = useParams<{ id: string }>();
  const query = useQuery({ queryKey: qk.earner(id), queryFn: () => api.earners.get(id) });

  return (
    <>
      <PageTitle title={query.data?.name ?? "Carer"} />
      <Container className="pt-4 sm:pt-6">
        <Link
          href="/carers"
          className="mb-4 inline-flex min-h-11 items-center gap-2 rounded-field text-sm font-semibold text-leash-dark hover:underline"
        >
          <ArrowLeft className="size-4" aria-hidden />
          All carers
        </Link>
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
