import type { BookingScope, EarnerFilters, ProductCategory, ServiceKey } from "./types";

/**
 * Query keys, arranged so a prefix invalidates a whole family
 * (for example `["bookings"]` refreshes lists, the next booking and details).
 */
export const qk = {
  config: ["config"] as const,
  services: ["services"] as const,
  me: ["me"] as const,
  pets: ["pets"] as const,
  addresses: ["addresses"] as const,

  earnersAll: ["earners"] as const,
  earners: (filters: EarnerFilters) => ["earners", "list", filters] as const,
  nearby: (limit: number) => ["earners", "nearby", limit] as const,
  earner: (id: string) => ["earners", "detail", id] as const,
  availabilityAll: (id: string) => ["earners", "availability", id] as const,
  availability: (id: string, service?: ServiceKey, excludeBookingId?: string) =>
    ["earners", "availability", id, service ?? "any", excludeBookingId ?? "none"] as const,
  reviews: (id: string) => ["earners", "reviews", id] as const,

  bookingsAll: ["bookings"] as const,
  bookings: (scope: BookingScope) => ["bookings", "list", scope] as const,
  nextBooking: ["bookings", "next"] as const,
  booking: (id: string) => ["bookings", "detail", id] as const,
  bookingChat: (id: string) => ["bookings", "chat", id] as const,
  quote: (earnerId: string, service: ServiceKey, minutes: number) =>
    ["quote", earnerId, service, minutes] as const,

  chatsAll: ["chats"] as const,
  chats: ["chats", "list"] as const,
  chat: (id: string) => ["chats", "detail", id] as const,

  products: (category: ProductCategory | null, q: string) =>
    ["products", category ?? "all", q] as const,
  cartAll: ["cart"] as const,
  cart: ["cart", "lines"] as const,
  cartSummary: ["cart", "summary"] as const,

  ordersAll: ["orders"] as const,
  orders: ["orders", "list"] as const,
  order: (id: string) => ["orders", "detail", id] as const,

  notifications: ["notifications"] as const,
};
