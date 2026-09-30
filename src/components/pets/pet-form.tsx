"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useId, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { FieldError, TextArea, TextField, Toggle } from "@/components/ui/field";
import { SpeciesIcon } from "@/components/ui/icons";
import { ErrorNotice } from "@/components/ui/notice";
import { api } from "@/lib/api";
import { SPECIES_LABELS, SPECIES_ORDER, TEMPERAMENT_LABELS, TEMPERAMENT_ORDER } from "@/lib/labels";
import { qk } from "@/lib/query-keys";
import type { Pet, PetInput, PetSpecies, PetTemperament } from "@/lib/types";
import { useFieldErrors } from "@/lib/use-field-errors";
import { decimalInput, digitsOnly, LIMITS, validatePet, type PetField } from "@/lib/validation";

interface Draft {
  name: string;
  species: PetSpecies;
  breed: string;
  years: string;
  months: string;
  weight: string;
  temperament: PetTemperament[];
  vaccinated: boolean;
  vaccinationNote: string;
  vetName: string;
}

function draftFrom(pet?: Pet): Draft {
  return {
    name: pet?.name ?? "",
    species: pet?.species ?? "dog",
    breed: pet?.breed ?? "",
    years: pet ? String(Math.floor(pet.ageMonths / 12)) : "",
    months: pet ? String(pet.ageMonths % 12) : "",
    weight: pet ? String(pet.weightKg) : "",
    temperament: pet?.temperament ?? [],
    vaccinated: pet?.vaccinated ?? false,
    vaccinationNote: pet?.vaccinationNote ?? "",
    vetName: pet?.vetName ?? "",
  };
}

/** The API's field names, mapped onto this form's fields. */
const SERVER_FIELDS: Record<string, PetField> = {
  name: "name",
  species: "species",
  breed: "breed",
  ageMonths: "age",
  weightKg: "weightKg",
  temperament: "temperament",
  vaccinationNote: "vaccinationNote",
  vetName: "vetName",
};

/** Which field a draft key's message belongs to, so editing it clears the right one. */
const FIELD_OF: Partial<Record<keyof Draft, PetField>> = {
  name: "name",
  species: "species",
  breed: "breed",
  years: "age",
  months: "age",
  weight: "weightKg",
  temperament: "temperament",
  vaccinationNote: "vaccinationNote",
  vetName: "vetName",
};

