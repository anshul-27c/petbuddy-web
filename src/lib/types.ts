/*
 * Shapes and enums copied from the API contract
 * (petbuddy-backend/docs/API.md, sections 2, 3 and 6).
 * Only what the customer API uses is here; admin shapes are left out.
 */

// ---- Enums ---------------------------------------------------------------

export type AppMode = "owner" | "earner";
export type ServiceKey =
  | "walking"
  | "sitting"
  | "boarding"
  | "grooming"
  | "vetVisit"
  | "medicine"
  | "accessories";
export type PetSpecies = "dog" | "cat" | "bird" | "rabbit" | "other";
export type PetTemperament =
  | "friendly"
  | "shy"
  | "energetic"
  | "anxious"
  | "reactive";
export type BookingStatus =
  | "requested"
  | "confirmed"
  | "onTheWay"
  | "inProgress"
  | "completed"
  | "cancelled";
export type TimelineKind =
  | "booked"
  | "confirmed"
  | "onTheWay"
  | "started"
  | "photoUpdate"
  | "note"
  | "finished"
  | "cancelled";
export type ProductCategory = "food" | "toys" | "grooming" | "health" | "gear";
export type PaymentMethod = "upi" | "card" | "netbanking";
export type PaymentStatus =
  | "created"
  | "paid"
  | "partiallyRefunded"
  | "refunded"
  | "failed";
export type PaymentPurpose = "booking" | "tip" | "order" | "starterKit";
export type OrderStatus =
  | "placed"
  | "packed"
  | "shipped"
  | "delivered"
  | "cancelled";
export type Actor = "owner" | "earner" | "admin" | "system";
export type EarnerSort =
  | "recommended"
  | "soonest"
  | "priceLow"
  | "ratingHigh"
  | "distanceNear";
export type NotificationKind =
  | "booking"
  | "chat"
  | "payout"
  | "kyc"
  | "order"
  | "system";
export type LanguageCode = "en" | "hi";

// ---- Envelopes -----------------------------------------------------------

export interface PageMeta {
  total: number;
  perPage: number;
  currentPage: number;
  lastPage: number;
}

export interface Paginated<T, M extends PageMeta = PageMeta> {
  data: T[];
  meta: M;
}

export interface ApiErrorBody {
  code?: string;
  message?: string;
  action?: string;
  errors?: { field: string; message: string; rule?: string }[];
}

// ---- Auth and profile ----------------------------------------------------

export interface UserProfile {
  id: string;
  phone: string; // 10 digits, no country code
  mode: AppMode;
  name: string | null;
  email: string | null;
  photoUrl: string | null;
  isEarnerApproved: boolean;
  hasStarterKit: boolean;
  languageCode: string; // 'en' | 'hi'
}

export interface AuthSession {
  token: string;
  user: UserProfile;
  needsMode: boolean;
}

export interface MeResponse {
  user: UserProfile;
  needsMode: boolean;
}

export interface ProfileInput {
  name?: string | null;
  email?: string | null;
  languageCode?: LanguageCode;
  photoUrl?: string | null;
}

export interface OtpSent {
  sent: boolean;
  expiresInSeconds: number;
  resendInSeconds: number;
  devCode: string | null;
}

// ---- Pets and addresses --------------------------------------------------

export interface Pet {
  id: string;
  name: string;
  species: PetSpecies;
  breed: string;
  ageMonths: number;
  weightKg: number;
  temperament: PetTemperament[];
  vaccinated: boolean;
  vaccinationNote: string | null;
  vetName: string | null;
  photoUrl: string | null;
}

export interface PetInput {
  name: string; // 1–40
  species: PetSpecies;
  breed: string; // 0–60
  ageMonths: number; // 0–360
  weightKg: number; // 0.1–120
  temperament?: PetTemperament[];
  vaccinated?: boolean;
  vaccinationNote?: string | null;
  vetName?: string | null;
  photoUrl?: string | null;
}

export interface Address {
  id: string;
  label: string;
  line1: string;
  line2: string | null;
  area: string;
  city: string;
  pincode: string; // 6 digits
  lat: number;
  lng: number;
  landmark: string | null;
  gateCode: string | null;
  isDefault: boolean;
}

export interface AddressInput {
  label: string;
  line1: string;
  line2?: string | null;
  area: string;
  city: string;
  pincode: string; // exactly 6 digits
  lat: number;
  lng: number;
  landmark?: string | null;
  gateCode?: string | null;
  isDefault?: boolean; // the first address is always default
}

// ---- Catalogue and config ------------------------------------------------

export interface Service {
  key: ServiceKey;
  label: string;
  blurb: string;
  fromPaise: number;
  defaultMinutes: number;
  billableMinutes: number; // minutes of the carer's hourly rate one booking costs
  leavesHome: boolean;
  isActive: boolean;
  sortOrder: number;
}

export interface PublicConfig {
  platformFeePercent: number;
  gstPercent: number;
  commissionPercent: number;
  freeCancelHours: number;
  lateCancelFeePercent: number;
  minWithdrawalPaise: number;
  starterKitPricePaise: number;
  requestWindowMinutes: number;
  paymentProvider: "mock" | "razorpay";
  razorpayKeyId: string | null;
  launchCity: { name: string; lat: number; lng: number };
}

// ---- Carers --------------------------------------------------------------

