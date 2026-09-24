/**
 * Sentence-case labels for every enum the website shows, plus small helpers
 * that derive display text from contract shapes. A raw enum value is never
 * shown to a person.
 */
import type {
  Actor,
  Address,
  BookingStatus,
  Earner,
  EarnerSort,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  Pet,
  PetSpecies,
  PetTemperament,
  ProductCategory,
  Service,
  ServiceKey,
  TimelineKind,
} from "./types";

export const SERVICE_KEYS: ServiceKey[] = [
  "walking",
  "sitting",
  "boarding",
  "grooming",
  "vetVisit",
  "medicine",
  "accessories",
];

/** Catalogue defaults from the contract, used until `/services` has loaded. */
export const SERVICE_DEFAULTS: Record<ServiceKey, Service> = {
  walking: {
    key: "walking",
    label: "Pet walking",
    blurb: "A walk near your home, on your schedule",
    fromPaise: 30000,
    defaultMinutes: 60,
    billableMinutes: 60,
    leavesHome: true,
    isActive: true,
    sortOrder: 1,
  },
  sitting: {
    key: "sitting",
    label: "Pet sitting",
    blurb: "A carer stays with your pet at your place",
    fromPaise: 40000,
    defaultMinutes: 120,
    billableMinutes: 120,
    leavesHome: false,
    isActive: true,
    sortOrder: 2,
  },
  boarding: {
    key: "boarding",
    label: "Home boarding",
    blurb: "Your pet stays over at the carer's home",
    fromPaise: 90000,
    defaultMinutes: 1440,
    billableMinutes: 240,
    leavesHome: true,
    isActive: true,
    sortOrder: 3,
  },
  grooming: {
    key: "grooming",
    label: "Grooming",
    blurb: "Bath, brush and nail trim at home",
    fromPaise: 80000,
    defaultMinutes: 90,
    billableMinutes: 90,
    leavesHome: false,
    isActive: true,
    sortOrder: 4,
  },
  vetVisit: {
    key: "vetVisit",
    label: "Vet visit assist",
    blurb: "A carer takes your pet to the vet and back",
    fromPaise: 60000,
    defaultMinutes: 120,
    billableMinutes: 120,
    leavesHome: true,
    isActive: true,
    sortOrder: 5,
  },
  medicine: {
    key: "medicine",
    label: "Medicine pickup",
    blurb: "Collected from your vet or pharmacy",
    fromPaise: 20000,
    defaultMinutes: 45,
    billableMinutes: 45,
    leavesHome: false,
    isActive: true,
    sortOrder: 6,
  },
  accessories: {
    key: "accessories",
    label: "Accessories pickup",
    blurb: "Food and supplies brought to your door",
    fromPaise: 20000,
    defaultMinutes: 45,
    billableMinutes: 45,
    leavesHome: false,
    isActive: true,
    sortOrder: 7,
  },
};

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  requested: "Requested",
  confirmed: "Confirmed",
  onTheWay: "On the way",
  inProgress: "In progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  created: "Payment pending",
  paid: "Paid",
  partiallyRefunded: "Partly refunded",
  refunded: "Refunded",
  failed: "Payment failed",
};

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  placed: "Placed",
  packed: "Packed",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export const TIMELINE_LABELS: Record<TimelineKind, string> = {
  booked: "Booking placed",
  confirmed: "Carer confirmed",
  onTheWay: "On the way",
  started: "Visit started",
  photoUpdate: "Photo update",
  note: "Update",
  finished: "Visit finished",
  cancelled: "Cancelled",
};

export const SPECIES_LABELS: Record<PetSpecies, string> = {
  dog: "Dog",
  cat: "Cat",
  bird: "Bird",
  rabbit: "Rabbit",
  other: "Other",
};

export const SPECIES_ORDER: PetSpecies[] = ["dog", "cat", "bird", "rabbit", "other"];

