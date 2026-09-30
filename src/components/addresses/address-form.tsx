"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { LocateFixed, MapPin } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { TextField, Toggle } from "@/components/ui/field";
import { ErrorNotice } from "@/components/ui/notice";
import { api } from "@/lib/api";
import { usePolicy } from "@/lib/queries";
import { qk } from "@/lib/query-keys";
import type { Address, AddressInput } from "@/lib/types";
import { useFieldErrors } from "@/lib/use-field-errors";
import { digitsOnly, LIMITS, validateAddress, type AddressField } from "@/lib/validation";

type LocationState =
  | { kind: "default" }
  | { kind: "saved" }
  | { kind: "locating" }
  | { kind: "current"; lat: number; lng: number }
  | { kind: "failed"; reason: string };

/** The API's field names are the form's own. */
const SERVER_FIELDS: Record<string, AddressField> = {
  label: "label",
  line1: "line1",
  line2: "line2",
  area: "area",
  city: "city",
  pincode: "pincode",
  landmark: "landmark",
  gateCode: "gateCode",
};

/**
 * Add or edit an address. Coordinates come from the browser when the person
 * allows it; otherwise the launch city centre is used (or the saved point when
 * editing), and the carer finds the place by the written address.
 */
export function AddressForm({
  address,
  isFirst = false,
  onSaved,
  onCancel,
  submitLabel,
}: {
  address?: Address;
  /** The first address is always the default, so the switch is hidden. */
  isFirst?: boolean;
  onSaved: (address: Address) => void;
  onCancel?: () => void;
  submitLabel?: string;
}) {
  const queryClient = useQueryClient();
  const { config, cityName } = usePolicy();
  const [values, setValues] = useState({
    label: address?.label ?? (isFirst ? "Home" : ""),
    line1: address?.line1 ?? "",
    line2: address?.line2 ?? "",
    area: address?.area ?? "",
    pincode: address?.pincode ?? "",
    landmark: address?.landmark ?? "",
    gateCode: address?.gateCode ?? "",
  });
  const [isDefault, setIsDefault] = useState(address?.isDefault ?? isFirst);
  const [location, setLocation] = useState<LocationState>(address ? { kind: "saved" } : { kind: "default" });
  const { errors, show, clear, fromServer, ref } = useFieldErrors<AddressField>();
  // The server's message, when none of its field errors landed on a field here.
  const [unmappedError, setUnmappedError] = useState<unknown>(null);
  // Untouched (null) shows the launch city; once edited, whatever was typed.
  const [cityInput, setCityInput] = useState<string | null>(address?.city ?? null);
  const city = cityInput ?? cityName;

  const save = useMutation({
    mutationFn: (input: AddressInput) => (address ? api.addresses.update(address.id, input) : api.addresses.create(input)),
    onSuccess: (saved) => {
      void queryClient.invalidateQueries({ queryKey: qk.addresses });
      // Distances are measured from the default address.
      void queryClient.invalidateQueries({ queryKey: qk.earnersAll });
      onSaved(saved);
    },
    onError: (error) => {
      if (!fromServer(error, SERVER_FIELDS)) setUnmappedError(error);
    },
  });

  const set = (key: keyof typeof values, value: string) => {
    setValues((current) => ({ ...current, [key]: value }));
    clear(key);
  };

  const locate = () => {
    if (!("geolocation" in navigator)) {
      setLocation({ kind: "failed", reason: "This browser cannot share your location." });
      return;
    }
    setLocation({ kind: "locating" });
    navigator.geolocation.getCurrentPosition(
      (position) =>
        setLocation({ kind: "current", lat: position.coords.latitude, lng: position.coords.longitude }),
      (error) =>
        setLocation({
          kind: "failed",
          reason:
            error.code === error.PERMISSION_DENIED
              ? "Location access is blocked for this site."
              : "We could not get a fix on your location.",
        }),
      { enableHighAccuracy: true, timeout: 10_000, maximumAge: 60_000 },
    );
  };

  const coordinates = (): { lat: number; lng: number } | null => {
    if (location.kind === "current") return { lat: location.lat, lng: location.lng };
    if (address) return { lat: address.lat, lng: address.lng };
    if (config) return { lat: config.launchCity.lat, lng: config.launchCity.lng };
    return null;
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (save.isPending) return;
    setUnmappedError(null);
    if (show(validateAddress({ ...values, city }))) return;
    const point = coordinates();
    if (!point) return; // Explained by the notice above the buttons.
    save.mutate({
      label: values.label.trim(),
      line1: values.line1.trim(),
      line2: values.line2.trim() || null,
      area: values.area.trim(),
      city: city.trim(),
      pincode: values.pincode.trim(),
      lat: point.lat,
      lng: point.lng,
      landmark: values.landmark.trim() || null,
      gateCode: values.gateCode.trim() || null,
      isDefault: isFirst || isDefault,
    });
  };

  return (
    <form ref={ref} onSubmit={submit} noValidate className="space-y-5">
      <div className="rounded-field border border-hairline bg-mist p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="flex min-w-0 items-start gap-2 text-sm">
            <span className="flex h-5 shrink-0 items-center" aria-hidden>
              <MapPin className="size-4 text-leash" />
            </span>
            <span aria-live="polite">
              {location.kind === "current"
                ? "Using your current location for the map pin."
                : location.kind === "locating"
                  ? "Finding you…"
                  : location.kind === "saved"
                    ? "Keeping the saved map pin."
                    : `Map pin at the ${cityName} centre until you share your location.`}
            </span>
          </p>
          <Button
            variant="tonal"
            onClick={locate}
            loading={location.kind === "locating"}
            icon={<LocateFixed className="size-4" aria-hidden />}
          >
            Use my current location
          </Button>
        </div>
        {location.kind === "failed" ? (
          <p className="mt-2 text-caption text-ink-muted">
            {location.reason} That is fine: your carer finds you by the address, landmark and gate code below.
          </p>
        ) : (
          <p className="mt-2 text-caption text-ink-muted">
            The pin is used for distances to carers and the live map. Carers find you by the address itself.
          </p>
        )}
      </div>

      <TextField
        label="Label"
        value={values.label}
        onChange={(event) => set("label", event.target.value)}
        error={errors.label}
        placeholder="Home, Office, Parents"
        maxLength={LIMITS.addressLabel}
      />
      <TextField
        label="Flat, house or building"
        value={values.line1}
        onChange={(event) => set("line1", event.target.value)}
        error={errors.line1}
        maxLength={LIMITS.line1}
        autoComplete="address-line1"
      />
      <TextField
        label="Street"
        optional
        value={values.line2}
        onChange={(event) => set("line2", event.target.value)}
        error={errors.line2}
        maxLength={LIMITS.line2}
        autoComplete="address-line2"
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <TextField
          label="Area"
          value={values.area}
          onChange={(event) => set("area", event.target.value)}
          error={errors.area}
          maxLength={LIMITS.area}
          placeholder="Your locality"
        />
        <TextField
          label="City"
          value={city}
          onChange={(event) => {
            setCityInput(event.target.value);
            clear("city");
          }}
          error={errors.city}
          maxLength={LIMITS.city}
          autoComplete="address-level2"
        />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <TextField
          label="Pincode"
          inputMode="numeric"
          value={values.pincode}
          onChange={(event) => set("pincode", digitsOnly(event.target.value, 6))}
          error={errors.pincode}
          autoComplete="postal-code"
        />
        <TextField
          label="Gate or door code"
          optional
          value={values.gateCode}
          onChange={(event) => set("gateCode", event.target.value)}
          error={errors.gateCode}
          maxLength={LIMITS.gateCode}
          hint="Added to the notes your carer sees when you book."
        />
      </div>
      <TextField
        label="Landmark"
        optional
        value={values.landmark}
        onChange={(event) => set("landmark", event.target.value)}
        error={errors.landmark}
        maxLength={LIMITS.landmark}
        placeholder="Opposite the park gate"
      />
      {isFirst ? (
        <p className="text-caption text-ink-muted">Your first address becomes your default.</p>
      ) : (
        <Toggle label="Make this my default" checked={isDefault} onChange={setIsDefault} disabled={address?.isDefault} />
      )}

      {!config && !address && location.kind !== "current" ? (
        <p className="text-caption text-alert">
          We could not load the city settings. Share your location, or try again in a moment.
        </p>
      ) : null}
      {unmappedError ? <ErrorNotice error={unmappedError} /> : null}

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        {onCancel ? (
          <Button variant="outline" onClick={onCancel} disabled={save.isPending}>
            Cancel
          </Button>
        ) : null}
        <Button type="submit" loading={save.isPending}>
          {submitLabel ?? (address ? "Save changes" : "Save address")}
        </Button>
      </div>
    </form>
  );
}
