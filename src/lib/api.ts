/**
 * The one client for the PetBuddy customer API (`/api/v1`).
 * Every call the website makes goes through `request` below.
 */
import { clearToken, getToken } from "./auth-token";
import { API_URL } from "./env";
import type {
  Address,
  AddressInput,
  ApiErrorBody,
  AuthSession,
  Booking,
  BookingInput,
  BookingScope,
  CartLine,
  CartSummary,
  ChatThread,
  DayAvailability,
  Earner,
  EarnerDetail,
  EarnerFilters,
  MeResponse,
  Notification,
  NotificationMeta,
  Order,
  OrderInput,
  OtpSent,
  Paginated,
  PageMeta,
  PaymentOrder,
  PaymentPurpose,
  Pet,
  PetInput,
  PriceBreakdown,
  Product,
  ProductCategory,
  ProfileInput,
  PublicConfig,
  QuoteInput,
  RateInput,
  ReviewsPage,
  Service,
  ServiceKey,
  SosResult,
} from "./types";

// ---- Errors --------------------------------------------------------------

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly action: string | null;
  readonly fieldErrors: Record<string, string>;

  constructor(init: {
    status: number;
    code: string;
    message: string;
    action?: string | null;
    fieldErrors?: Record<string, string>;
  }) {
    super(init.message);
    this.name = "ApiError";
    this.status = init.status;
    this.code = init.code;
    this.action = init.action ?? null;
    this.fieldErrors = init.fieldErrors ?? {};
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

const FALLBACK_COPY: Record<number, [string, string]> = {
  0: ["We could not reach PetBuddy", "Check your connection and try again."],
  400: ["That request did not look right", "Refresh the page and try again."],
  401: ["Please sign in again", "Your session has ended."],
  403: ["You cannot do that", "This action is not available on your account."],
  404: ["We could not find that", "It may have been removed, or the link is wrong."],
  409: ["That could not be done right now", "Refresh and try again."],
  422: ["Some details need fixing", "Check the highlighted fields."],
  429: ["Too many attempts", "Wait a few minutes and try again."],
  500: ["Something went wrong on our side", "Try again in a moment."],
};

function fallbackCopy(status: number): [string, string] {
  if (FALLBACK_COPY[status]) return FALLBACK_COPY[status];
  if (status >= 500) return FALLBACK_COPY[500];
  return ["Something went wrong", "Try again."];
}

function errorFromBody(status: number, body: ApiErrorBody | null): ApiError {
  const [message, action] = fallbackCopy(status);
  const fieldErrors: Record<string, string> = {};
  for (const item of body?.errors ?? []) {
    if (item?.field && !fieldErrors[item.field]) fieldErrors[item.field] = item.message;
  }
  return new ApiError({
    status,
    code: body?.code ?? (status === 0 ? "E_NETWORK" : `E_HTTP_${status}`),
    message: body?.message || message,
    action: body?.action || action,
    fieldErrors,
  });
}

// ---- Transport -----------------------------------------------------------

type QueryValue = string | number | boolean | null | undefined;

interface RequestOptions {
  query?: Record<string, QueryValue>;
  body?: unknown;
  /** Send the bearer token when one is stored. Defaults to true. */
  auth?: boolean;
  /** Do not treat a 401 as "signed out" (used by sign-out itself). */
  ignoreUnauthorized?: boolean;
  signal?: AbortSignal;
}

let unauthorizedHandler: (() => void) | null = null;

/** Called after any 401 on an authenticated request, once the token is cleared. */
export function setUnauthorizedHandler(handler: (() => void) | null) {
  unauthorizedHandler = handler;
}

function buildUrl(path: string, query?: Record<string, QueryValue>) {
  const url = new URL(`${API_URL}/api/v1${path}`);
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value === undefined || value === null || value === false || value === "") continue;
    url.searchParams.set(key, String(value));
  }
  return url.toString();
}

async function send(method: string, path: string, options: RequestOptions = {}) {
  const token = options.auth === false ? null : getToken();
  const headers: Record<string, string> = { Accept: "application/json" };
  if (options.body !== undefined) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;

  let response: Response;
  try {
    response = await fetch(buildUrl(path, options.query), {
      method,
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
      signal: options.signal,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") throw error;
    throw errorFromBody(0, null);
  }

  if (response.status === 204) return null;

  let body: unknown = null;
  const text = await response.text();
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = null;
    }
  }

  if (!response.ok) {
    const error = errorFromBody(response.status, body as ApiErrorBody | null);
    if (response.status === 401 && token && !options.ignoreUnauthorized) {
      clearToken();
      unauthorizedHandler?.();
    }
    throw error;
  }

  return body as { data?: unknown; meta?: unknown } | null;
}

/** Calls the API and unwraps `{ data }`. */
export async function request<T>(method: string, path: string, options?: RequestOptions) {
  const body = await send(method, path, options);
  return (body?.data ?? null) as T;
}

/** Calls a paginated endpoint and returns `{ data, meta }`. */
export async function requestPage<T, M extends PageMeta = PageMeta>(
  path: string,
  options?: RequestOptions,
): Promise<Paginated<T, M>> {
  const body = await send("GET", path, options);
  return {
    data: (body?.data ?? []) as T[],
    meta: (body?.meta ?? { total: 0, perPage: 20, currentPage: 1, lastPage: 1 }) as M,
  };
}

// ---- Endpoints -----------------------------------------------------------

const id = (value: string) => encodeURIComponent(value);

