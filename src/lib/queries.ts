"use client";

import { queryOptions, useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { api } from "./api";
import { SERVICE_DEFAULTS } from "./labels";
import { qk } from "./query-keys";
import type { Service, ServiceKey } from "./types";

export const configQuery = queryOptions({
  queryKey: qk.config,
  queryFn: api.config,
  staleTime: 10 * 60_000,
});

export const servicesQuery = queryOptions({
  queryKey: qk.services,
  queryFn: api.services,
  staleTime: 10 * 60_000,
});

export function useConfig() {
  return useQuery(configQuery);
}

export function useServices() {
  return useQuery(servicesQuery);
}

/** Server labels and prices when loaded, contract defaults until then. */
export function useServiceCatalogue() {
  const { data } = useServices();
  return useMemo(() => {
    const byKey = new Map<ServiceKey, Service>((data ?? []).map((s) => [s.key, s]));
    const get = (key: ServiceKey): Service => byKey.get(key) ?? SERVICE_DEFAULTS[key];
    return {
      loaded: Boolean(data),
      list: data ?? null,
      get,
      label: (key: ServiceKey) => get(key).label,
    };
  }, [data]);
}

/** Free-cancellation window and launch city, with contract defaults. */
export function usePolicy() {
  const { data } = useConfig();
  return {
    freeCancelHours: data?.freeCancelHours ?? 2,
    lateCancelFeePercent: data?.lateCancelFeePercent ?? 50,
    cityName: data?.launchCity.name ?? "Dehradun",
    config: data ?? null,
  };
}

export function usePets() {
  const { status } = useAuth();
  return useQuery({ queryKey: qk.pets, queryFn: api.pets.list, enabled: status === "signedIn" });
}

export function useAddresses() {
  const { status } = useAuth();
  return useQuery({
    queryKey: qk.addresses,
    queryFn: api.addresses.list,
    enabled: status === "signedIn",
  });
}

export function useCartLines() {
  const { status } = useAuth();
  return useQuery({ queryKey: qk.cart, queryFn: api.store.cart, enabled: status === "signedIn" });
}

export function useCartSummary() {
  const { status } = useAuth();
  return useQuery({
    queryKey: qk.cartSummary,
    queryFn: api.store.cartSummary,
    enabled: status === "signedIn",
  });
}
