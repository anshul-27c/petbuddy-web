"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Truck } from "lucide-react";
import { ProductCard, ProductCardSkeleton } from "@/components/store/product-card";
import { useCartQuantities } from "@/components/store/use-cart";
import { ButtonLink } from "@/components/ui/button";
import { QueryView } from "@/components/ui/states";
import { api } from "@/lib/api";
import { qk } from "@/lib/query-keys";

export function StoreTeaser() {
  const products = useQuery({ queryKey: qk.products(null, ""), queryFn: () => api.store.products() });
  const { byProduct } = useCartQuantities();

  return (
    <div className="grid gap-6 rounded-card border border-hairline bg-surface p-5 sm:p-8 lg:grid-cols-[1fr_2fr] lg:items-center">
      <div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-sky px-3 py-1 text-small font-semibold text-leash-dark">
          <Truck className="size-4" aria-hidden />
          Delivered to your door
        </span>
        <h2 className="mt-3 font-display text-headline font-semibold">The PetBuddy store</h2>
        <p className="mt-2 text-ink-muted">
          Food and treats, toys, grooming kits and everyday gear, picked for pets like yours.
        </p>
        <ButtonLink href="/store" variant="outline" className="mt-5" icon={<ArrowRight className="size-4" aria-hidden />}>
          Visit the store
        </ButtonLink>
      </div>
      <QueryView
        query={products}
        loading={
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        }
        isEmpty={(list) => list.length === 0}
        empty={<p className="text-ink-muted">New products are on their way.</p>}
      >
        {(list) => (
          <ul className="grid grid-cols-2 gap-3 md:grid-cols-3">
            {list
              .filter((product) => product.inStock)
              .slice(0, 3)
              .map((product, index) => (
                <li key={product.id} className={index === 2 ? "hidden md:block" : undefined}>
                  <ProductCard product={product} quantity={byProduct.get(product.id) ?? 0} />
                </li>
              ))}
          </ul>
        )}
      </QueryView>
    </div>
  );
}
