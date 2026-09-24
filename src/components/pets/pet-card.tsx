import { Pencil, Stethoscope, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tag } from "@/components/ui/chip";
import { SpeciesIcon } from "@/components/ui/icons";
import { Pill } from "@/components/ui/status-pill";
import { petSummary, SPECIES_LABELS, TEMPERAMENT_LABELS } from "@/lib/labels";
import type { Pet } from "@/lib/types";

export function PetCard({ pet, onEdit, onDelete }: { pet: Pet; onEdit: () => void; onDelete: () => void }) {
  return (
    <article className="flex h-full flex-col rounded-card border border-hairline bg-surface p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-sky text-leash">
          <SpeciesIcon species={pet.species} className="size-6" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-title font-semibold">{pet.name}</h3>
          <p className="text-sm text-ink-muted">
            <span className="sr-only">{SPECIES_LABELS[pet.species]}, </span>
            {petSummary(pet)}
          </p>
        </div>
        <Pill tone={pet.vaccinated ? "trail" : "amber"}>{pet.vaccinated ? "Vaccinated" : "Vaccination due"}</Pill>
      </div>
      {pet.temperament.length ? (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {pet.temperament.map((trait) => (
            <Tag key={trait}>{TEMPERAMENT_LABELS[trait]}</Tag>
          ))}
        </div>
      ) : null}
      {pet.vaccinationNote ? <p className="mt-3 text-sm text-ink-muted">{pet.vaccinationNote}</p> : null}
      {pet.vetName ? (
        <p className="mt-2 flex items-center gap-1.5 text-sm text-ink-muted">
          <Stethoscope className="size-4" aria-hidden />
          {pet.vetName}
        </p>
      ) : null}
      <div className="mt-auto flex gap-2 pt-4">
        <Button variant="tonal" onClick={onEdit} icon={<Pencil className="size-4" aria-hidden />} aria-label={`Edit ${pet.name}`}>
          Edit
        </Button>
        <Button variant="ghost" onClick={onDelete} className="text-alert hover:bg-alert-soft" icon={<Trash2 className="size-4" aria-hidden />} aria-label={`Remove ${pet.name}`}>
          Remove
        </Button>
      </div>
    </article>
  );
}
