"use client";

import { Plus, Tag as TagIcon } from "lucide-react";
import { loginHref, useAuth } from "@/components/auth/auth-provider";
import { Button, ButtonLink } from "@/components/ui/button";
import { Money } from "@/components/ui/money";
import { Skeleton } from "@/components/ui/skeleton";
import { RatingInline } from "@/components/ui/stars";
import { Pill } from "@/components/ui/status-pill";
import type { Product } from "@/lib/types";
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

  if (!product.inStock) return null;
  if (status !== "signedIn") {
    return (
      <ButtonLink href={loginHref("/store")} variant="tonal" aria-label={`Sign in to add ${product.name}`}>
        <Plus className="size-4" aria-hidden />
        Add
      </ButtonLink>
    );
  }
  if (quantity === 0) {
    return (
      <Button
        variant="primary"
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
    />
  );
}

export function ProductCard({ product, quantity }: { product: Product; quantity: number }) {
  const off = discountPercent(product);
  return (
    <article className="flex h-full flex-col rounded-card border border-hairline bg-surface p-3">
      <div className="relative aspect-[4/3]">
        <ProductImage
          imageUrl={product.imageUrl}
          category={product.category}
          name={product.name}
          muted={!product.inStock}
          className="size-full"
        />
        <div className="absolute top-2 left-2">
          {!product.inStock ? (
            <Pill tone="muted" dot={false}>
              Out of stock
            </Pill>
          ) : off > 0 ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-tail-soft px-2.5 py-1 text-label font-bold text-ink">
              <TagIcon className="size-3 text-tail" aria-hidden />
              {off}% off
            </span>
          ) : null}
        </div>
      </div>
      <p className="mt-3 truncate text-small text-ink-muted">{product.brand}</p>
      <h3 className="line-clamp-2 min-h-[2.6em] text-sm font-semibold">{product.name}</h3>
      <RatingInline rating={product.rating} count={product.reviewCount} className="mt-1 text-small" />
      <div className="mt-auto flex flex-wrap items-end justify-between gap-2 pt-3">
        <div className="flex flex-col">
          <Money paise={product.pricePaise} display className="text-title" />
          {off > 0 && product.mrpPaise ? (
            <span className="text-small">
              <span className="text-ink-muted">MRP </span>
              <Money paise={product.mrpPaise} strike />
            </span>
          ) : null}
        </div>
        <CartControl product={product} quantity={quantity} />
      </div>
    </article>
  );
}

export function ProductCardSkeleton() {
  return (
    <div aria-hidden className="rounded-card border border-hairline bg-surface p-3">
      <Skeleton className="aspect-[4/3] w-full" />
      <Skeleton className="mt-3 h-3 w-1/3" />
      <Skeleton className="mt-2 h-4 w-5/6" />
      <Skeleton className="mt-2 h-3 w-1/4" />
      <div className="mt-4 flex items-end justify-between">
        <Skeleton className="h-5 w-16" />
        <Skeleton className="h-11 w-20" />
      </div>
    </div>
  );
}
