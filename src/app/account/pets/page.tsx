"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { PawPrint, Plus } from "lucide-react";
import { useState } from "react";
import { AccountShell, AddTile } from "@/components/account/account-nav";
import { RequireAuth } from "@/components/auth/require-auth";
import { PetCard } from "@/components/pets/pet-card";
import { PetForm } from "@/components/pets/pet-form";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Dialog } from "@/components/ui/dialog";
import { CardSkeleton } from "@/components/ui/skeleton";
import { EmptyState, QueryView } from "@/components/ui/states";
import { useToast } from "@/components/ui/toast";
import { api } from "@/lib/api";
import { usePets } from "@/lib/queries";
import { qk } from "@/lib/query-keys";
import type { Pet } from "@/lib/types";
import { PageTitle } from "@/components/layout/page-title";
import { Reveal, revealItem } from "@/components/ui/motion";

function Pets() {
  const pets = usePets();
  const queryClient = useQueryClient();
  const toast = useToast();
  const [editing, setEditing] = useState<Pet | "new" | null>(null);
  const [removing, setRemoving] = useState<Pet | null>(null);

  const remove = useMutation({
    mutationFn: (pet: Pet) => api.pets.remove(pet.id),
    onSuccess: (_, pet) => {
      void queryClient.invalidateQueries({ queryKey: qk.pets });
      toast({ title: `${pet.name} removed` });
      setRemoving(null);
    },
  });

  return (
    <AccountShell
      title="Your pets"
      action={
        <Button onClick={() => setEditing("new")} icon={<Plus className="size-4" aria-hidden />}>
          Add a pet
        </Button>
      }
    >
      <div>
        <QueryView
          query={pets}
          loading={
            <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2" role="status" aria-label="Loading pets">
              <CardSkeleton />
              <CardSkeleton />
            </div>
          }
          isEmpty={(list) => list.length === 0}
          empty={
            <EmptyState
              icon={<PawPrint />}
              title="No pets yet"
              body="Add your pet so carers know who they are meeting."
              action={<Button onClick={() => setEditing("new")}>Add a pet</Button>}
            />
          }
        >
          {(list) => (
            <Reveal as="ul" className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
              {list.map((pet, index) => (
                <li key={pet.id} className="flex" {...revealItem(index)}>
                  <PetCard
                    pet={pet}
                    onEdit={() => setEditing(pet)}
                    onDelete={() => {
                      remove.reset();
                      setRemoving(pet);
                    }}
                  />
                </li>
              ))}
              {list.length % 2 === 1 ? (
                // Completes the last row of the two-column grid.
                <li className="hidden md:flex" {...revealItem(list.length)}>
                  <AddTile label="Add a pet" onClick={() => setEditing("new")} icon={<PawPrint />} />
                </li>
              ) : null}
            </Reveal>
          )}
        </QueryView>
      </div>

      <Dialog
        open={editing !== null}
        onClose={() => setEditing(null)}
        title={editing === "new" || editing === null ? "Add a pet" : `Edit ${editing.name}`}
        size="lg"
      >
        {editing !== null ? (
          <PetForm
            key={editing === "new" ? "new" : editing.id}
            pet={editing === "new" ? undefined : editing}
            onSaved={(pet) => {
              toast({ title: editing === "new" ? `${pet.name} added` : "Changes saved" });
              setEditing(null);
            }}
            onCancel={() => setEditing(null)}
          />
        ) : null}
      </Dialog>

      <ConfirmDialog
        open={removing !== null}
        title={removing ? `Remove ${removing.name}?` : "Remove pet?"}
        body="They will no longer be offered when you book. A pet with an active booking cannot be removed until it finishes."
        confirmLabel="Remove pet"
        onConfirm={() => removing && remove.mutate(removing)}
        onClose={() => setRemoving(null)}
        pending={remove.isPending}
        error={remove.error}
      />
    </AccountShell>
  );
}

export default function PetsPage() {
  return (
    <>
      <PageTitle title={"Your pets"} />
      <RequireAuth>
        <Pets />
      </RequireAuth>
    </>
  );
}
