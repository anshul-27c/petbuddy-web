"use client";

import { useQueryClient } from "@tanstack/react-query";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { getToken, subscribeToken } from "@/lib/auth-token";
import { API_URL } from "@/lib/env";
import { qk } from "@/lib/query-keys";
import {
  RealtimeConnection,
  realtimeUrl,
  type RealtimeEvent,
  type RealtimeStatus,
} from "@/lib/realtime";
import type { ChatThread } from "@/lib/types";

const RealtimeContext = createContext<RealtimeStatus>("offline");

const serverSnapshot = () => null;

/**
 * Keeps the signed-in tab connected to the API's live updates and folds
 * each event into the query cache: a new message appears in its open
 * conversation at once, and the conversation list and badges refresh.
 */
export function RealtimeProvider({ children }: { children: ReactNode }) {
  const token = useSyncExternalStore(subscribeToken, getToken, serverSnapshot);
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<RealtimeStatus>("offline");

  useEffect(() => {
    if (!token) return;

    const onEvent = (event: RealtimeEvent) => {
      if (event.type !== "chat.message") return;
      const { threadId, message } = event;

      queryClient.setQueryData<ChatThread>(qk.chat(threadId), (thread) => {
        if (!thread || thread.messages.some((m) => m.id === message.id))
          return thread;
        return {
          ...thread,
          messages: [...thread.messages, message],
          lastAt: message.at,
          lastMessage: message.text,
          // Counted as unread until the open conversation marks it read,
          // which it does as soon as it sees a count above zero.
          unread: message.fromMe ? thread.unread : thread.unread + 1,
        };
      });
      void queryClient.invalidateQueries({ queryKey: qk.chats });
      void queryClient.invalidateQueries({ queryKey: qk.notifications });
    };

    const connection = new RealtimeConnection(
      realtimeUrl(API_URL),
      token,
      onEvent,
      setStatus,
    );
    connection.start();
    return () => connection.stop();
  }, [token, queryClient]);

  return (
    <RealtimeContext.Provider value={token ? status : "offline"}>
      {children}
    </RealtimeContext.Provider>
  );
}

/** `live` while pushed updates are arriving, so polling can slow down. */
export function useRealtimeStatus(): RealtimeStatus {
  return useContext(RealtimeContext);
}
