"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { PackageSearch, ShoppingBag } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { SearchBox } from "@/components/carers/search-box";
import { Container, PageHeader } from "@/components/layout/container";
import { useCartDrawer } from "@/components/store/cart-drawer";
import { ProductCard, ProductCardSkeleton } from "@/components/store/product-card";
import { useCartQuantities } from "@/components/store/use-cart";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { PageSkeleton } from "@/components/ui/skeleton";
import { EmptyState, QueryView } from "@/components/ui/states";
import { api } from "@/lib/api";
import { CATEGORY_LABELS, CATEGORY_ORDER } from "@/lib/labels";
import { qk } from "@/lib/query-keys";
import type { ProductCategory } from "@/lib/types";
import { PageTitle } from "@/components/layout/page-title";

function Store() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { status } = useAuth();
  const { openCart } = useCartDrawer();
  const { byProduct, count } = useCartQuantities();
  const [resetKey, setResetKey] = useState(0);

  const rawCategory = params.get("category");
  const category = CATEGORY_ORDER.includes(rawCategory as ProductCategory) ? (rawCategory as ProductCategory) : null;
  const q = params.get("q") ?? "";

  const setParams = (next: { category?: ProductCategory | null; q?: string }) => {
    const search = new URLSearchParams();
    const nextCategory = next.category === undefined ? category : next.category;
    const nextQ = next.q === undefined ? q : next.q;
    if (nextCategory) search.set("category", nextCategory);
    if (nextQ.trim()) search.set("q", nextQ.trim());
    const text = search.toString();
    router.replace(text ? `${pathname}?${text}` : pathname, { scroll: false });
  };

  const products = useQuery({
    queryKey: qk.products(category, q.trim()),
    queryFn: () => api.store.products({ category: category ?? undefined, q: q.trim() || undefined }),
    placeholderData: keepPreviousData,
  });

  return (
    <Container>
      <PageHeader
        title="Pet store"
        subtitle="Food, treats, toys and grooming supplies, delivered to your door."
        action={
          status === "signedIn" ? (
            <Button variant="tonal" onClick={openCart} icon={<ShoppingBag className="size-4" aria-hidden />}>
              Basket{count > 0 ? ` (${count})` : ""}
            </Button>
          ) : null
        }
      />

      <div className="max-w-xl">
        <SearchBox
          key={resetKey}
          initial={q}
          onSearch={(value) => setParams({ q: value })}
          label="Search the store"
          placeholder="Search food, toys, brands"
        />
      </div>

      <div
        className="scrollbar-none relative -mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-1 sm:-mx-6 sm:px-6 md:mx-0 md:flex-wrap md:px-0"
        role="group"
        aria-label="Categories"
      >
        <Chip selected={category === null} onClick={() => setParams({ category: null })}>
          All
        </Chip>
        {CATEGORY_ORDER.map((key) => (
          <Chip key={key} selected={category === key} onClick={() => setParams({ category: key })}>
            {CATEGORY_LABELS[key]}
          </Chip>
        ))}
      </div>

      <div className="mt-6">
        <QueryView
          query={products}
          loading={
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4" role="status" aria-label="Loading products">
              {Array.from({ length: 8 }, (_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          }
          isEmpty={(list) => list.length === 0}
          empty={
            <EmptyState
              icon={<PackageSearch />}
              title={q ? "No products match that search" : "Nothing in this category yet"}
              body={q ? "Try a different word, or clear the search." : "Try another category."}
              action={
                q || category ? (
                  <Button
                    onClick={() => {
                      setParams({ category: null, q: "" });
                      setResetKey((key) => key + 1);
                    }}
                  >
                    Show everything
                  </Button>
                ) : undefined
              }
            />
          }
        >
          {(list) => (
            <ul
              className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4"
              aria-busy={products.isFetching}
            >
              {list.map((product) => (
                <li key={product.id}>
                  <ProductCard product={product} quantity={byProduct.get(product.id) ?? 0} />
                </li>
              ))}
            </ul>
          )}
        </QueryView>
      </div>

      {status === "signedIn" && count > 0 ? (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-hairline bg-surface/95 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur md:hidden">
          <Button block size="lg" onClick={openCart} icon={<ShoppingBag className="size-5" aria-hidden />}>
            View basket ({count} {count === 1 ? "item" : "items"})
          </Button>
        </div>
      ) : null}
    </Container>
  );
}

export default function StorePage() {
  return (
    <>
      <PageTitle title={"Pet store"} />
      <Suspense fallback={<PageSkeleton />}>
        <Store />
      </Suspense>
    </>
  );
}
