"use client";

import { MessagesSquare } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useChatThreads } from "@/components/layout/use-activity";
import { Avatar } from "@/components/ui/avatar";
import { ButtonLink } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState, QueryView } from "@/components/ui/states";
import { formatAgo } from "@/lib/format";
import { useServiceCatalogue } from "@/lib/queries";
import { cn } from "@/lib/utils";

export function ThreadList({ className }: { className?: string }) {
  const threads = useChatThreads();
  const catalogue = useServiceCatalogue();
  const pathname = usePathname();

  return (
    <div className={className}>
      <QueryView
        query={threads}
        loading={
          <div className="space-y-2" role="status" aria-label="Loading conversations">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex gap-3 rounded-card border border-hairline bg-surface p-4 shadow-card">
                <Skeleton className="size-11 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-3 w-4/5" />
                </div>
              </div>
            ))}
          </div>
        }
        isEmpty={(list) => list.length === 0}
        empty={
          <EmptyState
            icon={<MessagesSquare />}
            title="No messages yet"
            body="Once you book, you can message your carer here."
            action={<ButtonLink href="/carers">Find a carer</ButtonLink>}
          />
        }
      >
        {(list) => (
          <ul className="grid grid-cols-1 gap-2">
            {list.map((thread) => {
              const active = pathname === `/messages/${thread.id}`;
              return (
                <li key={thread.id}>
                  <Link
                    href={`/messages/${thread.id}`}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex gap-3 rounded-card border p-4 transition duration-150",
                      active
                        ? "border-leash bg-sky shadow-[inset_0_0_0_1px_var(--color-leash)]"
                        : "border-hairline bg-surface shadow-card hover:border-ink-faint",
                    )}
                  >
                    <Avatar name={thread.withName} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-2">
                        <p className={cn("truncate", thread.unread > 0 ? "font-bold" : "font-semibold")}>
                          {thread.withName}
                        </p>
                        <span className="shrink-0 text-small text-ink-muted">{formatAgo(thread.lastAt)}</span>
                      </div>
                      <p className="mt-1 truncate text-small text-ink-muted">
                        {catalogue.label(thread.service)} · {thread.bookingCode}
                      </p>
                      <div className="mt-1 flex items-center justify-between gap-2">
                        <p className={cn("truncate text-sm", thread.unread > 0 ? "font-semibold text-ink" : "text-ink-muted")}>
                          {thread.lastMessage || "No messages yet"}
                        </p>
                        {thread.unread > 0 ? (
                          <span className="inline-flex min-w-5 shrink-0 animate-pop-in items-center justify-center rounded-full bg-leash px-2 text-label leading-5 font-bold text-surface">
                            {thread.unread}
                            <span className="sr-only"> unread</span>
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </QueryView>
    </div>
  );
}