export const api = {
  auth: {
    sendOtp: (phone: string) =>
      request<OtpSent>("POST", "/auth/otp", { body: { phone }, auth: false }),
    verifyOtp: (phone: string, code: string) =>
      request<AuthSession>("POST", "/auth/otp/verify", {
        body: { phone, code, client: "web" },
        auth: false,
      }),
    logout: () => request<null>("POST", "/auth/logout", { ignoreUnauthorized: true }),
  },

  me: {
    get: () => request<MeResponse>("GET", "/me"),
    update: (input: ProfileInput) => request<MeResponse>("PATCH", "/me", { body: input }),
    remove: () => request<null>("DELETE", "/me"),
  },

  config: () => request<PublicConfig>("GET", "/config"),
  services: () => request<Service[]>("GET", "/services"),

  pets: {
    list: () => request<Pet[]>("GET", "/pets"),
    create: (input: PetInput) => request<Pet>("POST", "/pets", { body: input }),
    update: (petId: string, input: PetInput) =>
      request<Pet>("PUT", `/pets/${id(petId)}`, { body: input }),
    remove: (petId: string) => request<null>("DELETE", `/pets/${id(petId)}`),
  },

  addresses: {
    list: () => request<Address[]>("GET", "/addresses"),
    create: (input: AddressInput) => request<Address>("POST", "/addresses", { body: input }),
    update: (addressId: string, input: AddressInput) =>
      request<Address>("PUT", `/addresses/${id(addressId)}`, { body: input }),
    remove: (addressId: string) => request<null>("DELETE", `/addresses/${id(addressId)}`),
  },

  earners: {
    list: (filters: EarnerFilters = {}) =>
      request<Earner[]>("GET", "/earners", { query: { ...filters } }),
    nearby: (params: { limit?: number; lat?: number; lng?: number } = {}) =>
      request<Earner[]>("GET", "/earners/nearby", { query: params }),
    get: (earnerId: string) => request<EarnerDetail>("GET", `/earners/${id(earnerId)}`),
    availability: (
      earnerId: string,
      params: { days?: number; service?: ServiceKey; excludeBookingId?: string } = {},
    ) =>
      request<DayAvailability[]>("GET", `/earners/${id(earnerId)}/availability`, {
        query: params,
      }),
    reviews: async (earnerId: string, page = 1, perPage = 10) => {
      const body = await send("GET", `/earners/${id(earnerId)}/reviews`, {
        query: { page, perPage },
      });
      return {
        data: (body?.data ?? { summary: null, reviews: [] }) as ReviewsPage,
        meta: (body?.meta ?? { total: 0, perPage, currentPage: page, lastPage: page }) as PageMeta,
      };
    },
    favourite: (earnerId: string) =>
      request<null>("POST", `/earners/${id(earnerId)}/favourite`),
    unfavourite: (earnerId: string) =>
      request<null>("DELETE", `/earners/${id(earnerId)}/favourite`),
  },

  bookings: {
    list: (scope: BookingScope) => request<Booking[]>("GET", "/bookings", { query: { scope } }),
    next: () => request<Booking | null>("GET", "/bookings/next"),
    get: (bookingId: string) => request<Booking>("GET", `/bookings/${id(bookingId)}`),
    quote: (input: QuoteInput) =>
      request<PriceBreakdown>("POST", "/bookings/quote", { body: input }),
    create: (input: BookingInput) => request<Booking>("POST", "/bookings", { body: input }),
    cancel: (bookingId: string, reason: string | null) =>
      request<Booking>("POST", `/bookings/${id(bookingId)}/cancel`, { body: { reason } }),
    reschedule: (bookingId: string, start: string) =>
      request<Booking>("POST", `/bookings/${id(bookingId)}/reschedule`, { body: { start } }),
    rate: (bookingId: string, input: RateInput) =>
      request<Booking>("POST", `/bookings/${id(bookingId)}/rate`, { body: input }),
    sos: (bookingId: string, note: string | null) =>
      request<SosResult>("POST", `/bookings/${id(bookingId)}/sos`, { body: { note } }),
    chat: (bookingId: string) => request<ChatThread>("GET", `/bookings/${id(bookingId)}/chat`),
  },

  chats: {
    list: () => request<ChatThread[]>("GET", "/chats"),
    get: (threadId: string) => request<ChatThread>("GET", `/chats/${id(threadId)}`),
    send: (threadId: string, text: string) =>
      request<ChatThread>("POST", `/chats/${id(threadId)}/messages`, { body: { text } }),
    markRead: (threadId: string) => request<null>("POST", `/chats/${id(threadId)}/read`),
  },

  store: {
    products: (params: { category?: ProductCategory; q?: string } = {}) =>
      request<Product[]>("GET", "/products", { query: params }),
    cart: () => request<CartLine[]>("GET", "/cart"),
    cartSummary: () => request<CartSummary>("GET", "/cart/summary"),
    setQuantity: (productId: string, quantity: number) =>
      request<CartLine[]>("PUT", `/cart/${id(productId)}`, { body: { quantity } }),
    placeOrder: (input: OrderInput) => request<Order>("POST", "/orders", { body: input }),
    orders: () => request<Order[]>("GET", "/orders"),
    order: (orderId: string) => request<Order>("GET", `/orders/${id(orderId)}`),
  },

  payments: {
    createOrder: (input: { purpose: PaymentPurpose; amountPaise: number }) =>
      request<PaymentOrder>("POST", "/payments/orders", { body: input }),
  },

  notifications: {
    list: (page = 1, perPage = 20) =>
      requestPage<Notification, NotificationMeta>("/notifications", {
        query: { page, perPage },
      }),
    readAll: () => request<null>("POST", "/notifications/read-all"),
    read: (notificationId: string) =>
      request<null>("POST", `/notifications/${id(notificationId)}/read`),
  },
};