export interface Earner {
  id: string; // earner profile id (not the user id)
  name: string;
  rating: number; // 0 when there are no reviews
  reviewCount: number;
  distanceKm: number;
  pricePerHourPaise: number;
  services: ServiceKey[];
  prices: Partial<Record<ServiceKey, number>>;
  jobsDone: number;
  repeatClients: number;
  idVerified: boolean;
  policeVerified: boolean;
  joinedAt: string;
  about: string;
  area: string;
  photoUrl: string | null;
  nextAvailableAt: string | null;
  languages: string[];
  isFavourite: boolean;
  isOnline: boolean;
}

export interface Review {
  id: string;
  authorName: string;
  authorPhotoUrl: string | null;
  rating: number; // 1–5
  at: string;
  service: ServiceKey;
  text: string | null;
  reply: string | null;
  repliedAt: string | null;
}

export interface ReviewSummary {
  average: number;
  total: number;
  distribution: [number, number, number, number, number]; // index 0 = one star
}

export interface EarnerDetail extends Earner {
  serviceRadiusKm: number;
  reviewSummary: ReviewSummary;
  recentReviews: Review[];
}

export interface ReviewsPage {
  summary: ReviewSummary;
  reviews: Review[];
}

export interface Slot {
  start: string;
  end: string;
  available: boolean;
}

export interface DayAvailability {
  date: string; // timestamp of local midnight
  slots: Slot[];
}

export interface EarnerFilters {
  service?: ServiceKey;
  availableToday?: boolean;
  maxPricePaise?: number;
  minRating?: number;
  maxDistanceKm?: number;
  verifiedOnly?: boolean;
  favouritesOnly?: boolean;
  sort?: EarnerSort;
  q?: string;
  lat?: number;
  lng?: number;
  limit?: number;
}

// ---- Bookings ------------------------------------------------------------

export interface PriceBreakdown {
  servicePaise: number;
  platformFeePaise: number;
  taxesPaise: number;
  tipPaise: number;
  discountPaise: number;
  totalPaise: number;
}

export interface TimelineEvent {
  kind: TimelineKind;
  at: string;
  note: string | null;
  photoUrl: string | null;
}

export interface Cancellation {
  by: Actor;
  reason: string | null;
  feePaise: number;
  refundPaise: number;
  at: string;
}

export interface Booking {
  id: string;
  code: string;
  earner: Earner;
  pet: Pet;
  service: ServiceKey;
  start: string;
  end: string;
  durationMinutes: number;
  status: BookingStatus;
  address: Address;
  price: PriceBreakdown;
  timeline: TimelineEvent[];
  notes: string | null;
  earnerLat: number | null;
  earnerLng: number | null;
  ratingGiven: number | null;
  reviewGiven: string | null;
  paymentStatus: PaymentStatus;
  respondBy: string | null;
  cancellation: Cancellation | null;
  chatThreadId: string | null;
  canCancel: boolean;
  canReschedule: boolean;
  canRate: boolean;
  cancellationFeeIfNowPaise: number;
  createdAt: string;
}

export type BookingScope = "upcoming" | "past";

export interface PaymentProof {
  id: string;
  method: PaymentMethod;
  orderId?: string;
  signature?: string;
}

export interface QuoteInput {
  earnerId: string;
  service: ServiceKey;
  durationMinutes?: number;
}

export interface BookingInput {
  earnerId: string;
  petId: string;
  addressId: string;
  service: ServiceKey;
  start: string;
  durationMinutes?: number;
  notes?: string | null;
  payment: PaymentProof;
}

export interface RateInput {
  rating: number;
  text?: string | null;
  tipPaise?: number;
  tipPayment?: PaymentProof;
}

export interface SosResult {
  incidentId: string;
}

// ---- Chat ----------------------------------------------------------------

export interface ChatMessage {
  id: string;
  text: string;
  at: string;
  fromMe: boolean;
  isSystem: boolean;
  photoUrl: string | null;
}

export interface ChatThread {
  id: string;
  withName: string;
  withPhotoUrl: string | null;
  bookingId: string;
  bookingCode: string;
  service: ServiceKey;
  bookingStart: string;
  myRole: "owner" | "earner";
  lastAt: string;
  lastMessage: string;
  unread: number;
  maskedPhone: string; // "987654••••"
  messages: ChatMessage[];
}

// ---- Store ---------------------------------------------------------------

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: ProductCategory;
  pricePaise: number;
  mrpPaise: number | null;
  rating: number;
  reviewCount: number;
  imageUrl: string | null;
  inStock: boolean;
  blurb: string;
}

export interface CartLine {
  product: Product;
  quantity: number;
}

export interface CartSummary {
  lines: CartLine[];
  itemCount: number;
  subtotalPaise: number;
  deliveryFeePaise: number;
  totalPaise: number;
}

export interface OrderItem {
  productId: string;
  name: string;
  brand: string;
  imageUrl: string | null;
  pricePaise: number;
  quantity: number;
  totalPaise: number;
}

export interface Order {
  id: string;
  code: string;
  status: OrderStatus;
  items: OrderItem[];
  subtotalPaise: number;
  deliveryFeePaise: number;
  totalPaise: number;
  address: Address;
  paymentStatus: PaymentStatus;
  placedAt: string;
  deliveredAt: string | null;
}

export interface OrderInput {
  addressId?: string;
  payment: PaymentProof;
}

// ---- Payments and notifications -----------------------------------------

export interface PaymentOrder {
  provider: "mock" | "razorpay";
  orderId: string;
  amountPaise: number;
  keyId: string | null;
}

export interface Notification {
  id: string;
  kind: NotificationKind;
  title: string;
  body: string;
  data: Record<string, string>;
  readAt: string | null;
  createdAt: string;
}

export interface NotificationMeta extends PageMeta {
  unread: number;
}
