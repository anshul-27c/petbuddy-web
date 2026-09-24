"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { PawPrint, Plus } from "lucide-react";
import { useState } from "react";
import { AccountNav } from "@/components/account/account-nav";
import { RequireAuth } from "@/components/auth/require-auth";
import { Container, PageHeader } from "@/components/layout/container";
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
    <Container width="medium">
      <PageHeader
        title="Your pets"
        action={
          <Button onClick={() => setEditing("new")} icon={<Plus className="size-4" aria-hidden />}>
            Add a pet
          </Button>
        }
      />
      <AccountNav />
      <div className="mt-6">
        <QueryView
          query={pets}
          loading={
            <div className="grid gap-4 sm:grid-cols-2" role="status" aria-label="Loading pets">
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
            <ul className="grid gap-4 sm:grid-cols-2">
              {list.map((pet) => (
                <li key={pet.id}>
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
            </ul>
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
    </Container>
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
