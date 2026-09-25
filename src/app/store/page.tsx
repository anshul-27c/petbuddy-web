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
import { CategoryIcon } from "@/components/ui/icons";
import { Reveal, revealItem } from "@/components/ui/motion";
import { cn } from "@/lib/utils";

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
            // Phones already have the header basket and the bottom bar.
            <div className="hidden sm:block">
              <Button variant="tonal" onClick={openCart} icon={<ShoppingBag className="size-4" aria-hidden />}>
                Basket{count > 0 ? ` (${count})` : ""}
              </Button>
            </div>
          ) : null
        }
      />

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between lg:gap-6">
        <div className="lg:order-2 lg:w-80 lg:shrink-0">
          <SearchBox
            key={resetKey}
            initial={q}
            onSearch={(value) => setParams({ q: value })}
            label="Search the store"
            placeholder="Search food, toys, brands"
          />
        </div>
        <div
          className="rail gap-2 pb-1 lg:order-1 lg:mx-0 lg:flex-wrap lg:overflow-visible lg:px-0 lg:pb-0"
          role="group"
          aria-label="Categories"
        >
          <Chip selected={category === null} onClick={() => setParams({ category: null })}>
            All
          </Chip>
          {CATEGORY_ORDER.map((key) => (
            <Chip
              key={key}
              selected={category === key}
              onClick={() => setParams({ category: key })}
              icon={<CategoryIcon category={key} className="size-4" />}
            >
              {CATEGORY_LABELS[key]}
            </Chip>
          ))}
        </div>
      </div>

      <div className="mt-6 sm:mt-8">
        <QueryView
          query={products}
          loading={
            <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4" role="status" aria-label="Loading products">
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
            <Reveal
              as="ul"
              className={cn(
                "grid grid-cols-2 gap-3 transition-opacity sm:gap-4 md:grid-cols-3 lg:grid-cols-4",
                products.isFetching && "opacity-70",
              )}
              aria-busy={products.isFetching}
            >
              {list.map((product, index) => (
                <li key={product.id} className="flex" {...revealItem(index)}>
                  <ProductCard product={product} quantity={byProduct.get(product.id) ?? 0} />
                </li>
              ))}
            </Reveal>
          )}
        </QueryView>
      </div>

      {status === "signedIn" && count > 0 ? (
        <>
          {/* Reserves the bar's 80 px so the last row is never under it. */}
          <div aria-hidden className="pb-bar md:hidden" />
          <div className="fixed inset-x-0 bottom-0 z-30 animate-sheet-in bg-surface/90 shadow-[0_-1px_0_var(--color-hairline)] pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden">
            <div className="container-page flex h-20 items-center">
              <Button block size="lg" sheen onClick={openCart} icon={<ShoppingBag className="size-5" aria-hidden />}>
                View basket ({count} {count === 1 ? "item" : "items"})
              </Button>
            </div>
          </div>
        </>
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
