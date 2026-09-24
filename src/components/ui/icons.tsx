import {
  Bird,
  Bone,
  Cat,
  CreditCard,
  Dog,
  Footprints,
  HeartPulse,
  House,
  Landmark,
  Link2,
  PawPrint,
  Pill,
  Rabbit,
  Scissors,
  ShoppingBag,
  Smartphone,
  Sofa,
  Stethoscope,
  ToyBrick,
  type LucideIcon,
} from "lucide-react";
import type { PaymentMethod, PetSpecies, ProductCategory, ServiceKey } from "@/lib/types";

export const SERVICE_ICONS: Record<ServiceKey, LucideIcon> = {
  walking: Footprints,
  sitting: Sofa,
  boarding: House,
  grooming: Scissors,
  vetVisit: Stethoscope,
  medicine: Pill,
  accessories: ShoppingBag,
};

export const SPECIES_ICONS: Record<PetSpecies, LucideIcon> = {
  dog: Dog,
  cat: Cat,
  bird: Bird,
  rabbit: Rabbit,
  other: PawPrint,
};

export const CATEGORY_ICONS: Record<ProductCategory, LucideIcon> = {
  food: Bone,
  toys: ToyBrick,
  grooming: Scissors,
  health: HeartPulse,
  gear: Link2,
};

export const METHOD_ICONS: Record<PaymentMethod, LucideIcon> = {
  upi: Smartphone,
  card: CreditCard,
  netbanking: Landmark,
};

export function ServiceIcon({ service, className }: { service: ServiceKey; className?: string }) {
  const Icon = SERVICE_ICONS[service] ?? PawPrint;
  return <Icon className={className} aria-hidden />;
}

export function SpeciesIcon({ species, className }: { species: PetSpecies; className?: string }) {
  const Icon = SPECIES_ICONS[species] ?? PawPrint;
  return <Icon className={className} aria-hidden />;
}
