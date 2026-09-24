"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, CircleCheck, MapPin, PackageX } from "lucide-react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { RequireAuth } from "@/components/auth/require-auth";
import { Container } from "@/components/layout/container";
import { OrderSteps } from "@/components/store/order-steps";
import { ProductImage } from "@/components/store/product-image";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Money } from "@/components/ui/money";
import { Notice } from "@/components/ui/notice";
import { CardSkeleton, PageSkeleton } from "@/components/ui/skeleton";
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
    <div className="space-y-6">
      {placed ? (
        <Notice tone="success" title="Order placed" role="status">
          Thank you. We will let you know when it ships.
        </Notice>
      ) : null}

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-headline font-semibold">Order {order.code}</h1>
          <p className="text-sm text-ink-muted">Placed {formatDayTime(order.placedAt).toLowerCase()}</p>
        </div>
        <OrderStatusPill status={order.status} />
      </div>

      <Card>
        {order.status === "cancelled" ? (
          <div className="flex items-start gap-3">
            <PackageX className="size-6 shrink-0 text-alert" aria-hidden />
            <div>
              <p className="font-semibold">This order was cancelled</p>
              <p className="text-sm text-ink-muted">Anything you paid is refunded to your original payment method.</p>
            </div>
          </div>
        ) : (
          <>
            <OrderSteps status={order.status} />
            {order.deliveredAt ? (
              <p className="mt-4 flex items-center gap-2 text-sm text-trail">
                <CircleCheck className="size-4" aria-hidden />
                Delivered on {formatDate(order.deliveredAt)}
              </p>
            ) : null}
          </>
        )}
      </Card>

      <div className="grid gap-6 md:grid-cols-[1fr_20rem]">
        <Card>
          <h2 className="text-title font-semibold">Items</h2>
          <ul className="mt-3 divide-y divide-hairline">
            {order.items.map((item) => (
              <li key={item.productId} className="flex items-center gap-3 py-3">
                <ProductImage
                  imageUrl={item.imageUrl}
                  name={item.name}
                  className="size-14 shrink-0"
                  iconClassName="size-6"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-small text-ink-muted">{item.brand}</p>
                  <p className="truncate text-sm font-semibold">{item.name}</p>
                  <p className="text-small text-ink-muted">
                    {item.quantity} × <Money paise={item.pricePaise} />
                  </p>
                </div>
                <Money paise={item.totalPaise} className="font-semibold" />
              </li>
            ))}
          </ul>
        </Card>
        <div className="space-y-6">
          <Card>
            <div className="mb-3 flex items-center justify-between gap-2">
              <h2 className="text-title font-semibold">Payment</h2>
              <PaymentStatusPill status={order.paymentStatus} />
            </div>
            <dl className="space-y-2 text-sm">
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
              <div className="flex items-baseline justify-between border-t border-hairline pt-3">
                <dt className="font-semibold">Total</dt>
                <dd>
                  <Money paise={order.totalPaise} display className="text-subhead" />
                </dd>
              </div>
            </dl>
          </Card>
          <Card>
            <h2 className="flex items-center gap-2 text-title font-semibold">
              <MapPin className="size-4 text-ink-muted" aria-hidden />
              Delivering to
            </h2>
            <p className="mt-2 font-semibold">{order.address.label}</p>
            <p className="text-sm text-ink-muted">{addressLine(order.address)}</p>
          </Card>
        </div>
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
      <Container width="medium" className="pt-4 sm:pt-6">
        <Link href="/orders" className="mb-4 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-leash-dark hover:underline">
          <ArrowLeft className="size-4" aria-hidden />
          All orders
        </Link>
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
          <div className="space-y-6" role="status" aria-label="Loading order">
            <CardSkeleton lines={1} />
            <CardSkeleton lines={4} />
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
