"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, type ReactNode } from "react";
import { RequireAuth } from "@/components/auth/require-auth";
import { ThreadList } from "@/components/chat/thread-list";
import { Container, PageHeader } from "@/components/layout/container";
import { useChatThreads } from "@/components/layout/use-activity";
import { cn } from "@/lib/utils";

/**
 * From 1024 px: the title, then conversations on the left and the open thread
 * on the right. Below that each page draws its own screen (the list, or one
 * thread). With no conversations at all there is no list to show beside the
 * thread, so the page's empty state takes the whole width.
 */
function MessagesFrame({ children }: { children: ReactNode }) {
  const threads = useChatThreads();
  const none = threads.data?.length === 0;
  const pathname = usePathname();
  const list = useRef<HTMLElement>(null);

  // Keep the open conversation in view in the side list (it scrolls on its own).
  useEffect(() => {
    const aside = list.current;
    const item = aside?.querySelector<HTMLElement>('[aria-current="page"]');
    if (!aside || !item) return;
    const top = item.getBoundingClientRect().top - aside.getBoundingClientRect().top;
    if (top < 0 || top + item.offsetHeight > aside.clientHeight) aside.scrollTop += top - 8;
  }, [pathname, threads.data]);

  return (
    <Container grow>
      <PageHeader title="Messages" className="hidden lg:block" />
      <div
        className={cn(
          "flex flex-1 flex-col lg:grid lg:gap-8",
          none ? "lg:grid-cols-1" : "lg:grid-cols-[22rem_minmax(0,1fr)]",
        )}
      >
        {none ? null : (
          // As tall as the open thread, scrolling on its own, so a long history does not stretch the page.
          <aside
            ref={list}
            className="-m-1 hidden overflow-y-auto overscroll-contain p-1 lg:block lg:h-[calc(100dvh-12.875rem+0.5rem)]"
            aria-label="Conversations"
          >
            <ThreadList />
          </aside>
        )}
        <div className="flex min-w-0 flex-1 flex-col">{children}</div>
      </div>
    </Container>
  );
}

export default function MessagesLayout({ children }: { children: ReactNode }) {
  return (
    <RequireAuth>
      <MessagesFrame>{children}</MessagesFrame>
    </RequireAuth>
  );
}
