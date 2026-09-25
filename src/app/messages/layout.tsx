"use client";

import type { ReactNode } from "react";
import { RequireAuth } from "@/components/auth/require-auth";
import { ThreadList } from "@/components/chat/thread-list";
import { Container } from "@/components/layout/container";

/**
 * Conversations on the left and the open thread on the right, from 1024 px.
 * The chat fills the screen, so this page trades the usual space above the
 * footer for its own 24 / 40 px.
 */
export default function MessagesLayout({ children }: { children: ReactNode }) {
  return (
    <RequireAuth>
      <Container className="-mb-16 pb-6 sm:-mb-24 sm:pb-10">
        <h1 className="hidden pt-10 pb-8 font-display text-display font-semibold lg:block">Messages</h1>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[22rem_minmax(0,1fr)] lg:gap-8">
          <aside className="hidden lg:block" aria-label="Conversations">
            <ThreadList />
          </aside>
          <div className="min-w-0">{children}</div>
        </div>
      </Container>
    </RequireAuth>
  );
}
