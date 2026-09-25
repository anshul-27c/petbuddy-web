"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, MessageSquareOff, Phone } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { Composer } from "@/components/chat/composer";
import { PageTitle } from "@/components/layout/page-title";
import { MessageList } from "@/components/chat/message-list";
import { Avatar } from "@/components/ui/avatar";
import { ButtonLink } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState, ErrorState } from "@/components/ui/states";
import { api, isApiError } from "@/lib/api";
import { formatDayTime, formatMaskedPhone } from "@/lib/format";
import { useServiceCatalogue } from "@/lib/queries";
import { qk } from "@/lib/query-keys";
import type { ChatThread } from "@/lib/types";

function useMarkRead(thread: ChatThread) {
  const queryClient = useQueryClient();
  const markedFor = useRef<string | null>(null);
  const newestId = thread.messages[thread.messages.length - 1]?.id ?? "none";
  const key = `${thread.id}:${newestId}`;
  const { mutate } = useMutation({
    mutationFn: (threadId: string) => api.chats.markRead(threadId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: qk.chats });
      void queryClient.invalidateQueries({ queryKey: qk.notifications });
    },
  });

  // Mark read on open, and again when something new arrives while it is open.
  useEffect(() => {
    if (key === markedFor.current) return;
    const firstTime = markedFor.current === null;
    markedFor.current = key;
    if (firstTime || thread.unread > 0) mutate(thread.id);
  }, [key, thread.id, thread.unread, mutate]);
}

function Thread({ thread }: { thread: ChatThread }) {
  const catalogue = useServiceCatalogue();
  const queryClient = useQueryClient();
  useMarkRead(thread);

  const send = useMutation({
    mutationFn: (text: string) => api.chats.send(thread.id, text),
    onSuccess: (updated) => {
      queryClient.setQueryData(qk.chat(thread.id), updated);
      void queryClient.invalidateQueries({ queryKey: qk.chats });
    },
  });

  return (
    <div className="flex h-[calc(100dvh-6.5rem)] min-h-[28rem] flex-col overflow-hidden rounded-card border border-hairline bg-mist shadow-card sm:h-[calc(100dvh-8rem)] lg:h-[calc(100dvh-13.5rem)]">
      <div className="flex items-center gap-3 border-b border-hairline bg-surface px-3 py-3 sm:px-5">
        <Link
          href="/messages"
          className="inline-flex size-11 shrink-0 items-center justify-center rounded-full hover:bg-canvas lg:hidden"
          aria-label="All messages"
        >
          <ArrowLeft className="size-5" aria-hidden />
        </Link>
        <Avatar name={thread.withName} />
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-title font-semibold">{thread.withName}</h1>
          <Link
            href={`/bookings/${thread.bookingId}`}
            className="mt-1 block truncate text-small text-leash-dark hover:underline"
          >
            {catalogue.label(thread.service)} · {formatDayTime(thread.bookingStart)} · {thread.bookingCode}
          </Link>
        </div>
      </div>
      <p className="flex items-center justify-center gap-2 border-b border-hairline bg-sky/60 px-3 py-2 text-center text-small text-leash-dark">
        <Phone className="size-3.5" aria-hidden />
        <span>
          {thread.maskedPhone ? `${formatMaskedPhone(thread.maskedPhone)} · ` : ""}Numbers are masked on both sides.
        </span>
      </p>
      <MessageList messages={thread.messages} className="min-h-0 flex-1" />
      <Composer onSend={(text) => send.mutateAsync(text)} sending={send.isPending} error={send.error} />
    </div>
  );
}

export default function ChatThreadPage() {
  const { id } = useParams<{ id: string }>();
  const query = useQuery({
    queryKey: qk.chat(id),
    queryFn: () => api.chats.get(id),
    refetchInterval: 4000,
  });
  const title = <PageTitle title={query.data ? `Chat with ${query.data.withName}` : "Messages"} />;

  if (query.data) {
    return (
      <div className="pt-4 sm:pt-6 lg:pt-0">
        {title}
        <Thread thread={query.data} />
      </div>
    );
  }
  if (query.isError) {
    if (isApiError(query.error) && query.error.status === 404) {
      return (
        <div className="pt-4 sm:pt-6 lg:pt-0">
          {title}
          <EmptyState
            icon={<MessageSquareOff />}
            title="We could not find that conversation"
            body="It may belong to another account, or the link is wrong."
            action={<ButtonLink href="/messages">See your messages</ButtonLink>}
          />
        </div>
      );
    }
    return (
      <div className="pt-4 sm:pt-6 lg:pt-0">
        {title}
        <ErrorState error={query.error} onRetry={() => void query.refetch()} retrying={query.isFetching} />
      </div>
    );
  }
  return (
    <div className="pt-4 sm:pt-6 lg:pt-0">
      <div
        className="flex h-[calc(100dvh-6.5rem)] min-h-[28rem] flex-col gap-4 rounded-card border border-hairline bg-surface p-5 shadow-card sm:h-[calc(100dvh-8rem)] lg:h-[calc(100dvh-13.5rem)]"
        role="status"
        aria-label="Loading conversation"
      >
        <div className="flex items-center gap-3">
          <Skeleton className="size-11 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
        <Skeleton className="h-12 w-2/3" />
        <Skeleton className="ml-auto h-12 w-1/2" />
        <Skeleton className="h-12 w-3/5" />
      </div>
    </div>
  );
}
