"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";
import { SERVICE_KEYS, SORT_OPTIONS } from "@/lib/labels";
import type { EarnerFilters, EarnerSort, ServiceKey } from "@/lib/types";

/** Chip thresholds, matching the app. */
export const RATING_CHIP = 4.5;
export const BUDGET_CHIP_PAISE = 40000;
export const DISTANCE_CHIP_KM = 5;

export interface BrowseState {
  q: string;
  service: ServiceKey | null;
  availableToday: boolean;
  verifiedOnly: boolean;
  minRating: number | null;
  maxPricePaise: number | null;
  maxDistanceKm: number | null;
  favouritesOnly: boolean;
  sort: EarnerSort;
}

function positiveNumber(value: string | null): number | null {
  if (!value) return null;
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : null;
}

export function parseBrowseState(params: URLSearchParams): BrowseState {
  const service = params.get("service");
  const sort = params.get("sort");
  return {
    q: params.get("q") ?? "",
    service: SERVICE_KEYS.includes(service as ServiceKey) ? (service as ServiceKey) : null,
    availableToday: params.get("availableToday") === "true",
    verifiedOnly: params.get("verifiedOnly") === "true",
    minRating: positiveNumber(params.get("minRating")),
    maxPricePaise: positiveNumber(params.get("maxPricePaise")),
    maxDistanceKm: positiveNumber(params.get("maxDistanceKm")),
    favouritesOnly: params.get("favouritesOnly") === "true",
    sort: SORT_OPTIONS.some((option) => option.value === sort) ? (sort as EarnerSort) : "recommended",
  };
}

function toSearch(state: BrowseState): string {
  const params = new URLSearchParams();
  if (state.q.trim()) params.set("q", state.q.trim());
  if (state.service) params.set("service", state.service);
  if (state.availableToday) params.set("availableToday", "true");
  if (state.verifiedOnly) params.set("verifiedOnly", "true");
  if (state.minRating) params.set("minRating", String(state.minRating));
  if (state.maxPricePaise) params.set("maxPricePaise", String(state.maxPricePaise));
  if (state.maxDistanceKm) params.set("maxDistanceKm", String(state.maxDistanceKm));
  if (state.favouritesOnly) params.set("favouritesOnly", "true");
  if (state.sort !== "recommended") params.set("sort", state.sort);
  return params.toString();
}

/** Browse filters live in the URL, so results can be shared and Back works. */
export function useCarerFilters() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const state = useMemo(() => parseBrowseState(new URLSearchParams(params.toString())), [params]);

  const update = useCallback(
    (patch: Partial<BrowseState>) => {
      const search = toSearch({ ...state, ...patch });
      router.replace(search ? `${pathname}?${search}` : pathname, { scroll: false });
    },
    [state, router, pathname],
  );

  const activeCount = [
    state.service,
    state.availableToday,
    state.verifiedOnly,
    state.minRating,
    state.maxPricePaise,
    state.maxDistanceKm,
    state.favouritesOnly,
    state.q.trim(),
  ].filter(Boolean).length;

  const clear = useCallback(() => {
    router.replace(state.sort === "recommended" ? pathname : `${pathname}?sort=${state.sort}`, { scroll: false });
  }, [router, pathname, state.sort]);

  return { state, update, clear, activeCount };
}

export function toEarnerFilters(state: BrowseState, signedIn: boolean): EarnerFilters {
  return {
    q: state.q.trim() || undefined,
    service: state.service ?? undefined,
    availableToday: state.availableToday || undefined,
    verifiedOnly: state.verifiedOnly || undefined,
    minRating: state.minRating ?? undefined,
    maxPricePaise: state.maxPricePaise ?? undefined,
    maxDistanceKm: state.maxDistanceKm ?? undefined,
    favouritesOnly: signedIn && state.favouritesOnly ? true : undefined,
    sort: state.sort,
    limit: 50,
  };
}
