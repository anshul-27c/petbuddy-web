"use client";

import { useQuery } from "@tanstack/react-query";
import { CircleCheck, MapPin, Package, PackageX } from "lucide-react";
import { useParams, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { RequireAuth } from "@/components/auth/require-auth";
import { Container, PageBack } from "@/components/layout/container";
import { OrderSteps } from "@/components/store/order-steps";
import { ProductImage } from "@/components/store/product-image";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { IconTile } from "@/components/ui/icon-tile";
import { Money } from "@/components/ui/money";
import { Notice } from "@/components/ui/notice";
import { CardSkeleton, PageSkeleton, Skeleton } from "@/components/ui/skeleton";
import { EmptyState, ErrorState } from "@/components/ui/states";
import { OrderStatusPill, PaymentStatusPill } from "@/components/ui/status-pill";
import { api, isApiError } from "@/lib/api";
import { formatDate, formatDayTime } from "@/lib/format";
import { addressLine } from "@/lib/labels";
import { qk } from "@/lib/query-keys";
import type { Order } from "@/lib/types";
import { PageTitle } from "@/components/layout/page-title";

function OrderView({ order }: { order: Order }) {
  const params = useSearchParams();
  const placed = params.get("placed") === "1";
  return (
    <div>
      {placed ? (
        <Notice tone="success" title="Order placed" role="status" className="mb-8 animate-rise-in">
          Thank you. We will let you know when it ships.
        </Notice>
      ) : null}

      <header className="flex flex-wrap items-start justify-between gap-4 pb-6 sm:pb-8">
        <div className="flex min-w-0 items-start gap-4">
          <IconTile size="xl">
            <Package />
          </IconTile>
          <div className="min-w-0">
            <h1 className="font-display text-headline font-semibold sm:text-display">Order {order.code}</h1>
            <p className="mt-1 text-sm text-ink-muted">Placed {formatDayTime(order.placedAt).toLowerCase()}</p>
          </div>
        </div>
        <OrderStatusPill status={order.status} className="mt-2" />
      </header>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-10">
        <div className="grid grid-cols-1 min-w-0 content-start gap-3 sm:gap-4">
          <Card>
            {order.status === "cancelled" ? (
              <div className="flex items-start gap-3">
                <IconTile tone="alert">
                  <PackageX />
                </IconTile>
                <div>
                  <p className="text-title font-semibold">This order was cancelled</p>
                  <p className="mt-1 text-sm text-ink-muted">
                    Anything you paid is refunded to your original payment method.
                  </p>
                </div>
              </div>
            ) : (
              <>
                <OrderSteps status={order.status} />
                {order.deliveredAt ? (
                  <p className="mt-5 flex items-center justify-center gap-2 border-t border-hairline pt-4 text-sm text-trail">
                    <CircleCheck className="size-4" aria-hidden />
                    Delivered on {formatDate(order.deliveredAt)}
                  </p>
                ) : null}
              </>
            )}
          </Card>

          <Card>
            <CardTitle>Items</CardTitle>
            <ul className="mt-2 divide-y divide-hairline">
              {order.items.map((item) => (
                <li key={item.productId} className="flex items-center gap-4 py-4 last:pb-0">
                  <ProductImage
                    imageUrl={item.imageUrl}
                    name={item.name}
                    className="size-14 shrink-0"
                    iconClassName="size-6"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-small text-ink-muted">{item.brand}</p>
                    <p className="mt-1 truncate text-sm font-semibold">{item.name}</p>
                    <p className="mt-1 text-small text-ink-muted">
                      {item.quantity} × <Money paise={item.pricePaise} />
                    </p>
                  </div>
                  <Money paise={item.totalPaise} className="font-semibold" />
                </li>
              ))}
            </ul>
          </Card>
        </div>

        <aside className="grid grid-cols-1 content-start gap-3 sm:gap-4 lg:sticky lg:top-24 lg:self-start">
          <Card>
            <div className="mb-4 flex items-center justify-between gap-3">
              <CardTitle>Payment</CardTitle>
              <PaymentStatusPill status={order.paymentStatus} />
            </div>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-ink-muted">Subtotal</dt>
                <dd>
                  <Money paise={order.subtotalPaise} />
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-muted">Delivery</dt>
                <dd>{order.deliveryFeePaise === 0 ? "Free" : <Money paise={order.deliveryFeePaise} />}</dd>
              </div>
              <div className="flex items-baseline justify-between border-t border-dashed border-hairline pt-4">
                <dt className="font-semibold">Total</dt>
                <dd>
                  <Money paise={order.totalPaise} display className="text-subhead" />
                </dd>
              </div>
            </dl>
          </Card>
          <Card>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="size-4 text-ink-muted" aria-hidden />
              Delivering to
            </CardTitle>
            <p className="mt-3 font-semibold">{order.address.label}</p>
            <p className="mt-1 text-sm text-ink-muted">{addressLine(order.address)}</p>
          </Card>
        </aside>
      </div>
    </div>
  );
}

function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const query = useQuery({ queryKey: qk.order(id), queryFn: () => api.store.order(id) });
  return (
    <>
      <PageTitle title={query.data ? `Order ${query.data.code}` : "Order"} />
      <Container>
        <PageBack href="/orders">All orders</PageBack>
        {query.data ? (
          <OrderView order={query.data} />
        ) : query.isError ? (
          isApiError(query.error) && query.error.status === 404 ? (
            <EmptyState
              icon={<PackageX />}
              title="We could not find that order"
              body="It may belong to another account, or the link is wrong."
              action={<ButtonLink href="/orders">See your orders</ButtonLink>}
            />
          ) : (
            <ErrorState error={query.error} onRetry={() => void query.refetch()} retrying={query.isFetching} />
          )
        ) : (
          <div role="status" aria-label="Loading order">
            <div className="flex items-start gap-4 pb-6 sm:pb-8">
              <Skeleton className="size-14 rounded-card" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-8 w-1/2" />
                <Skeleton className="h-4 w-40" />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-10">
              <div className="grid grid-cols-1 content-start gap-3 sm:gap-4">
                <CardSkeleton lines={1} />
                <CardSkeleton lines={4} />
              </div>
              <CardSkeleton lines={3} />
            </div>
          </div>
        )}
      </Container>
    </>
  );
}

export default function OrderDetailPage() {
  return (
    <RequireAuth>
      <Suspense fallback={<PageSkeleton />}>
        <OrderDetail />
      </Suspense>
    </RequireAuth>
  );
}
