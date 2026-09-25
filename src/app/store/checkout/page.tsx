"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MapPin, Plus, ShoppingBag } from "lucide-react";
import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import { AddressForm } from "@/components/addresses/address-form";
import { RequireAuth } from "@/components/auth/require-auth";
import { PaymentMethodPicker } from "@/components/booking/payment-method-picker";
import { BackLink, Container, PageHeader } from "@/components/layout/container";
import { usePay } from "@/components/payments/payment-provider";
import { ProductImage } from "@/components/store/product-image";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { ChoiceCard } from "@/components/ui/field";
import { Money } from "@/components/ui/money";
import { ErrorNotice } from "@/components/ui/notice";
import { CardSkeleton, ListSkeleton } from "@/components/ui/skeleton";
import { EmptyState, QueryView } from "@/components/ui/states";
import { Pill } from "@/components/ui/status-pill";
import { api } from "@/lib/api";
import { isConflict } from "@/lib/errors";
import { formatMoney } from "@/lib/format";
import { addressLine } from "@/lib/labels";
import { isPaymentCancelled } from "@/lib/payments/errors";
import { useAddresses, useCartSummary } from "@/lib/queries";
import { qk } from "@/lib/query-keys";
import type { CartSummary, PaymentMethod } from "@/lib/types";
import { PageTitle } from "@/components/layout/page-title";
import { SectionHeader, SectionLink } from "@/components/ui/section-header";

function AddressPicker({ value, onChange }: { value: string | null; onChange: (id: string) => void }) {
  const name = useId();
  const addresses = useAddresses();
  const [adding, setAdding] = useState(false);
  return (
    <fieldset>
      <legend className="font-display text-subhead font-semibold sm:text-headline">Deliver to</legend>
      <div className="mt-4 sm:mt-5">
        <QueryView
          query={addresses}
          loading={<ListSkeleton count={1} />}
          isEmpty={(list) => list.length === 0}
          empty={
            <Card>
              <p className="mb-5 text-title font-semibold">Add a delivery address</p>
              <AddressForm isFirst onSaved={(address) => onChange(address.id)} />
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
                  checked={value === address.id}
                  onChange={onChange}
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
                      onChange(address.id);
                      setAdding(false);
                    }}
                    onCancel={() => setAdding(false)}
                  />
                </Card>
              ) : (
                <Button variant="ghost" className="-ml-4 justify-self-start" onClick={() => setAdding(true)} icon={<Plus className="size-4" aria-hidden />}>
                  Add an address
                </Button>
              )}
            </div>
          )}
        </QueryView>
      </div>
    </fieldset>
  );
}

