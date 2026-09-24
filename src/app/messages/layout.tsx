"use client";

import type { ReactNode } from "react";
import { RequireAuth } from "@/components/auth/require-auth";
import { ThreadList } from "@/components/chat/thread-list";
import { Container } from "@/components/layout/container";

/** Conversations on the left and the open thread on the right, on larger screens. */
export default function MessagesLayout({ children }: { children: ReactNode }) {
  return (
    <RequireAuth>
      <Container className="pt-6 sm:pt-10">
        <div className="grid gap-6 lg:grid-cols-[21rem_1fr]">
          <aside className="hidden lg:block" aria-label="Conversations">
            <h1 className="mb-4 font-display text-headline font-semibold">Messages</h1>
            <ThreadList />
          </aside>
          <div className="min-w-0">{children}</div>
        </div>
      </Container>
    </RequireAuth>
  );
}
