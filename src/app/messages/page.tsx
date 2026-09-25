"use client";

import { MessagesSquare } from "lucide-react";
import { ThreadList } from "@/components/chat/thread-list";
import { PageHeader } from "@/components/layout/container";
import { PageTitle } from "@/components/layout/page-title";

export default function MessagesPage() {
  return (
    <>
      <PageTitle title={"Messages"} />
      <div className="lg:hidden">
        <PageHeader title="Messages" />
        <ThreadList />
      </div>
      <div className="relative isolate hidden h-[calc(100dvh-13.5rem)] min-h-[28rem] flex-col items-center justify-center overflow-hidden rounded-card border border-dashed border-hairline bg-surface p-10 text-center lg:flex">
        <div aria-hidden className="bg-dot-grid absolute inset-0 -z-10" />
        <span className="flex size-14 items-center justify-center rounded-card bg-sky text-leash shadow-card ring-8 ring-sky/50">
          <MessagesSquare className="size-6" aria-hidden />
        </span>
        <p className="mt-6 text-title font-semibold">Pick a conversation</p>
        <p className="mt-1 max-w-sm text-sm text-ink-muted">
          Each booking has its own thread with your carer. Numbers stay masked on both sides.
        </p>
      </div>
    </>
  );
}
