"use client";

import { MessagesSquare } from "lucide-react";
import { ThreadList } from "@/components/chat/thread-list";
import { PageHeader } from "@/components/layout/container";
import { PageTitle } from "@/components/layout/page-title";
import { useChatThreads } from "@/components/layout/use-activity";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/states";

export default function MessagesPage() {
  const threads = useChatThreads();
  const none = threads.data?.length === 0;
  return (
    <>
      <PageTitle title={"Messages"} />
      {/* Phones and tablets: the title and the list (or its empty state). */}
      <div className="flex flex-1 flex-col lg:hidden">
        <PageHeader title="Messages" />
        <ThreadList fill />
      </div>
      {/* From 1024 px the list is beside this panel. */}
      <div className="hidden flex-1 flex-col lg:flex">
        {none ? (
          <EmptyState
            fill
            icon={<MessagesSquare />}
            title="No messages yet"
            body="Once you book, you can message your carer here."
            action={<ButtonLink href="/carers">Find a carer</ButtonLink>}
          />
        ) : (
          <EmptyState
            fill
            icon={<MessagesSquare />}
            title="Pick a conversation"
            body="Each booking has its own thread with your carer. Numbers stay masked on both sides."
          />
        )}
      </div>
    </>
  );
}
