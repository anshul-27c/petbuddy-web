import type { ChatMessage } from "./types";

/** What the API pushes down the socket. */
export type RealtimeEvent =
  | { type: "ready" }
  | { type: "chat.message"; threadId: string; message: ChatMessage };

/** `live` once the server has accepted the token. */
export type RealtimeStatus = "offline" | "connecting" | "live";

/** The server's code for a token it will never accept: no point retrying. */
const UNAUTHORIZED = 4401;

const MIN_BACKOFF_MS = 1_000;
const MAX_BACKOFF_MS = 30_000;

/** `https://api.example.com` → `wss://api.example.com/ws`. */
export function realtimeUrl(apiUrl: string): string {
  const url = new URL(apiUrl);
  url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
  url.pathname = "/ws";
  url.search = "";
  url.hash = "";
  return url.toString();
}

/**
 * The live connection to the API's WebSocket, one per signed-in tab.
 *
 * It sends the session token as its first frame (never in the URL), hands
 * pushed events to `onEvent`, and reconnects on its own: with growing,
 * jittered delays after a drop, and straight away when the tab becomes
 * visible or the network comes back. A token the server refuses stops it
 * for good; a new token means a new connection. The REST API stays the
 * source of truth; this only delivers changes sooner.
 */
export class RealtimeConnection {
  #socket: WebSocket | null = null;
  #attempt = 0;
  #timer: ReturnType<typeof setTimeout> | null = null;
  #stopped = false;

  constructor(
    private readonly url: string,
    private readonly token: string,
    private readonly onEvent: (event: RealtimeEvent) => void,
    private readonly onStatus: (status: RealtimeStatus) => void,
  ) {}

  start() {
    this.#stopped = false;
    window.addEventListener("online", this.#retryNow);
    document.addEventListener("visibilitychange", this.#onVisibility);
    this.#connect();
  }

  stop() {
    this.#stopped = true;
    window.removeEventListener("online", this.#retryNow);
    document.removeEventListener("visibilitychange", this.#onVisibility);
    if (this.#timer) clearTimeout(this.#timer);
    this.#timer = null;
    const socket = this.#socket;
    this.#socket = null;
    socket?.close(1000, "Signed out");
    this.onStatus("offline");
  }

  #connect() {
    if (this.#stopped || this.#socket) return;
    this.onStatus("connecting");

    let socket: WebSocket;
    try {
      socket = new WebSocket(this.url);
    } catch {
      this.#scheduleRetry();
      return;
    }
    this.#socket = socket;

    socket.onopen = () =>
      socket.send(JSON.stringify({ type: "auth", token: this.token }));

    socket.onmessage = (message) => {
      let event: RealtimeEvent;
      try {
        event = JSON.parse(String(message.data)) as RealtimeEvent;
      } catch {
        return;
      }
      if (event.type === "ready") {
        this.#attempt = 0;
        this.onStatus("live");
      }
      this.onEvent(event);
    };

    socket.onclose = (close) => {
      if (this.#socket !== socket) return;
      this.#socket = null;
      this.onStatus("offline");
      if (close.code === UNAUTHORIZED) {
        this.#stopped = true;
        return;
      }
      this.#scheduleRetry();
    };

    // An error is always followed by a close, which does the retrying.
    socket.onerror = () => {};
  }

  #scheduleRetry() {
    if (this.#stopped || this.#timer) return;
    const ceiling = Math.min(
      MAX_BACKOFF_MS,
      MIN_BACKOFF_MS * 2 ** this.#attempt,
    );
    this.#attempt += 1;
    // Half to full of the ceiling, so a server restart isn't met by every
    // tab reconnecting in the same instant.
    const delay = ceiling / 2 + Math.random() * (ceiling / 2);
    this.#timer = setTimeout(() => {
      this.#timer = null;
      this.#connect();
    }, delay);
  }

  #retryNow = () => {
    if (this.#stopped || this.#socket) return;
    if (this.#timer) clearTimeout(this.#timer);
    this.#timer = null;
    this.#attempt = 0;
    this.#connect();
  };

  #onVisibility = () => {
    if (document.visibilityState === "visible") this.#retryNow();
  };
}
