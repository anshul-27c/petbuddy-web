"use client";

import { useQuery } from "@tanstack/react-query";
import { Heart } from "lucide-react";
import { AccountShell } from "@/components/account/account-nav";
import { RequireAuth } from "@/components/auth/require-auth";
import { CarerCard, CarerCardSkeleton } from "@/components/carers/carer-card";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState, QueryView } from "@/components/ui/states";
import { api } from "@/lib/api";
import { qk } from "@/lib/query-keys";
import type { EarnerFilters } from "@/lib/types";
import { PageTitle } from "@/components/layout/page-title";
import { Reveal, revealItem } from "@/components/ui/motion";

const FILTERS: EarnerFilters = { favouritesOnly: true, sort: "recommended", limit: 50 };

function Favourites() {
  const query = useQuery({ queryKey: qk.earners(FILTERS), queryFn: () => api.earners.list(FILTERS) });
  return (
    <AccountShell title="Favourite carers" subtitle="Carers you have saved, ready to book again.">
      <div>
        <QueryView
          query={query}
          loading={
            <div className="grid grid-cols-1 gap-3 sm:gap-4" role="status" aria-label="Loading favourites">
              <CarerCardSkeleton />
              <CarerCardSkeleton />
            </div>
          }
          isEmpty={(list) => list.length === 0}
          empty={
            <EmptyState
              icon={<Heart />}
              title="No favourite carers yet"
              body="Tap the heart on a carer to save them here."
              action={<ButtonLink href="/carers">Find a carer</ButtonLink>}
            />
          }
        >
          {(list) => (
            <>
              <Reveal as="ul" className="grid grid-cols-1 gap-3 sm:gap-4">
                {list.map((earner, index) => (
                  <li key={earner.id} className="flex" {...revealItem(index)}>
                    <CarerCard earner={earner} />
                  </li>
                ))}
              </Reveal>
              <p className="mt-4 text-small text-ink-muted">
                A carer who is offline can be booked again as soon as they are back.
              </p>
            </>
          )}
        </QueryView>
      </div>
    </AccountShell>
  );
}

export default function FavouritesPage() {
  return (
    <>
      <PageTitle title={"Favourite carers"} />
      <RequireAuth>
        <Favourites />
      </RequireAuth>
    </>
  );
}
