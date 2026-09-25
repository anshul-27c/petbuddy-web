"use client";

import { MapPin, Plus } from "lucide-react";
import { useId, useState } from "react";
import { AddressForm } from "@/components/addresses/address-form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChoiceCard, TextArea, TextField } from "@/components/ui/field";
import { IconTile } from "@/components/ui/icon-tile";
import { ListSkeleton } from "@/components/ui/skeleton";
import { QueryView } from "@/components/ui/states";
import { Pill } from "@/components/ui/status-pill";
import { addressLine } from "@/lib/labels";
import { useAddresses } from "@/lib/queries";

export function WhereStep({
  carerName,
  addressId,
  onAddress,
  gateCode,
  onGateCode,
  notes,
  onNotes,
}: {
  carerName: string;
  addressId: string | null;
  onAddress: (addressId: string) => void;
  gateCode: string;
  onGateCode: (value: string) => void;
  notes: string;
  onNotes: (value: string) => void;
}) {
  const name = useId();
  const addresses = useAddresses();
  const [adding, setAdding] = useState(false);

  return (
    <div className="space-y-8">
      <fieldset>
        <legend className="font-display text-subhead font-semibold sm:text-headline">Where should {carerName} come?</legend>
        <div className="mt-4 sm:mt-5">
          <QueryView
            query={addresses}
            loading={<ListSkeleton count={2} />}
            isEmpty={(list) => list.length === 0}
            empty={
              <Card>
                <div className="mb-5 flex items-center gap-3">
                  <IconTile>
                    <MapPin />
                  </IconTile>
                  <div>
                    <p className="text-title font-semibold">Add your address</p>
                    <p className="mt-1 text-sm text-ink-muted">Where your pet is, so your carer can find you.</p>
                  </div>
                </div>
                <AddressForm isFirst onSaved={(address) => onAddress(address.id)} submitLabel="Save address" />
              </Card>
            }
          >
            {(list) => (
              <div className="grid grid-cols-1 gap-3">
                {list.map((address) => (
                  <ChoiceCard
                    key={address.id}
                    name={name}
                    value={address.id}
                    checked={addressId === address.id}
                    onChange={onAddress}
                    icon={<MapPin />}
                    title={
                      <span className="inline-flex flex-wrap items-center gap-2">
                        {address.label}
                        {address.isDefault ? (
                          <Pill tone="leash" dot={false}>
                            Default
                          </Pill>
                        ) : null}
                      </span>
                    }
                    description={addressLine(address)}
                  />
                ))}
                {adding ? (
                  <Card>
                    <h3 className="mb-5 text-title font-semibold">Add an address</h3>
                    <AddressForm
                      onSaved={(address) => {
                        onAddress(address.id);
                        setAdding(false);
                      }}
                      onCancel={() => setAdding(false)}
                    />
                  </Card>
                ) : (
                  <Button
                    variant="ghost"
                    className="-ml-4 justify-self-start"
                    onClick={() => setAdding(true)}
                    icon={<Plus className="size-4" aria-hidden />}
                  >
                    Add an address
                  </Button>
                )}
              </div>
            )}
          </QueryView>
        </div>
      </fieldset>

      <div className="grid grid-cols-1 gap-4 rounded-card border border-hairline bg-surface p-4 shadow-card sm:grid-cols-[14rem_1fr] sm:p-5">
        <TextField
          label="Gate or door code"
          optional
          value={gateCode}
          onChange={(event) => onGateCode(event.target.value)}
          placeholder="4821"
          maxLength={20}
          hint="Added to your notes for the carer."
        />
        <TextArea
          label="Anything they should know?"
          optional
          value={notes}
          onChange={(event) => onNotes(event.target.value)}
          placeholder="Pulls near the park gate. Bowl is under the sink."
          maxLength={1000}
          rows={3}
        />
      </div>
    </div>
  );
}