export const TEMPERAMENT_LABELS: Record<PetTemperament, string> = {
  friendly: "Friendly with everyone",
  shy: "Shy with strangers",
  energetic: "High energy",
  anxious: "Anxious when alone",
  reactive: "Reactive to other dogs",
};

export const TEMPERAMENT_ORDER: PetTemperament[] = [
  "friendly",
  "shy",
  "energetic",
  "anxious",
  "reactive",
];

export const CATEGORY_LABELS: Record<ProductCategory, string> = {
  food: "Food & treats",
  toys: "Toys",
  grooming: "Grooming",
  health: "Health",
  gear: "Collars & leashes",
};

export const CATEGORY_ORDER: ProductCategory[] = ["food", "toys", "grooming", "health", "gear"];

export const PAYMENT_METHODS: { value: PaymentMethod; label: string; blurb: string }[] = [
  { value: "upi", label: "UPI", blurb: "Pay with any UPI app" },
  { value: "card", label: "Card", blurb: "Credit or debit" },
  { value: "netbanking", label: "Netbanking", blurb: "All major banks" },
];

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  upi: "UPI",
  card: "Card",
  netbanking: "Netbanking",
};

export const SORT_OPTIONS: { value: EarnerSort; label: string }[] = [
  { value: "recommended", label: "Recommended" },
  { value: "soonest", label: "Available soonest" },
  { value: "priceLow", label: "Price low to high" },
  { value: "ratingHigh", label: "Rating high to low" },
  { value: "distanceNear", label: "Nearest" },
];

export const CANCELLED_BY_LABELS: Record<Actor, string> = {
  owner: "You cancelled this booking",
  earner: "Your carer cancelled this booking",
  admin: "The PetBuddy team cancelled this booking",
  system: "This booking was cancelled automatically",
};

// ---- Derived display helpers ---------------------------------------------

export function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] ?? name;
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const letters = parts.length > 1 ? parts[0][0] + parts[parts.length - 1][0] : (parts[0] ?? "?").slice(0, 2);
  return letters.toUpperCase();
}

/** Share of jobs that came from returning clients, as a whole percentage. */
export function repeatPercent(earner: Pick<Earner, "jobsDone" | "repeatClients">): number {
  if (!earner.jobsDone) return 0;
  return Math.round((earner.repeatClients / earner.jobsDone) * 100);
}

export function isNewCarer(earner: Pick<Earner, "jobsDone">): boolean {
  return earner.jobsDone < 10;
}

/** "2 yr 3 mo", or "8 mo" */
export function petAge(ageMonths: number): string {
  const years = Math.floor(ageMonths / 12);
  const months = ageMonths % 12;
  if (years === 0) return `${months} mo`;
  if (months === 0) return `${years} yr`;
  return `${years} yr ${months} mo`;
}

function formatWeight(kg: number): string {
  return `${Number.isInteger(kg) ? kg : kg.toFixed(1)} kg`;
}

/** "Labrador · 2 yr 3 mo · 28 kg" */
export function petSummary(pet: Pick<Pet, "breed" | "species" | "ageMonths" | "weightKg">): string {
  const breed = pet.breed?.trim() || SPECIES_LABELS[pet.species];
  return [breed, petAge(pet.ageMonths), formatWeight(pet.weightKg)].join(" · ");
}

/** "12 Rajpur Road, Dalanwala, Dehradun 248001" */
export function addressLine(address: Pick<Address, "line1" | "line2" | "area" | "city" | "pincode">): string {
  return [address.line1, address.line2, address.area, `${address.city} ${address.pincode}`.trim()]
    .filter((part) => part && part.trim())
    .join(", ");
}

/** Notes sent with a booking: the owner's note, then the gate code on its own line. */
export function bookingNotes(notes: string, gateCode: string): string | null {
  const parts = [notes.trim(), gateCode.trim() ? `Gate code: ${gateCode.trim()}` : ""].filter(Boolean);
  return parts.length ? parts.join("\n") : null;
}