export function PetForm({
  pet,
  onSaved,
  onCancel,
  submitLabel,
}: {
  pet?: Pet;
  onSaved: (pet: Pet) => void;
  onCancel?: () => void;
  submitLabel?: string;
}) {
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState<Draft>(() => draftFrom(pet));
  const { errors, show, clear, fromServer, ref } = useFieldErrors<PetField>();
  // The server's message, when none of its field errors landed on a field here.
  const [unmappedError, setUnmappedError] = useState<unknown>(null);
  const ageErrorId = useId();

  const save = useMutation({
    mutationFn: (input: PetInput) =>
      pet ? api.pets.update(pet.id, { ...input, photoUrl: pet.photoUrl }) : api.pets.create(input),
    onSuccess: (saved) => {
      void queryClient.invalidateQueries({ queryKey: qk.pets });
      onSaved(saved);
    },
    onError: (error) => {
      if (!fromServer(error, SERVER_FIELDS)) setUnmappedError(error);
    },
  });

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => {
    setDraft((current) => ({ ...current, [key]: value }));
    const field = FIELD_OF[key];
    if (field) clear(field);
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (save.isPending) return;
    setUnmappedError(null);
    const { errors: found, numbers } = validatePet(draft);
    if (show(found) || !numbers) return;
    save.mutate({
      name: draft.name.trim(),
      species: draft.species,
      breed: draft.breed.trim(),
      ageMonths: numbers.ageMonths,
      weightKg: numbers.weightKg,
      temperament: draft.temperament,
      vaccinated: draft.vaccinated,
      vaccinationNote: draft.vaccinationNote.trim() || null,
      vetName: draft.vetName.trim() || null,
    });
  };

  return (
    <form ref={ref} onSubmit={submit} noValidate className="space-y-6">
      <TextField
        label="Name"
        value={draft.name}
        onChange={(event) => set("name", event.target.value)}
        error={errors.name}
        autoComplete="off"
        maxLength={LIMITS.petName}
        placeholder="Your pet's name"
      />

      <fieldset data-invalid={errors.species ? "true" : undefined} tabIndex={-1} className="outline-none">
        <legend className="text-sm font-semibold">Species</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {SPECIES_ORDER.map((species) => (
            <Chip
              key={species}
              selected={draft.species === species}
              onClick={() => set("species", species)}
              icon={<SpeciesIcon species={species} className="size-4" />}
            >
              {SPECIES_LABELS[species]}
            </Chip>
          ))}
        </div>
        {errors.species ? <FieldError className="mt-2">{errors.species}</FieldError> : null}
      </fieldset>

      <TextField
        label="Breed"
        optional
        value={draft.breed}
        onChange={(event) => set("breed", event.target.value)}
        error={errors.breed}
        maxLength={LIMITS.breed}
        placeholder="Labrador, Indie, Persian"
      />

      <fieldset>
        <legend className="text-sm font-semibold">Age</legend>
        <p className="mt-1 text-caption text-ink-muted">For a puppy or kitten, put 0 years and the months.</p>
        <div className="mt-2 grid grid-cols-2 gap-3">
          <TextField
            label="Years"
            inputMode="numeric"
            value={draft.years}
            onChange={(event) => set("years", digitsOnly(event.target.value, 2))}
            invalid={Boolean(errors.age)}
            aria-describedby={errors.age ? ageErrorId : undefined}
          />
          <TextField
            label="Months"
            inputMode="numeric"
            value={draft.months}
            onChange={(event) => set("months", digitsOnly(event.target.value, 2))}
            invalid={Boolean(errors.age)}
            aria-describedby={errors.age ? ageErrorId : undefined}
          />
        </div>
        {errors.age ? (
          <FieldError id={ageErrorId} className="mt-2">
            {errors.age}
          </FieldError>
        ) : null}
      </fieldset>

      <TextField
        label="Weight in kg"
        inputMode="decimal"
        value={draft.weight}
        onChange={(event) => set("weight", decimalInput(event.target.value))}
        error={errors.weightKg}
        hint="Up to one decimal place, for example 12.5."
      />

      <fieldset data-invalid={errors.temperament ? "true" : undefined} tabIndex={-1} className="outline-none">
        <legend className="text-sm font-semibold">Temperament</legend>
        <p className="mt-1 text-caption text-ink-muted">Pick any that fit. Carers read this before they accept.</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {TEMPERAMENT_ORDER.map((trait) => {
            const on = draft.temperament.includes(trait);
            return (
              <Chip
                key={trait}
                selected={on}
                onClick={() =>
                  set(
                    "temperament",
                    on ? draft.temperament.filter((item) => item !== trait) : [...draft.temperament, trait],
                  )
                }
              >
                {TEMPERAMENT_LABELS[trait]}
              </Chip>
            );
          })}
        </div>
        {errors.temperament ? <FieldError className="mt-2">{errors.temperament}</FieldError> : null}
      </fieldset>

      <div className="rounded-field border border-hairline bg-mist p-4">
        <Toggle
          label="Vaccinations up to date"
          checked={draft.vaccinated}
          onChange={(value) => set("vaccinated", value)}
        />
        <TextArea
          label="Vaccination note"
          optional
          containerClassName="mt-3"
          className="min-h-20"
          value={draft.vaccinationNote}
          onChange={(event) => set("vaccinationNote", event.target.value)}
          error={errors.vaccinationNote}
          maxLength={LIMITS.vaccinationNote}
          placeholder="Rabies booster due in March"
        />
      </div>

      <TextField
        label="Vet"
        optional
        value={draft.vetName}
        onChange={(event) => set("vetName", event.target.value)}
        error={errors.vetName}
        maxLength={LIMITS.vetName}
        placeholder="Your vet or clinic"
      />

      {unmappedError ? <ErrorNotice error={unmappedError} /> : null}

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        {onCancel ? (
          <Button variant="outline" onClick={onCancel} disabled={save.isPending}>
            Cancel
          </Button>
        ) : null}
        <Button type="submit" loading={save.isPending}>
          {submitLabel ?? (pet ? "Save changes" : "Add pet")}
        </Button>
      </div>
    </form>
  );
}
