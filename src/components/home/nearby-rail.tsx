"use client";

import { useQuery } from "@tanstack/react-query";
import { Users } from "lucide-react";
import Link from "next/link";
import { NextAvailable } from "@/components/carers/next-available";
import { Avatar } from "@/components/ui/avatar";
import { Money } from "@/components/ui/money";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState, QueryView } from "@/components/ui/states";
import { RatingInline } from "@/components/ui/stars";
import { api } from "@/lib/api";
import { formatDistance } from "@/lib/format";
import { qk } from "@/lib/query-keys";

const LIMIT = 6;

/** The closest carers, as a scrolling rail on phones and a grid on desktop. */
export function NearbyRail() {
  const query = useQuery({ queryKey: qk.nearby(LIMIT), queryFn: () => api.earners.nearby({ limit: LIMIT }) });
  return (
    <QueryView
      query={query}
      loading={
        <div className="flex gap-3 overflow-hidden" role="status" aria-label="Loading carers">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="h-44 w-60 shrink-0 rounded-card lg:w-auto lg:flex-1" />
          ))}
        </div>
      }
      isEmpty={(list) => list.length === 0}
      empty={
        <EmptyState
          icon={<Users />}
          title="No carers nearby yet"
          body="We are still signing up carers in your area. Check back soon."
        />
      }
    >
      {(earners) => (
        <ul className="scrollbar-none relative -mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:px-6 lg:mx-0 lg:grid lg:grid-cols-3 lg:overflow-visible lg:px-0">
          {earners.map((earner) => (
            <li key={earner.id} className="w-64 shrink-0 snap-start lg:w-auto">
              <Link
                href={`/carers/${earner.id}`}
                className="flex h-full flex-col rounded-card border border-hairline bg-surface p-4 transition-colors hover:border-leash"
              >
                <div className="flex items-center gap-3">
                  <Avatar name={earner.name} verified={earner.idVerified} />
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{earner.name}</p>
                    <p className="truncate text-small text-ink-muted">
                      {earner.area} · {formatDistance(earner.distanceKm)}
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <RatingInline rating={earner.rating} count={earner.reviewCount} />
                  <Money paise={earner.pricePerHourPaise} display suffix="/hr" className="text-title" />
                </div>
                <NextAvailable at={earner.nextAvailableAt} className="mt-3 text-small" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </QueryView>
  );
}
