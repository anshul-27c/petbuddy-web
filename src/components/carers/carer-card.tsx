"use client";

import Link from "next/link";
import { useAuth } from "@/components/auth/auth-provider";
import { Avatar } from "@/components/ui/avatar";
import { ButtonLink } from "@/components/ui/button";
import { Tag } from "@/components/ui/chip";
import { ServiceIcon } from "@/components/ui/icons";
import { Money } from "@/components/ui/money";
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

/** A carer in a list. The whole card opens the profile; Book and the heart act on their own. */
export function CarerCard({ earner }: { earner: Earner }) {
  const { status } = useAuth();
  const catalogue = useServiceCatalogue();
  const bookHref = useBookHref(earner.id);
  const shown = earner.services.slice(0, 3);
  const more = earner.services.length - shown.length;

  return (
    <article className="relative flex flex-col rounded-card border border-hairline bg-surface p-4 transition-colors hover:border-ink-faint has-[a[data-card-link]:focus-visible]:outline-2 has-[a[data-card-link]:focus-visible]:outline-offset-2 has-[a[data-card-link]:focus-visible]:outline-leash sm:p-5">
      <div className="flex items-start gap-3">
        <Avatar name={earner.name} size="lg" verified={earner.idVerified} />
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-title font-semibold">
            <Link
              href={`/carers/${earner.id}`}
              data-card-link
              className="after:absolute after:inset-0 after:rounded-card focus-visible:outline-none"
            >
              {earner.name}
            </Link>
          </h3>
          <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-sm text-ink-muted">
            <RatingInline rating={earner.rating} count={earner.reviewCount} />
            <span aria-hidden>·</span>
            <span>{formatDistance(earner.distanceKm)}</span>
          </div>
          <p className="mt-0.5 truncate text-sm text-ink-muted">{earner.area}</p>
        </div>
        <div className="flex shrink-0 flex-col items-end">
          <Money paise={earner.pricePerHourPaise} display suffix="/hr" className="text-title" />
          {status === "signedIn" ? (
            <FavouriteButton
              earnerId={earner.id}
              name={earner.name}
              isFavourite={earner.isFavourite}
              className="relative z-10 -mr-2.5"
            />
          ) : null}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
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

      <div className="mt-auto flex items-center justify-between gap-3 border-t border-hairline pt-3">
        <NextAvailable at={earner.nextAvailableAt} online={earner.isOnline} className="min-w-0" />
        <ButtonLink href={bookHref} className="relative z-10 shrink-0" aria-label={`Book ${earner.name}`}>
          Book {firstName(earner.name)}
        </ButtonLink>
      </div>
    </article>
  );
}

export function CarerCardSkeleton() {
  return (
    <div aria-hidden className="rounded-card border border-hairline bg-surface p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <Skeleton className="size-14 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-3 w-2/3" />
          <Skeleton className="h-3 w-1/3" />
        </div>
        <Skeleton className="h-5 w-16" />
      </div>
      <div className="mt-4 flex gap-2">
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-6 w-24 rounded-full" />
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
      <div className="mt-5 flex items-center justify-between border-t border-hairline pt-3">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-11 w-24" />
      </div>
    </div>
  );
}
