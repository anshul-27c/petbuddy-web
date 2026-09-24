"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/components/auth/auth-provider";
import { api } from "@/lib/api";
import { qk } from "@/lib/query-keys";

/** Chat threads, refreshed in the background so the header dot stays current. */
export function useChatThreads() {
  const { status } = useAuth();
  return useQuery({
    queryKey: qk.chats,
    queryFn: api.chats.list,
    enabled: status === "signedIn",
    refetchInterval: 30_000,
  });
}

export function useUnreadMessages(): number {
  const { data } = useChatThreads();
  return (data ?? []).reduce((sum, thread) => sum + (thread.unread > 0 ? thread.unread : 0), 0);
}

export function useNotifications() {
  const { status } = useAuth();
  return useQuery({
    queryKey: qk.notifications,
    queryFn: () => api.notifications.list(1, 20),
    enabled: status === "signedIn",
    refetchInterval: 60_000,
  });
}
