"use client";

import { PawPrint, Plus } from "lucide-react";
import { useId, useState } from "react";
import { PetForm } from "@/components/pets/pet-form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChoiceCard } from "@/components/ui/field";
import { SpeciesIcon } from "@/components/ui/icons";
import { ListSkeleton } from "@/components/ui/skeleton";
import { QueryView } from "@/components/ui/states";
import { petSummary } from "@/lib/labels";
import { usePets } from "@/lib/queries";

export function PetStep({ value, onChange }: { value: string | null; onChange: (petId: string) => void }) {
  const name = useId();
  const pets = usePets();
  const [adding, setAdding] = useState(false);

  return (
    <fieldset>
      <legend className="text-subhead font-bold">Which pet?</legend>
      <p className="mt-1 text-sm text-ink-muted">Your carer sees their breed, temperament and vaccinations.</p>
      <div className="mt-4">
        <QueryView
          query={pets}
          loading={<ListSkeleton count={2} />}
          isEmpty={(list) => list.length === 0}
          empty={
            <Card>
              <div className="mb-4 flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-full bg-sky text-leash">
                  <PawPrint className="size-5" aria-hidden />
                </span>
                <div>
                  <p className="font-semibold">Add your pet</p>
                  <p className="text-sm text-ink-muted">So your carer knows who they are meeting.</p>
                </div>
              </div>
              <PetForm onSaved={(pet) => onChange(pet.id)} submitLabel="Add pet" />
            </Card>
          }
        >
          {(list) => (
            <div className="grid gap-2">
              {list.map((pet) => (
                <ChoiceCard
                  key={pet.id}
                  name={name}
                  value={pet.id}
                  checked={value === pet.id}
                  onChange={onChange}
                  icon={<SpeciesIcon species={pet.species} />}
                  title={pet.name}
                  description={petSummary(pet)}
                />
              ))}
              {adding ? (
                <Card className="mt-2">
                  <h3 className="mb-4 text-title font-semibold">Add a pet</h3>
                  <PetForm
                    onSaved={(pet) => {
                      onChange(pet.id);
                      setAdding(false);
                    }}
                    onCancel={() => setAdding(false)}
                  />
                </Card>
              ) : (
                <Button
                  variant="ghost"
                  className="justify-self-start"
                  onClick={() => setAdding(true)}
                  icon={<Plus className="size-4" aria-hidden />}
                >
                  Add a pet
                </Button>
              )}
            </div>
          )}
        </QueryView>
      </div>
    </fieldset>
  );
}
