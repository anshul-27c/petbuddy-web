"use client";

import { useQuery } from "@tanstack/react-query";
import { ProductCard, ProductCardSkeleton } from "@/components/store/product-card";
import { useCartQuantities } from "@/components/store/use-cart";
import { fullRows } from "@/components/ui/grid";
import { Reveal, revealItem } from "@/components/ui/motion";
import { QueryView } from "@/components/ui/states";
import { api } from "@/lib/api";
import { qk } from "@/lib/query-keys";
import { cn } from "@/lib/utils";

const COLUMNS = { md: 3, lg: 4 } as const;
const MAX = 4;
const ITEM = "w-52 md:w-auto";

/** A few in-stock products: a rail on phones, one full row from 768 px. */
export function StoreTeaser() {
  const products = useQuery({ queryKey: qk.products(null, ""), queryFn: () => api.store.products() });
  const { byProduct } = useCartQuantities();
  const skeleton = fullRows(MAX, COLUMNS);

  return (
    <QueryView
      query={products}
      loading={
        <div className={cn("rail gap-3 md:mx-0 md:grid md:gap-6 md:overflow-visible md:px-0", skeleton.grid)}>
          {Array.from({ length: MAX }, (_, i) => (
            <div key={i} className={cn(ITEM, skeleton.item(i))}>
              <ProductCardSkeleton />
            </div>
          ))}
        </div>
      }
      isEmpty={(list) => list.filter((product) => product.inStock).length === 0}
      empty={<p className="text-ink-muted">New products are on their way.</p>}
    >
      {(list) => {
        const shown = list.filter((product) => product.inStock).slice(0, MAX);
        const rows = fullRows(shown.length, COLUMNS);
        return (
          <Reveal
            as="ul"
            className={cn("rail gap-3 pb-1 md:mx-0 md:grid md:gap-6 md:overflow-visible md:px-0 md:pb-0", rows.grid)}
          >
            {shown.map((product, index) => (
              <li key={product.id} className={cn(ITEM, "flex", rows.item(index))} {...revealItem(index)}>
                <ProductCard product={product} quantity={byProduct.get(product.id) ?? 0} />
              </li>
            ))}
          </Reveal>
        );
      }}
    </QueryView>
  );
}
