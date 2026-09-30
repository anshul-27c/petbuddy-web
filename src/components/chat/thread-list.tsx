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

/** `fill`: the list is the page's main content, so its empty state centres in the page. */
export function ThreadList({ className, fill = false }: { className?: string; fill?: boolean }) {
  const threads = useChatThreads();
  const catalogue = useServiceCatalogue();
  const pathname = usePathname();

  return (
    <div className={cn(fill && "flex flex-1 flex-col", className)}>
      <QueryView
        query={threads}
        fill={fill}
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
            fill={fill}
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
                        <span className="shrink-0 text-caption text-ink-muted">{formatAgo(thread.lastAt)}</span>
                      </div>
                      <p className="mt-1 truncate text-caption text-ink-muted">
                        {catalogue.label(thread.service)} · {thread.bookingCode}
                      </p>
                      <div className="mt-1 flex items-center justify-between gap-2">
                        <p className={cn("truncate text-sm", thread.unread > 0 ? "font-semibold text-ink" : "text-ink-muted")}>
                          {thread.lastMessage || "No messages yet"}
                        </p>
                        {thread.unread > 0 ? (
                          <span className="inline-flex h-5 min-w-5 shrink-0 animate-pop-in items-center justify-center rounded-full bg-leash-dark px-2 text-xs font-bold text-surface">
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
