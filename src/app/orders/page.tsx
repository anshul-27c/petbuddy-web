"use client";

import { useQuery } from "@tanstack/react-query";
import { ChevronRight, Package } from "lucide-react";
import Link from "next/link";
import { RequireAuth } from "@/components/auth/require-auth";
import { AccountNav } from "@/components/account/account-nav";
import { Container, PageHeader } from "@/components/layout/container";
import { ButtonLink } from "@/components/ui/button";
import { Money } from "@/components/ui/money";
import { ListSkeleton } from "@/components/ui/skeleton";
import { EmptyState, QueryView } from "@/components/ui/states";
import { OrderStatusPill } from "@/components/ui/status-pill";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/format";
import { qk } from "@/lib/query-keys";
import { PageTitle } from "@/components/layout/page-title";

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
        <ul className="space-y-3">
          {list.map((order) => {
            const items = order.items.reduce((sum, item) => sum + item.quantity, 0);
            return (
              <li key={order.id}>
                <Link
                  href={`/orders/${order.id}`}
                  className="flex items-center gap-4 rounded-card border border-hairline bg-surface p-4 transition-colors hover:border-ink-faint sm:p-5"
                >
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-field bg-sky text-leash">
                    <Package className="size-5" aria-hidden />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold">Order {order.code}</p>
                      <OrderStatusPill status={order.status} />
                    </div>
                    <p className="mt-0.5 text-sm text-ink-muted">
                      {formatDate(order.placedAt)} · {items} {items === 1 ? "item" : "items"}
                    </p>
                  </div>
                  <Money paise={order.totalPaise} className="font-semibold" />
                  <ChevronRight className="size-5 shrink-0 text-ink-muted" aria-hidden />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </QueryView>
  );
}

export default function OrdersPage() {
  return (
    <>
      <PageTitle title={"Store orders"} />
      <RequireAuth>
        <Container width="medium">
          <PageHeader title="Store orders" />
          <AccountNav />
          <div className="mt-6">
            <Orders />
          </div>
        </Container>
      </RequireAuth>
    </>
  );
}
