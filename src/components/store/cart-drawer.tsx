"use client";

import { ShoppingBag } from "lucide-react";
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { loginHref, useAuth } from "@/components/auth/auth-provider";
import { ButtonLink } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Money } from "@/components/ui/money";
import { ListSkeleton, Skeleton } from "@/components/ui/skeleton";
import { EmptyState, QueryView } from "@/components/ui/states";
import { useCartSummary } from "@/lib/queries";
import type { CartLine } from "@/lib/types";
import { ProductImage } from "./product-image";
import { QuantityStepper } from "./quantity-stepper";
import { useCartQuantities, useSetCartQuantity } from "./use-cart";

interface CartDrawerContextValue {
  openCart: () => void;
  closeCart: () => void;
}

const CartDrawerContext = createContext<CartDrawerContextValue | null>(null);

export function CartDrawerProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const openCart = useCallback(() => setOpen(true), []);
  const closeCart = useCallback(() => setOpen(false), []);
  const value = useMemo(() => ({ openCart, closeCart }), [openCart, closeCart]);
  return (
    <CartDrawerContext.Provider value={value}>
      {children}
      <CartDrawer open={open} onClose={closeCart} />
    </CartDrawerContext.Provider>
  );
}

export function useCartDrawer() {
  const value = useContext(CartDrawerContext);
  if (!value) throw new Error("useCartDrawer must be used inside CartDrawerProvider");
  return value;
}

function CartDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { status } = useAuth();
  const { query } = useCartQuantities();
  const summary = useCartSummary();
  const hasLines = (query.data?.length ?? 0) > 0;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Your basket"
      variant="drawer"
      footer={status === "signedIn" && hasLines ? <CartTotals summary={summary} onCheckout={onClose} /> : undefined}
    >
      {status !== "signedIn" ? (
        <EmptyState
          icon={<ShoppingBag />}
          title="Sign in to use your basket"
          body="Your basket is saved to your account, so it follows you to the app."
          action={
            <ButtonLink href={loginHref("/store")} onClick={onClose}>
              Sign in
            </ButtonLink>
          }
        />
      ) : (
        <QueryView
          query={query}
          loading={<ListSkeleton count={2} />}
          isEmpty={(lines) => lines.length === 0}
          empty={
            <EmptyState
              icon={<ShoppingBag />}
              title="Your basket is empty"
              body="Food, treats, toys and grooming supplies, delivered to your door."
              action={
                <ButtonLink href="/store" onClick={onClose}>
                  Browse the store
                </ButtonLink>
              }
            />
          }
        >
          {(lines) => (
            <ul className="divide-y divide-hairline">
              {lines.map((line) => (
                <CartLineRow key={line.product.id} line={line} />
              ))}
            </ul>
          )}
        </QueryView>
      )}
    </Dialog>
  );
}

function CartLineRow({ line }: { line: CartLine }) {
  const setQuantity = useSetCartQuantity();
  const { product } = line;
  return (
    <li className="flex gap-4 py-4">
      <ProductImage
        imageUrl={product.imageUrl}
        category={product.category}
        name={product.name}
        className="size-16 shrink-0"
        iconClassName="size-6"
      />
      <div className="min-w-0 flex-1">
        <p className="text-small text-ink-muted">{product.brand}</p>
        <p className="mt-1 line-clamp-2 text-sm font-semibold">{product.name}</p>
        <p className="mt-1 text-small text-ink-muted">
          <Money paise={product.pricePaise} /> each
        </p>
        {!product.inStock ? <p className="mt-1 text-small font-semibold text-alert">Out of stock</p> : null}
        <QuantityStepper
          className="mt-3"
          name={product.name}
          quantity={line.quantity}
          disabled={setQuantity.isPending}
          onChange={(quantity) => setQuantity.mutate({ product, quantity })}
        />
      </div>
    </li>
  );
}

function CartTotals({
  summary,
  onCheckout,
}: {
  summary: ReturnType<typeof useCartSummary>;
  onCheckout: () => void;
}) {
  const data = summary.data;
  const updating = summary.isFetching;
  return (
    <div className="space-y-4">
      {data ? (
        <dl className="space-y-2 text-sm" aria-busy={updating}>
          <div className="flex justify-between">
            <dt className="text-ink-muted">Subtotal ({data.itemCount} {data.itemCount === 1 ? "item" : "items"})</dt>
            <dd>
              <Money paise={data.subtotalPaise} />
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-ink-muted">Delivery</dt>
            <dd>{data.deliveryFeePaise === 0 ? "Free" : <Money paise={data.deliveryFeePaise} />}</dd>
          </div>
          <div className="flex items-baseline justify-between border-t border-dashed border-hairline pt-3">
            <dt className="font-semibold">Total</dt>
            <dd>
              <Money paise={data.totalPaise} display className="text-subhead" />
            </dd>
          </div>
        </dl>
      ) : (
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-6 w-1/2" />
        </div>
      )}
      <ButtonLink href="/store/checkout" block size="lg" sheen onClick={onCheckout}>
        Checkout
      </ButtonLink>
    </div>
  );
}
