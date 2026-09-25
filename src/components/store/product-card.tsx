"use client";

import { Plus, Tag as TagIcon } from "lucide-react";
import { loginHref, useAuth } from "@/components/auth/auth-provider";
import { Button, ButtonLink } from "@/components/ui/button";
import { Money } from "@/components/ui/money";
import { Skeleton } from "@/components/ui/skeleton";
import { RatingInline } from "@/components/ui/stars";
import { Pill } from "@/components/ui/status-pill";
import type { Product } from "@/lib/types";
import { cn } from "@/lib/utils";
import { ProductImage } from "./product-image";
import { QuantityStepper } from "./quantity-stepper";
import { useSetCartQuantity } from "./use-cart";

function discountPercent(product: Product): number {
  if (!product.mrpPaise || product.mrpPaise <= product.pricePaise) return 0;
  return Math.round(((product.mrpPaise - product.pricePaise) / product.mrpPaise) * 100);
}

function CartControl({ product, quantity }: { product: Product; quantity: number }) {
  const { status } = useAuth();
  const setQuantity = useSetCartQuantity();

  // The image already says "Out of stock"; keep the button's height so the row still lines up.
  if (!product.inStock) return <div aria-hidden className="h-11" />;
  if (status !== "signedIn") {
    return (
      <ButtonLink href={loginHref("/store")} variant="tonal" block aria-label={`Sign in to add ${product.name}`}>
        <Plus className="size-4" aria-hidden />
        Add
      </ButtonLink>
    );
  }
  if (quantity === 0) {
    return (
      <Button
        variant="primary"
        block
        onClick={() => setQuantity.mutate({ product, quantity: 1 })}
        disabled={setQuantity.isPending}
        aria-label={`Add ${product.name} to basket`}
        icon={<Plus className="size-4" aria-hidden />}
      >
        Add
      </Button>
    );
  }
  return (
    <QuantityStepper
      name={product.name}
      quantity={quantity}
      disabled={setQuantity.isPending}
      onChange={(next) => setQuantity.mutate({ product, quantity: next })}
      className="w-full justify-between"
    />
  );
}

/**
 * A product in a grid or rail. The price row keeps the MRP line's height even
 * when there is no MRP, so prices and buttons line up across a row.
 */
export function ProductCard({ product, quantity }: { product: Product; quantity: number }) {
  const off = discountPercent(product);
  return (
    <article className="group flex w-full flex-col rounded-card border border-hairline bg-surface p-4 shadow-card transition duration-250 ease-out-soft hover:shadow-lift">
      <div className="relative aspect-[4/3] overflow-hidden rounded-field">
        <ProductImage
          imageUrl={product.imageUrl}
          category={product.category}
          name={product.name}
          muted={!product.inStock}
          className="size-full transition-transform duration-500 ease-out-soft group-hover:scale-105"
        />
        <div className="absolute top-2 left-2">
          {!product.inStock ? (
            <Pill tone="muted" dot={false}>
              Out of stock
            </Pill>
          ) : off > 0 ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-surface px-2 py-1 text-label font-bold text-ink shadow-card">
              <TagIcon className="size-3 text-tail" aria-hidden />
              {off}% off
            </span>
          ) : null}
        </div>
      </div>
      <p className="mt-3 truncate text-small text-ink-muted">{product.brand}</p>
      <h3 className="mt-1 line-clamp-2 min-h-[2.8em] text-sm leading-[1.4] font-semibold">{product.name}</h3>
      <RatingInline rating={product.rating} count={product.reviewCount} className="mt-1 text-small" />
      <div className="mt-auto pt-3">
        <div className="flex min-h-11 flex-col justify-end">
          <Money paise={product.pricePaise} display className="text-title leading-tight" />
          <span className={cn("text-small", !(off > 0 && product.mrpPaise) && "invisible")} aria-hidden={!(off > 0 && product.mrpPaise)}>
            <span className="text-ink-muted">MRP </span>
            {off > 0 && product.mrpPaise ? <Money paise={product.mrpPaise} strike /> : "–"}
          </span>
        </div>
        <div className="mt-3">
          <CartControl product={product} quantity={quantity} />
        </div>
      </div>
    </article>
  );
}

export function ProductCardSkeleton() {
  return (
    <div aria-hidden className="w-full rounded-card border border-hairline bg-surface p-4 shadow-card">
      <Skeleton className="aspect-[4/3] w-full" />
      <Skeleton className="mt-3 h-3 w-1/3" />
      <Skeleton className="mt-2 h-4 w-5/6" />
      <Skeleton className="mt-2 h-3 w-1/4" />
      <Skeleton className="mt-4 h-5 w-16" />
      <Skeleton className="mt-6 h-11 w-full" />
    </div>
  );
}
