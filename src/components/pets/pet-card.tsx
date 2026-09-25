import { Pencil, Stethoscope, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tag } from "@/components/ui/chip";
import { IconTile } from "@/components/ui/icon-tile";
import { SpeciesIcon } from "@/components/ui/icons";
import { Pill } from "@/components/ui/status-pill";
import { petSummary, SPECIES_LABELS, TEMPERAMENT_LABELS } from "@/lib/labels";
import type { Pet } from "@/lib/types";

export function PetCard({ pet, onEdit, onDelete }: { pet: Pet; onEdit: () => void; onDelete: () => void }) {
  return (
    <article className="flex w-full flex-col rounded-card border border-hairline bg-surface p-4 shadow-card sm:p-5">
      <div className="flex items-start gap-4">
        <IconTile size="xl">
          <SpeciesIcon species={pet.species} />
        </IconTile>
        <div className="min-w-0 flex-1 pt-1">
          <h3 className="truncate text-title font-semibold">{pet.name}</h3>
          <p className="mt-1 text-sm text-ink-muted">
            <span className="sr-only">{SPECIES_LABELS[pet.species]}, </span>
            {petSummary(pet)}
          </p>
        </div>
        <Pill tone={pet.vaccinated ? "trail" : "amber"}>{pet.vaccinated ? "Vaccinated" : "Vaccination due"}</Pill>
      </div>
      {pet.temperament.length ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {pet.temperament.map((trait) => (
            <Tag key={trait}>{TEMPERAMENT_LABELS[trait]}</Tag>
          ))}
        </div>
      ) : null}
      {pet.vaccinationNote ? <p className="mt-3 text-sm text-ink-muted">{pet.vaccinationNote}</p> : null}
      {pet.vetName ? (
        <p className="mt-2 flex items-center gap-2 text-sm text-ink-muted">
          <Stethoscope className="size-4" aria-hidden />
          {pet.vetName}
        </p>
      ) : null}
      <div className="mt-auto pt-4">
        <div className="flex gap-2 border-t border-hairline pt-4">
          <Button
            variant="tonal"
            onClick={onEdit}
            icon={<Pencil className="size-4" aria-hidden />}
            aria-label={`Edit ${pet.name}`}
          >
            Edit
          </Button>
          <Button
            variant="danger-quiet"
            onClick={onDelete}
            icon={<Trash2 className="size-4" aria-hidden />}
            aria-label={`Remove ${pet.name}`}
          >
            Remove
          </Button>
        </div>
      </div>
    </article>
  );
}
