"use client";

import { useQuery } from "@tanstack/react-query";
import { ChevronRight, Package } from "lucide-react";
import Link from "next/link";
import { RequireAuth } from "@/components/auth/require-auth";
import { AccountShell } from "@/components/account/account-nav";
import { ButtonLink } from "@/components/ui/button";
import { IconTile } from "@/components/ui/icon-tile";
import { Money } from "@/components/ui/money";
import { ListSkeleton } from "@/components/ui/skeleton";
import { EmptyState, QueryView } from "@/components/ui/states";
import { OrderStatusPill } from "@/components/ui/status-pill";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/format";
import { qk } from "@/lib/query-keys";
import { PageTitle } from "@/components/layout/page-title";
import { Reveal, revealItem } from "@/components/ui/motion";

function Orders() {
  const orders = useQuery({ queryKey: qk.orders, queryFn: api.store.orders });
  return (
    <QueryView
      query={orders}
      loading={<ListSkeleton count={3} />}
      isEmpty={(list) => list.length === 0}
      empty={
        <EmptyState
          icon={<Package />}
          title="No orders yet"
          body="Food, toys and grooming supplies you order from the store will show up here."
          action={<ButtonLink href="/store">Visit the store</ButtonLink>}
        />
      }
    >
      {(list) => (
        <Reveal as="ul" className="grid grid-cols-1 gap-3 sm:gap-4">
          {list.map((order, index) => {
            const items = order.items.reduce((sum, item) => sum + item.quantity, 0);
            return (
              <li key={order.id} {...revealItem(index)}>
                <Link
                  href={`/orders/${order.id}`}
                  className="lift group flex items-center gap-4 rounded-card border border-hairline bg-surface p-4 shadow-card hover:border-ink-faint sm:p-5"
                >
                  <span className="hidden sm:block">
                    <IconTile size="lg">
                      <Package />
                    </IconTile>
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-title font-semibold">Order {order.code}</p>
                      <OrderStatusPill status={order.status} />
                    </div>
                    <p className="mt-1 text-sm text-ink-muted">
                      {formatDate(order.placedAt)} · {items} {items === 1 ? "item" : "items"}
                    </p>
                  </div>
                  <Money paise={order.totalPaise} className="font-semibold" />
                  <ChevronRight
                    className="size-5 shrink-0 text-ink-faint transition-transform duration-150 group-hover:translate-x-1"
                    aria-hidden
                  />
                </Link>
              </li>
            );
          })}
        </Reveal>
      )}
    </QueryView>
  );
}

export default function OrdersPage() {
  return (
    <>
      <PageTitle title={"Store orders"} />
      <RequireAuth>
        <AccountShell title="Store orders">
          <Orders />
        </AccountShell>
      </RequireAuth>
    </>
  );
}
