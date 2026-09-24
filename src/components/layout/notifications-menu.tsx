"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Bell, CalendarCheck, MessageCircle, Package, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { Popover } from "@/components/ui/popover";
import { ErrorState } from "@/components/ui/states";
import { api } from "@/lib/api";
import { formatAgo } from "@/lib/format";
import { qk } from "@/lib/query-keys";
import type { Notification } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useNotifications } from "./use-activity";

function routeFor(notification: Notification): string | null {
  const { bookingId, threadId, orderId } = notification.data ?? {};
  if (threadId) return `/messages/${threadId}`;
  if (bookingId) return `/bookings/${bookingId}`;
  if (orderId) return `/orders/${orderId}`;
  return null;
}

function KindIcon({ kind }: { kind: Notification["kind"] }) {
  const className = "size-4";
  if (kind === "chat") return <MessageCircle className={className} aria-hidden />;
  if (kind === "order") return <Package className={className} aria-hidden />;
  if (kind === "booking") return <CalendarCheck className={className} aria-hidden />;
  return <Sparkles className={className} aria-hidden />;
}

export function NotificationsMenu() {
  const query = useNotifications();
  const unread = query.data?.meta.unread ?? 0;
  const router = useRouter();
  const queryClient = useQueryClient();

  const markRead = useMutation({
    mutationFn: (id: string) => api.notifications.read(id),
    onSettled: () => queryClient.invalidateQueries({ queryKey: qk.notifications }),
  });
  const markAll = useMutation({
    mutationFn: api.notifications.readAll,
    onSettled: () => queryClient.invalidateQueries({ queryKey: qk.notifications }),
  });

  return (
    <Popover
      panelClassName="fixed inset-x-3 top-16 sm:absolute sm:inset-x-auto sm:top-full sm:right-0 sm:mt-2 sm:w-96"
      trigger={(props) => (
        <button
          type="button"
          {...props}
          className="relative inline-flex size-11 items-center justify-center rounded-full text-ink hover:bg-canvas"
          aria-label={unread > 0 ? `Notifications, ${unread} unread` : "Notifications"}
        >
          <Bell className="size-5" aria-hidden />
          {unread > 0 ? (
            <span className="absolute top-1.5 right-1.5 inline-flex min-w-4.5 items-center justify-center rounded-full bg-alert px-1 text-[0.625rem] leading-4.5 font-bold text-surface">
              {unread > 9 ? "9+" : unread}
            </span>
          ) : null}
        </button>
      )}
    >
      {(close) => (
        <div>
          <div className="flex items-center justify-between gap-2 border-b border-hairline px-4 py-3">
            <h2 className="text-title font-semibold">Notifications</h2>
            {unread > 0 ? (
              <button
                type="button"
                className="min-h-11 rounded-field px-2 text-sm font-semibold text-leash-dark hover:bg-sky disabled:opacity-50"
                onClick={() => markAll.mutate()}
                disabled={markAll.isPending}
              >
                Mark all as read
              </button>
            ) : null}
          </div>
          <div className="max-h-[min(28rem,70dvh)] overflow-y-auto p-2">
            {query.data === undefined ? (
              query.isError ? (
                <ErrorState
                  error={query.error}
                  onRetry={() => void query.refetch()}
                  retrying={query.isFetching}
                  className="border-0"
                />
              ) : (
                <div className="space-y-3 p-2" role="status" aria-label="Loading">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="flex gap-3">
                      <Skeleton className="size-8 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-3.5 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : query.data.data.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <p className="font-semibold">You are all caught up</p>
                <p className="mt-1 text-sm text-ink-muted">Booking updates and messages will show up here.</p>
              </div>
            ) : (
              <ul>
                {query.data.data.map((notification) => {
                  const isUnread = !notification.readAt;
                  const href = routeFor(notification);
                  return (
                    <li key={notification.id}>
                      <button
                        type="button"
                        className={cn(
                          "flex w-full gap-3 rounded-field p-3 text-left hover:bg-canvas",
                          isUnread && "bg-sky/60",
                        )}
                        onClick={() => {
                          if (isUnread) markRead.mutate(notification.id);
                          close();
                          if (href) router.push(href);
                        }}
                      >
                        <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-sky text-leash">
                          <KindIcon kind={notification.kind} />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex items-start justify-between gap-2">
                            <span className="text-sm font-semibold">{notification.title}</span>
                            {isUnread ? (
                              <span className="mt-1.5 size-2 shrink-0 rounded-full bg-leash">
                                <span className="sr-only">Unread</span>
                              </span>
                            ) : null}
                          </span>
                          <span className="mt-0.5 block text-sm text-ink-muted">{notification.body}</span>
                          <span className="mt-1 block text-small text-ink-muted">
                            {formatAgo(notification.createdAt)}
                          </span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      )}
    </Popover>
  );
}
