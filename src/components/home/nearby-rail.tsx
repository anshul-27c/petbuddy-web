"use client";

import { useQuery } from "@tanstack/react-query";
import { MapPin, Users } from "lucide-react";
import Link from "next/link";
import { NextAvailable } from "@/components/carers/next-available";
import { Avatar } from "@/components/ui/avatar";
import { fullRows } from "@/components/ui/grid";
import { Money } from "@/components/ui/money";
import { Reveal, revealItem, trackPointer } from "@/components/ui/motion";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState, QueryView } from "@/components/ui/states";
import { RatingInline } from "@/components/ui/stars";
import { api } from "@/lib/api";
import { formatDistance } from "@/lib/format";
import { qk } from "@/lib/query-keys";
import { cn } from "@/lib/utils";

const LIMIT = 6;
const COLUMNS = { md: 2, lg: 3, xl: 4 } as const;

/** Shared by the rail and the grid: a phone rail item is 272 px wide, a grid item fills its column. */
const ITEM = "w-68 md:w-auto";

function NearbySkeleton() {
  const rows = fullRows(4, COLUMNS);
  return (
    <div
      className={cn("rail gap-3 md:mx-0 md:grid md:gap-6 md:overflow-visible md:px-0", rows.grid)}
      role="status"
      aria-label="Loading carers"
    >
      {Array.from({ length: 4 }, (_, i) => (
        <div
          key={i}
          aria-hidden
          className={cn(
            ITEM,
            "flex-col rounded-card border border-hairline bg-surface p-4 shadow-card sm:p-5",
            rows.item(i),
          )}
        >
          <div className="flex items-center gap-3">
            <Skeleton className="size-11 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
          <div className="mt-4 flex justify-between">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-5 w-16" />
          </div>
          <Skeleton className="mt-4 h-4 w-3/4" />
        </div>
      ))}
    </div>
  );
}

/**
 * The closest carers: a snapping rail on phones; from 768 px a grid that only
 * shows as many carers as fill whole rows ("See all" has the rest).
 */
export function NearbyRail() {
  const query = useQuery({ queryKey: qk.nearby(LIMIT), queryFn: () => api.earners.nearby({ limit: LIMIT }) });
  return (
    <QueryView
      query={query}
      loading={<NearbySkeleton />}
      isEmpty={(list) => list.length === 0}
      empty={
        <EmptyState
          icon={<Users />}
          title="No carers nearby yet"
          body="We are still signing up carers in your area. Check back soon."
        />
      }
    >
      {(earners) => {
        const rows = fullRows(earners.length, COLUMNS);
        return (
          <Reveal
            as="ul"
            className={cn("rail gap-3 pb-1 md:mx-0 md:grid md:gap-6 md:overflow-visible md:px-0 md:pb-0", rows.grid)}
          >
            {earners.map((earner, index) => (
              <li key={earner.id} className={cn(ITEM, "flex", rows.item(index))} {...revealItem(index)}>
                <Link
                  href={`/carers/${earner.id}`}
                  onPointerMove={trackPointer}
                  className="spotlight lift flex w-full flex-col rounded-card border border-hairline bg-surface p-4 shadow-card sm:p-5"
                >
                  <div className="flex items-center gap-3">
                    <Avatar name={earner.name} verified={earner.idVerified} />
                    <div className="min-w-0">
                      <p className="truncate text-title font-semibold">{earner.name}</p>
                      <p className="mt-1 flex items-center gap-1 truncate text-small text-ink-muted">
                        <MapPin className="size-3.5 shrink-0" aria-hidden />
                        <span className="truncate">
                          {earner.area} · {formatDistance(earner.distanceKm)}
                        </span>
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-baseline justify-between gap-2">
                    <RatingInline rating={earner.rating} count={earner.reviewCount} />
                    <Money paise={earner.pricePerHourPaise} display suffix="/hr" className="text-title" />
                  </div>
                  <div className="mt-auto pt-4">
                    <div className="border-t border-hairline pt-4">
                      <NextAvailable at={earner.nextAvailableAt} size="xs" />
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </Reveal>
        );
      }}
    </QueryView>
  );
}