function Checkout({ summary }: { summary: CartSummary }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const pay = usePay();
  const addresses = useAddresses();
  const [addressId, setAddressId] = useState<string | null>(null);
  const [method, setMethod] = useState<PaymentMethod>("upi");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const summaryQuery = useCartSummary();

  const list = addresses.data ?? [];
  const effectiveAddressId = addressId ?? list.find((a) => a.isDefault)?.id ?? list[0]?.id ?? null;
  const hasOutOfStock = summary.lines.some((line) => !line.product.inStock);

  const place = useMutation({ mutationFn: api.store.placeOrder });

  const placeOrder = async () => {
    if (busy || !effectiveAddressId) return;
    setBusy(true);
    setError(null);
    try {
      const payment = await pay({
        amountPaise: summary.totalPaise,
        purpose: "order",
        description: `PetBuddy store order, ${summary.itemCount} ${summary.itemCount === 1 ? "item" : "items"}`,
        method,
      });
      const order = await place.mutateAsync({ addressId: effectiveAddressId, payment });
      queryClient.setQueryData(qk.order(order.id), order);
      queryClient.setQueryData(qk.cart, []);
      void queryClient.invalidateQueries({ queryKey: qk.cartAll });
      void queryClient.invalidateQueries({ queryKey: qk.ordersAll });
      void queryClient.invalidateQueries({ queryKey: ["products"] });
      router.replace(`/orders/${order.id}?placed=1`);
    } catch (caught) {
      setBusy(false);
      if (isPaymentCancelled(caught)) return;
      setError(caught);
      if (isConflict(caught)) {
        // Prices or stock moved: show the fresh basket before they pay again.
        void queryClient.invalidateQueries({ queryKey: qk.cartAll });
        void queryClient.invalidateQueries({ queryKey: ["products"] });
      }
    }
  };

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-10">
      <div className="stack-sections min-w-0">
        <AddressPicker value={effectiveAddressId} onChange={setAddressId} />
        <section aria-labelledby="items">
          <SectionHeader id="items" title="Items" action={<SectionLink href="/store">Change basket</SectionLink>} />
          <ul className="divide-y divide-hairline rounded-card border border-hairline bg-surface px-4 shadow-card sm:px-5">
            {summary.lines.map((line) => (
              <li key={line.product.id} className="flex items-center gap-4 py-4">
                <ProductImage
                  imageUrl={line.product.imageUrl}
                  category={line.product.category}
                  name={line.product.name}
                  className="size-14 shrink-0"
                  iconClassName="size-6"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{line.product.name}</p>
                  <p className="mt-1 text-small text-ink-muted">
                    {line.quantity} × <Money paise={line.product.pricePaise} />
                  </p>
                  {!line.product.inStock ? <p className="mt-1 text-small font-semibold text-alert">Out of stock</p> : null}
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <aside>
        <Card className="space-y-5 lg:sticky lg:top-24">
          <CardTitle>Order summary</CardTitle>
          <dl className="space-y-3 text-sm" aria-busy={summaryQuery.isFetching}>
            <div className="flex justify-between">
              <dt className="text-ink-muted">
                Subtotal ({summary.itemCount} {summary.itemCount === 1 ? "item" : "items"})
              </dt>
              <dd>
                <Money paise={summary.subtotalPaise} />
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink-muted">Delivery</dt>
              <dd>{summary.deliveryFeePaise === 0 ? "Free" : <Money paise={summary.deliveryFeePaise} />}</dd>
            </div>
            <div className="flex items-baseline justify-between border-t border-dashed border-hairline pt-4">
              <dt className="font-semibold">Total</dt>
              <dd>
                <Money paise={summary.totalPaise} display className="text-subhead" />
              </dd>
            </div>
          </dl>
          <PaymentMethodPicker value={method} onChange={setMethod} disabled={busy} />
          {hasOutOfStock ? (
            <p className="rounded-field bg-alert-soft p-4 text-sm text-alert">
              Something in your basket is out of stock. Remove it to place your order.
            </p>
          ) : null}
          {error ? <ErrorNotice error={error} /> : null}
          <Button
            variant="accent"
            size="lg"
            block
            sheen
            onClick={() => void placeOrder()}
            loading={busy}
            disabled={!effectiveAddressId || hasOutOfStock || summaryQuery.isFetching}
          >
            Place order {formatMoney(summary.totalPaise)}
          </Button>
          <p className="text-center text-small text-ink-muted">We will let you know when it ships.</p>
        </Card>
      </aside>
    </div>
  );
}

function CheckoutPageBody() {
  const summary = useCartSummary();
  return (
    <QueryView
      query={summary}
      loading={
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-10" role="status" aria-label="Loading checkout">
          <ListSkeleton count={2} />
          <CardSkeleton lines={4} />
        </div>
      }
      isEmpty={(data) => data.lines.length === 0}
      empty={
        <EmptyState
          icon={<ShoppingBag />}
          title="Your basket is empty"
          body="Add something from the store, then come back here to check out."
          action={<ButtonLink href="/store">Browse the store</ButtonLink>}
        />
      }
    >
      {(data) => <Checkout summary={data} />}
    </QueryView>
  );
}

export default function CheckoutPage() {
  return (
    <>
      <PageTitle title={"Checkout"} />
      <RequireAuth>
        <Container>
          <PageHeader title="Checkout" back={<BackLink href="/store">Back to the store</BackLink>} />
          <CheckoutPageBody />
        </Container>
      </RequireAuth>
    </>
  );
}
