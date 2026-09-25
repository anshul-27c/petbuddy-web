"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Heart, SearchX } from "lucide-react";
import { Suspense, useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { CarerCard, CarerCardSkeleton } from "@/components/carers/carer-card";
import { SearchBox } from "@/components/carers/search-box";
import {
  BUDGET_CHIP_PAISE,
  DISTANCE_CHIP_KM,
  RATING_CHIP,
  toEarnerFilters,
  useCarerFilters,
} from "@/components/carers/use-carer-filters";
import { Container, PageHeader } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { SelectField } from "@/components/ui/field";
import { PageSkeleton } from "@/components/ui/skeleton";
import { EmptyState, QueryView } from "@/components/ui/states";
import { api } from "@/lib/api";
import { formatMoney } from "@/lib/format";
import { SORT_OPTIONS } from "@/lib/labels";
import { usePolicy, useServiceCatalogue } from "@/lib/queries";
import { qk } from "@/lib/query-keys";
import type { EarnerSort, ServiceKey } from "@/lib/types";
import { PageTitle } from "@/components/layout/page-title";
import { Reveal, revealItem } from "@/components/ui/motion";
import { cn } from "@/lib/utils";

function BrowseCarers() {
  const { status } = useAuth();
  const signedIn = status === "signedIn";
  const { state, update, clear, activeCount } = useCarerFilters();
  const catalogue = useServiceCatalogue();
  const { cityName } = usePolicy();
  const [resetKey, setResetKey] = useState(0);

  const filters = toEarnerFilters(state, signedIn);
  const query = useQuery({
    queryKey: qk.earners(filters),
    queryFn: () => api.earners.list(filters),
    placeholderData: keepPreviousData,
    // Wait for the stored token so favourites and distance are personalised.
    enabled: status !== "loading",
  });

  const clearAll = () => {
    clear();
    setResetKey((key) => key + 1);
  };

  const count = query.data?.length ?? 0;

  return (
    <Container>
      <PageHeader title="Find a carer" subtitle={`Vetted carers for your pet in ${cityName}.`} />

      {/* Filters sit above the list up to 1279 px, and in a sticky panel beside it from 1280 px. */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[20rem_minmax(0,1fr)] xl:items-start xl:gap-8">
        <aside aria-label="Search and filters" className="xl:sticky xl:top-24">
          <div className="xl:rounded-card xl:border xl:border-hairline xl:bg-surface xl:p-5 xl:shadow-card">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_14rem_14rem] xl:grid-cols-1">
              <div className="sm:col-span-2 lg:col-span-1">
                <SearchBox
                  key={resetKey}
                  initial={state.q}
                  onSearch={(q) => update({ q })}
                  label="Search carers by name or area"
                  placeholder="Search by name or area"
                />
              </div>
              <SelectField
                label="Service"
                hideLabel
                value={state.service ?? ""}
                onChange={(event) => update({ service: (event.target.value || null) as ServiceKey | null })}
              >
                <option value="">Any service</option>
                {(catalogue.list ?? []).map((service) => (
                  <option key={service.key} value={service.key}>
                    {service.label}
                  </option>
                ))}
              </SelectField>
              <SelectField
                label="Sort by"
                hideLabel
                value={state.sort}
                onChange={(event) => update({ sort: event.target.value as EarnerSort })}
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    Sort: {option.label}
                  </option>
                ))}
              </SelectField>
            </div>

            <p className="mt-5 mb-3 hidden text-sm font-semibold text-ink xl:block">Filters</p>
            <div
              className="rail mt-3 gap-2 pb-1 lg:mx-0 lg:flex-wrap lg:overflow-visible lg:px-0 lg:pb-0 xl:mt-0"
              role="group"
              aria-label="Filters"
            >
              <Chip selected={state.availableToday} onClick={() => update({ availableToday: !state.availableToday })}>
                Available today
              </Chip>
              <Chip selected={state.verifiedOnly} onClick={() => update({ verifiedOnly: !state.verifiedOnly })}>
                ID verified
              </Chip>
              <Chip
                selected={state.minRating !== null}
                onClick={() => update({ minRating: state.minRating ? null : RATING_CHIP })}
              >
                Rating {RATING_CHIP}+
              </Chip>
              <Chip
                selected={state.maxPricePaise !== null}
                onClick={() => update({ maxPricePaise: state.maxPricePaise ? null : BUDGET_CHIP_PAISE })}
              >
                Under {formatMoney(BUDGET_CHIP_PAISE)}/hr
              </Chip>
              <Chip
                selected={state.maxDistanceKm !== null}
                onClick={() => update({ maxDistanceKm: state.maxDistanceKm ? null : DISTANCE_CHIP_KM })}
              >
                Within {DISTANCE_CHIP_KM} km
              </Chip>
              {signedIn ? (
                <Chip
                  selected={state.favouritesOnly}
                  onClick={() => update({ favouritesOnly: !state.favouritesOnly })}
                  icon={<Heart className="size-4" aria-hidden />}
                >
                  Favourites only
                </Chip>
              ) : null}
            </div>
          </div>
        </aside>

        <div className="min-w-0">
          <div className="mb-3 flex min-h-11 items-center justify-between gap-3">
            <p className="text-sm text-ink-muted" aria-live="polite">
              {query.data ? (
                <>
                  <span className="font-semibold text-ink tabular-nums">{count}</span>{" "}
                  {`${count === 1 ? "carer" : "carers"} available${query.isFetching ? ", updating…" : ""}`}
                </>
              ) : query.isError ? (
                ""
              ) : (
                "Looking for carers…"
              )}
            </p>
            {activeCount > 0 ? (
              <Button variant="ghost" onClick={clearAll} className="-mr-4">
                Clear filters
              </Button>
            ) : null}
          </div>

          <QueryView
            query={query}
            loading={
              <div className="grid grid-cols-1 gap-3 sm:gap-4" role="status" aria-label="Loading carers">
                {Array.from({ length: 4 }, (_, i) => (
                  <CarerCardSkeleton key={i} />
                ))}
              </div>
            }
            isEmpty={(list) => list.length === 0}
            empty={
              state.favouritesOnly && activeCount === 1 ? (
                <EmptyState
                  icon={<Heart />}
                  title="No favourites yet"
                  body="Tap the heart on a carer to save them here. Only carers who are online right now are listed."
                  action={<Button onClick={() => update({ favouritesOnly: false })}>Show all carers</Button>}
                />
              ) : (
                <EmptyState
                  icon={<SearchX />}
                  title="No carers match those filters"
                  body="Try widening the distance, or clear a filter or two."
                  action={activeCount > 0 ? <Button onClick={clearAll}>Clear filters</Button> : undefined}
                />
              )
            }
          >
            {(earners) => (
              <Reveal
                as="ul"
                className={cn("grid grid-cols-1 gap-3 transition-opacity sm:gap-4", query.isFetching && "opacity-70")}
                aria-busy={query.isFetching}
              >
                {earners.map((earner, index) => (
                  <li key={earner.id} className="flex" {...revealItem(index)}>
                    <CarerCard earner={earner} />
                  </li>
                ))}
              </Reveal>
            )}
          </QueryView>
        </div>
      </div>
    </Container>
  );
}

export default function CarersPage() {
  return (
    <>
      <PageTitle title={"Find a carer"} />
      <Suspense fallback={<PageSkeleton />}>
        <BrowseCarers />
      </Suspense>
    </>
  );
}
