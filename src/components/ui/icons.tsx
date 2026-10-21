import {
  Bird,
  Cat,
  CreditCard,
  Dog,
  Footprints,
  House,
  Landmark,
  PawPrint,
  Pill,
  Rabbit,
  Scissors,
  ShoppingBag,
  Smartphone,
  Sofa,
  Stethoscope,
  type LucideIcon,
} from "lucide-react";
import type { PaymentMethod, PetSpecies, ServiceKey } from "@/lib/types";

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
