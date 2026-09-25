"use client";

import Image from "next/image";
import { Fragment, useEffect, useRef } from "react";
import { formatDay, formatTime } from "@/lib/format";
import type { ChatMessage } from "@/lib/types";
import { cn } from "@/lib/utils";

function dayKey(iso: string) {
  const date = new Date(iso);
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

/** Messages oldest first, with day separators. System messages sit centred and muted. */
export function MessageList({ messages, className }: { messages: ChatMessage[]; className?: string }) {
  const scroller = useRef<HTMLDivElement>(null);
  const nearBottom = useRef(true);
  const lastId = messages[messages.length - 1]?.id;

  // Keep the newest message in view unless the person has scrolled up to read.
  useEffect(() => {
    const element = scroller.current;
    if (element && nearBottom.current) element.scrollTop = element.scrollHeight;
  }, [lastId]);

  if (messages.length === 0) {
    return (
      <div className={cn("flex items-center justify-center p-6 text-center text-sm text-ink-muted", className)}>
        No messages yet. Say hello, or share anything your carer should know.
      </div>
    );
  }

  return (
    <div
      ref={scroller}
      className={cn("overflow-y-auto px-3 py-4 sm:px-5", className)}
      onScroll={(event) => {
        const element = event.currentTarget;
        nearBottom.current = element.scrollHeight - element.scrollTop - element.clientHeight < 80;
      }}
      role="log"
      aria-live="polite"
      aria-label="Messages"
    >
      <ol className="space-y-2">
        {messages.map((message, index) => {
          const newDay = index === 0 || dayKey(messages[index - 1].at) !== dayKey(message.at);
          return (
            <Fragment key={message.id}>
              {newDay ? (
                <li className="flex justify-center py-2" aria-hidden>
                  <span className="rounded-full bg-surface px-3 py-1 text-label font-semibold text-ink-muted shadow-card">
                    {formatDay(message.at)}
                  </span>
                </li>
              ) : null}
              {message.isSystem ? (
                <li className="px-6 py-1 text-center text-small text-ink-muted">
                  {message.text}
                  <span className="sr-only">, {formatTime(message.at)}</span>
                </li>
              ) : (
                <li className={cn("flex", message.fromMe ? "justify-end" : "justify-start")}>
                  <div
                    className={cn(
                      "max-w-[85%] animate-rise-in rounded-card px-4 py-3 sm:max-w-[70%]",
                      message.fromMe
                        ? "rounded-br-md bg-linear-to-br from-leash to-leash-dark text-surface shadow-cta"
                        : "rounded-bl-md border border-hairline bg-surface text-ink shadow-card",
                    )}
                  >
                    <span className="sr-only">{message.fromMe ? "You: " : "Them: "}</span>
                    {message.photoUrl ? (
                      <a href={message.photoUrl} target="_blank" rel="noreferrer" className="mb-2 block overflow-hidden rounded-field">
                        <Image
                          src={message.photoUrl}
                          alt="Photo in chat"
                          width={480}
                          height={360}
                          unoptimized
                          className="h-auto w-full"
                        />
                      </a>
                    ) : null}
                    {message.text ? <p className="whitespace-pre-line break-words">{message.text}</p> : null}
                    <p className={cn("mt-1 text-right text-label", message.fromMe ? "text-sky" : "text-ink-muted")}>
                      {formatTime(message.at)}
                    </p>
                  </div>
                </li>
              )}
            </Fragment>
          );
        })}
      </ol>
    </div>
  );
}
