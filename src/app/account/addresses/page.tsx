"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { KeyRound, MapPin, Pencil, Plus, Star, Trash2 } from "lucide-react";
import { useState } from "react";
import { AccountShell, AddTile } from "@/components/account/account-nav";
import { AddressForm } from "@/components/addresses/address-form";
import { RequireAuth } from "@/components/auth/require-auth";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Dialog } from "@/components/ui/dialog";
import { IconTile } from "@/components/ui/icon-tile";
import { Reveal, revealItem } from "@/components/ui/motion";
import { CardSkeleton } from "@/components/ui/skeleton";
import { EmptyState, QueryView } from "@/components/ui/states";
import { Pill } from "@/components/ui/status-pill";
import { useToast } from "@/components/ui/toast";
import { api } from "@/lib/api";
import { errorCopy } from "@/lib/errors";
import { addressLine } from "@/lib/labels";
import { useAddresses } from "@/lib/queries";
import { qk } from "@/lib/query-keys";
import type { Address } from "@/lib/types";
import { PageTitle } from "@/components/layout/page-title";

function toInput(address: Address) {
  return {
    label: address.label,
    line1: address.line1,
    line2: address.line2,
    area: address.area,
    city: address.city,
    pincode: address.pincode,
    lat: address.lat,
    lng: address.lng,
    landmark: address.landmark,
    gateCode: address.gateCode,
  };
}

function Addresses() {
  const addresses = useAddresses();
  const queryClient = useQueryClient();
  const toast = useToast();
  const [editing, setEditing] = useState<Address | "new" | null>(null);
  const [removing, setRemoving] = useState<Address | null>(null);

  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: qk.addresses });
    void queryClient.invalidateQueries({ queryKey: qk.earnersAll });
  };

  const remove = useMutation({
    mutationFn: (address: Address) => api.addresses.remove(address.id),
    onSuccess: (_, address) => {
      refresh();
      toast({ title: `${address.label} removed` });
      setRemoving(null);
    },
  });

  const makeDefault = useMutation({
    mutationFn: (address: Address) => api.addresses.update(address.id, { ...toInput(address), isDefault: true }),
    onSuccess: (address) => {
      refresh();
      toast({ title: `${address.label} is now your default` });
    },
    onError: (error) => {
      const { title, body } = errorCopy(error);
      toast({ tone: "error", title, body });
    },
  });

  const count = addresses.data?.length ?? 0;

  return (
    <AccountShell
      title="Addresses"
      action={
        <Button onClick={() => setEditing("new")} icon={<Plus className="size-4" aria-hidden />}>
          Add an address
        </Button>
      }
    >
      <div>
        <QueryView
          query={addresses}
          loading={
            <div
              className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2"
              role="status"
              aria-label="Loading addresses"
            >
              <CardSkeleton lines={2} />
              <CardSkeleton lines={2} />
            </div>
          }
          isEmpty={(list) => list.length === 0}
          empty={
            <EmptyState
              icon={<MapPin />}
              title="No addresses yet"
              body="Add where your pet is so carers can find you."
              action={<Button onClick={() => setEditing("new")}>Add an address</Button>}
            />
          }
        >
          {(list) => (
            <Reveal as="ul" className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
              {list.map((address, index) => (
                <li key={address.id} className="flex" {...revealItem(index)}>
                  <article className="flex w-full flex-col rounded-card border border-hairline bg-surface p-4 shadow-card sm:p-5">
                    <div className="flex items-start gap-4">
                      <IconTile size="lg">
                        <MapPin />
                      </IconTile>
                      <div className="min-w-0 flex-1">
                        <h3 className="flex flex-wrap items-center gap-2 text-title font-semibold">
                          {address.label}
                          {address.isDefault ? (
                            <Pill tone="leash" dot={false}>
                              Default
                            </Pill>
                          ) : null}
                        </h3>
                        <p className="mt-1 text-sm text-ink-muted">{addressLine(address)}</p>
                        {address.landmark ? (
                          <p className="mt-1 text-small text-ink-muted">Landmark: {address.landmark}</p>
                        ) : null}
                        {address.gateCode ? (
                          <p className="mt-1 flex items-center gap-2 text-small text-ink-muted">
                            <KeyRound className="size-3.5" aria-hidden />
                            Gate code {address.gateCode}
                          </p>
                        ) : null}
                      </div>
                    </div>
                    <div className="mt-auto pt-4">
                      <div className="flex flex-wrap gap-2 border-t border-hairline pt-4">
                        <Button
                          variant="tonal"
                          onClick={() => setEditing(address)}
                          icon={<Pencil className="size-4" aria-hidden />}
                          aria-label={`Edit ${address.label}`}
                        >
                          Edit
                        </Button>
                        {!address.isDefault ? (
                          <Button
                            variant="ghost"
                            onClick={() => makeDefault.mutate(address)}
                            disabled={makeDefault.isPending}
                            icon={<Star className="size-4" aria-hidden />}
                          >
                            Make default
                          </Button>
                        ) : null}
                        <Button
                          variant="danger-quiet"
                          onClick={() => {
                            remove.reset();
                            setRemoving(address);
                          }}
                          icon={<Trash2 className="size-4" aria-hidden />}
                          aria-label={`Remove ${address.label}`}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  </article>
                </li>
              ))}
              {list.length % 2 === 1 ? (
                // Completes the last row of the two-column grid.
                <li className="hidden md:flex" {...revealItem(list.length)}>
                  <AddTile label="Add an address" onClick={() => setEditing("new")} icon={<MapPin />} />
                </li>
              ) : null}
            </Reveal>
          )}
        </QueryView>
      </div>

      <Dialog
        open={editing !== null}
        onClose={() => setEditing(null)}
        title={editing === "new" || editing === null ? "Add an address" : `Edit ${editing.label}`}
        size="lg"
      >
        {editing !== null ? (
          <AddressForm
            key={editing === "new" ? "new" : editing.id}
            address={editing === "new" ? undefined : editing}
            isFirst={editing === "new" && count === 0}
            onSaved={(address) => {
              toast({ title: editing === "new" ? `${address.label} saved` : "Changes saved" });
              setEditing(null);
            }}
            onCancel={() => setEditing(null)}
          />
        ) : null}
      </Dialog>

      <ConfirmDialog
        open={removing !== null}
        title={removing ? `Remove ${removing.label}?` : "Remove address?"}
        body="Bookings already made keep the address they were booked with."
        confirmLabel="Remove address"
        onConfirm={() => removing && remove.mutate(removing)}
        onClose={() => setRemoving(null)}
        pending={remove.isPending}
        error={remove.error}
      />
    </AccountShell>
  );
}

export default function AddressesPage() {
  return (
    <>
      <PageTitle title={"Addresses"} />
      <RequireAuth>
        <Addresses />
      </RequireAuth>
    </>
  );
}
