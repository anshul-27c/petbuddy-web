"use client";

import { MessagesSquare } from "lucide-react";
import { ThreadList } from "@/components/chat/thread-list";
import { PageTitle } from "@/components/layout/page-title";

export default function MessagesPage() {
  return (
    <>
      <PageTitle title={"Messages"} />
        <div className="lg:hidden">
          <h1 className="mb-4 font-display text-headline font-semibold">Messages</h1>
          <ThreadList />
        </div>
        <div className="hidden min-h-96 flex-col items-center justify-center rounded-card border border-dashed border-hairline bg-surface p-10 text-center lg:mt-14 lg:flex">
          <span className="flex size-14 items-center justify-center rounded-full bg-sky text-leash">
            <MessagesSquare className="size-6" aria-hidden />
          </span>
          <p className="mt-4 text-title font-semibold">Pick a conversation</p>
          <p className="mt-1 max-w-sm text-sm text-ink-muted">
            Each booking has its own thread with your carer. Numbers stay masked on both sides.
          </p>
        </div>
    </>
  );
}
