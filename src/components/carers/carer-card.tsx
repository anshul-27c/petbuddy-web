"use client";

import { MapPin } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/components/auth/auth-provider";
import { Avatar } from "@/components/ui/avatar";
import { ButtonLink } from "@/components/ui/button";
import { Tag } from "@/components/ui/chip";
import { ServiceIcon } from "@/components/ui/icons";
import { Money } from "@/components/ui/money";
import { trackPointer } from "@/components/ui/motion";
import { Skeleton } from "@/components/ui/skeleton";
import { RatingInline } from "@/components/ui/stars";
import { formatCount, formatDistance } from "@/lib/format";
import { firstName, repeatPercent } from "@/lib/labels";
import { useServiceCatalogue } from "@/lib/queries";
import type { Earner } from "@/lib/types";
import { useBookHref } from "./book-href";
import { FavouriteButton } from "./favourite-button";
import { NextAvailable } from "./next-available";
import { VerificationBadges } from "./verification-badges";

/**
 * A carer in a list. The whole card opens the profile; Book and the heart act
 * on their own. On phones the price and Book sit in a footer row; from 768 px
 * they move to a right-hand column so every card in the list lines up.
 */
export function CarerCard({ earner }: { earner: Earner }) {
  const { status } = useAuth();
  const catalogue = useServiceCatalogue();
  const bookHref = useBookHref(earner.id);
  const shown = earner.services.slice(0, 3);
  const more = earner.services.length - shown.length;

  return (
    <article
      onPointerMove={trackPointer}
      className="spotlight lift flex w-full flex-col rounded-card border border-hairline bg-surface p-4 shadow-card has-[a[data-card-link]:focus-visible]:outline-2 has-[a[data-card-link]:focus-visible]:outline-offset-2 has-[a[data-card-link]:focus-visible]:outline-leash sm:p-5 md:flex-row md:gap-6"
    >
      <div className="flex min-w-0 flex-1 items-start gap-4">
        <Avatar name={earner.name} size="lg" verified={earner.idVerified} />
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-title font-semibold">
            <Link
              href={`/carers/${earner.id}`}
              data-card-link
              className="after:absolute after:inset-0 after:z-10 after:rounded-card focus-visible:outline-none"
            >
              {earner.name}
            </Link>
          </h3>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-ink-muted">
            <RatingInline rating={earner.rating} count={earner.reviewCount} />
            <span className="inline-flex min-w-0 items-center gap-1">
              <MapPin className="size-3.5 shrink-0" aria-hidden />
              <span className="truncate">
                {earner.area}, {formatDistance(earner.distanceKm)}
              </span>
            </span>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <VerificationBadges idVerified={earner.idVerified} policeVerified={earner.policeVerified} />
            {shown.map((service) => (
              <Tag key={service} icon={<ServiceIcon service={service} className="size-3.5" />}>
                {catalogue.label(service)}
              </Tag>
            ))}
            {more > 0 ? <Tag>+{more} more</Tag> : null}
          </div>
          <p className="mt-3 text-small text-ink-muted">
            {earner.jobsDone > 0
              ? `${formatCount(earner.jobsDone)} jobs finished · ${repeatPercent(earner)}% book again`
              : "New on PetBuddy"}
          </p>
        </div>
      </div>

      {/* Phones: price and actions on one row, the next free slot under them. From 768 px: a right-hand column. */}
      <div className="mt-4 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-2 border-t border-hairline pt-4 md:mt-0 md:flex md:w-64 md:shrink-0 md:flex-col md:items-stretch md:justify-between md:border-t-0 md:border-l md:pt-0 md:pl-6">
        <div className="contents md:flex md:min-w-0 md:flex-col md:items-end md:gap-1 md:text-right">
          <Money paise={earner.pricePerHourPaise} display suffix="/hr" className="col-start-1 row-start-1 text-subhead" />
          <NextAvailable
            at={earner.nextAvailableAt}
            online={earner.isOnline}
            size="xs"
            className="col-span-2 row-start-2"
          />
        </div>
        <div className="col-start-2 row-start-1 flex shrink-0 items-center gap-2 md:mt-4 md:[&>a:last-child]:flex-1">
          {status === "signedIn" ? (
            <FavouriteButton
              earnerId={earner.id}
              name={earner.name}
              isFavourite={earner.isFavourite}
              className="relative z-20"
            />
          ) : null}
          <ButtonLink href={bookHref} className="relative z-20" aria-label={`Book ${earner.name}`}>
            Book {firstName(earner.name)}
          </ButtonLink>
        </div>
      </div>
    </article>
  );
}

export function CarerCardSkeleton() {
  return (
    <div
      aria-hidden
      className="flex flex-col rounded-card border border-hairline bg-surface p-4 shadow-card sm:p-5 md:flex-row md:gap-6"
    >
      <div className="flex flex-1 items-start gap-4">
        <Skeleton className="size-14 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-3 w-2/3" />
          <div className="flex gap-2 pt-2">
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
        </div>
      </div>
      <div className="mt-4 flex items-end justify-between border-t border-hairline pt-4 md:mt-0 md:w-64 md:flex-col md:items-end md:border-t-0 md:border-l md:pt-0 md:pl-6">
        <div className="space-y-2">
          <Skeleton className="ml-auto h-6 w-20" />
          <Skeleton className="h-3 w-32" />
        </div>
        <Skeleton className="h-11 w-28" />
      </div>
    </div>
  );
}
