"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { AuthProvider } from "@/components/auth/auth-provider";
import { PaymentProvider } from "@/components/payments/payment-provider";
import { CartDrawerProvider } from "@/components/store/cart-drawer";
import { ToastProvider } from "@/components/ui/toast";
import { isApiError } from "@/lib/api";

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        refetchOnWindowFocus: true,
        // A 4xx will not fix itself; only retry network and server faults.
        retry: (failureCount, error) => {
          if (isApiError(error) && error.status >= 400 && error.status < 500) return false;
          return failureCount < 2;
        },
      },
      mutations: { retry: false },
    },
  });
}

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(makeQueryClient);
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <AuthProvider>
          <PaymentProvider>
            <CartDrawerProvider>{children}</CartDrawerProvider>
          </PaymentProvider>
        </AuthProvider>
      </ToastProvider>
    </QueryClientProvider>
  );
}
