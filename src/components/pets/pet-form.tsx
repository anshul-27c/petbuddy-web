"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { TextArea, TextField, Toggle } from "@/components/ui/field";
import { SpeciesIcon } from "@/components/ui/icons";
import { ErrorNotice } from "@/components/ui/notice";
import { api, isApiError } from "@/lib/api";
import { SPECIES_LABELS, SPECIES_ORDER, TEMPERAMENT_LABELS, TEMPERAMENT_ORDER } from "@/lib/labels";
import { qk } from "@/lib/query-keys";
import type { Pet, PetInput, PetSpecies, PetTemperament } from "@/lib/types";
import { hasErrors, parseDecimal, parseWhole, type FieldErrors } from "@/lib/validation";

type Field = "name" | "species" | "breed" | "age" | "weightKg" | "vaccinationNote" | "vetName";

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

function validate(draft: Draft): { errors: FieldErrors<Field>; input: PetInput | null } {
  const errors: FieldErrors<Field> = {};
  const name = draft.name.trim();
  if (!name) errors.name = "Enter your pet's name.";
  else if (name.length > 40) errors.name = "Keep the name under 40 characters.";

  if (draft.breed.trim().length > 60) errors.breed = "Keep the breed under 60 characters.";

  const years = draft.years.trim() === "" ? 0 : parseWhole(draft.years);
  const months = draft.months.trim() === "" ? 0 : parseWhole(draft.months);
  if (draft.years.trim() === "" && draft.months.trim() === "") {
    errors.age = "Enter an age in years and months. Use 0 years for a puppy or kitten.";
  } else if (years === null || months === null || months > 11) {
    errors.age = "Use whole numbers: years, and 0 to 11 months.";
  } else if (years * 12 + months > 360) {
    errors.age = "Age can be at most 30 years.";
  }

  const weight = parseDecimal(draft.weight);
  if (weight === null) errors.weightKg = "Enter a weight in kg, for example 12.5.";
  else if (weight < 0.1 || weight > 120) errors.weightKg = "Weight must be between 0.1 and 120 kg.";

  if (hasErrors(errors) || years === null || months === null || weight === null) {
    return { errors, input: null };
  }

  return {
    errors,
    input: {
      name,
      species: draft.species,
      breed: draft.breed.trim(),
      ageMonths: years * 12 + months,
      weightKg: Math.round(weight * 10) / 10,
      temperament: draft.temperament,
      vaccinated: draft.vaccinated,
      vaccinationNote: draft.vaccinationNote.trim() || null,
      vetName: draft.vetName.trim() || null,
    },
  };
}

/** Maps the API's field names onto this form's fields. */
function serverErrors(error: unknown): FieldErrors<Field> {
  if (!isApiError(error)) return {};
  const f = error.fieldErrors;
  return {
    name: f.name,
    species: f.species,
    breed: f.breed,
    age: f.ageMonths,
    weightKg: f.weightKg,
    vaccinationNote: f.vaccinationNote,
    vetName: f.vetName,
  };
}

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
  const [errors, setErrors] = useState<FieldErrors<Field>>({});

  const save = useMutation({
    mutationFn: (input: PetInput) =>
      pet ? api.pets.update(pet.id, { ...input, photoUrl: pet.photoUrl }) : api.pets.create(input),
    onSuccess: (saved) => {
      void queryClient.invalidateQueries({ queryKey: qk.pets });
      onSaved(saved);
    },
    onError: (error) => setErrors(serverErrors(error)),
  });

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => {
    setDraft((current) => ({ ...current, [key]: value }));
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (save.isPending) return;
    const result = validate(draft);
    setErrors(result.errors);
    if (result.input) save.mutate(result.input);
  };

  // Show the server's message when none of its field errors land on a visible field.
  const unmappedError = save.error && !hasErrors(serverErrors(save.error)) ? save.error : null;

  return (
    <form onSubmit={submit} noValidate className="space-y-6">
      <TextField
        label="Name"
        value={draft.name}
        onChange={(event) => set("name", event.target.value)}
        error={errors.name}
        autoComplete="off"
        maxLength={40}
        placeholder="Your pet's name"
      />

      <fieldset>
        <legend className="text-sm font-semibold">Species</legend>
        <div className="mt-3 flex flex-wrap gap-2">
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
        {errors.species ? <p className="mt-2 text-small font-medium text-alert">{errors.species}</p> : null}
      </fieldset>

      <TextField
        label="Breed"
        optional
        value={draft.breed}
        onChange={(event) => set("breed", event.target.value)}
        error={errors.breed}
        maxLength={60}
        placeholder="Labrador, Indie, Persian"
      />

      <fieldset>
        <legend className="text-sm font-semibold">Age</legend>
        <div className="mt-2 grid grid-cols-2 gap-3">
          <TextField
            label="Years"
            inputMode="numeric"
            value={draft.years}
            onChange={(event) => set("years", event.target.value.replace(/\D/g, "").slice(0, 2))}
            placeholder="2"
            invalid={Boolean(errors.age)}
          />
          <TextField
            label="Months"
            inputMode="numeric"
            value={draft.months}
            onChange={(event) => set("months", event.target.value.replace(/\D/g, "").slice(0, 2))}
            placeholder="3"
            invalid={Boolean(errors.age)}
          />
        </div>
        {errors.age ? <p className="mt-2 text-small font-medium text-alert">{errors.age}</p> : null}
      </fieldset>

      <TextField
        label="Weight in kg"
        inputMode="decimal"
        value={draft.weight}
        onChange={(event) => set("weight", event.target.value.replace(/[^\d.,]/g, "").slice(0, 6))}
        error={errors.weightKg}
        placeholder="12.5"
      />

      <fieldset>
        <legend className="text-sm font-semibold">Temperament</legend>
        <p className="mt-1 text-small text-ink-muted">Pick any that fit. Carers read this before they accept.</p>
        <div className="mt-3 flex flex-wrap gap-2">
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
          placeholder="Rabies booster due in March"
        />
      </div>

      <TextField
        label="Vet"
        optional
        value={draft.vetName}
        onChange={(event) => set("vetName", event.target.value)}
        error={errors.vetName}
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
