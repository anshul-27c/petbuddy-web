"use client";

import { useQuery } from "@tanstack/react-query";
import { Heart } from "lucide-react";
import { AccountNav } from "@/components/account/account-nav";
import { RequireAuth } from "@/components/auth/require-auth";
import { CarerCard, CarerCardSkeleton } from "@/components/carers/carer-card";
import { Container, PageHeader } from "@/components/layout/container";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState, QueryView } from "@/components/ui/states";
import { api } from "@/lib/api";
import { qk } from "@/lib/query-keys";
import type { EarnerFilters } from "@/lib/types";
import { PageTitle } from "@/components/layout/page-title";

const FILTERS: EarnerFilters = { favouritesOnly: true, sort: "recommended", limit: 50 };

function Favourites() {
  const query = useQuery({ queryKey: qk.earners(FILTERS), queryFn: () => api.earners.list(FILTERS) });
  return (
    <Container>
      <PageHeader title="Favourite carers" subtitle="Carers you have saved, ready to book again." />
      <AccountNav />
      <div className="mt-6">
        <QueryView
          query={query}
          loading={
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3" role="status" aria-label="Loading favourites">
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
              <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {list.map((earner) => (
                  <li key={earner.id} className="flex [&>article]:flex-1">
                    <CarerCard earner={earner} />
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-small text-ink-muted">
                A carer who is offline can be booked again as soon as they are back.
              </p>
            </>
          )}
        </QueryView>
      </div>
    </Container>
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
