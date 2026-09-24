"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/toast";
import { api } from "@/lib/api";
import { errorCopy } from "@/lib/errors";
import { useCartLines } from "@/lib/queries";
import { qk } from "@/lib/query-keys";
import type { CartLine, Product } from "@/lib/types";

/** Sets a product's quantity (0 removes it), updating the basket straight away. */
export function useSetCartQuantity() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: ({ product, quantity }: { product: Product; quantity: number }) =>
      api.store.setQuantity(product.id, quantity),
    onMutate: async ({ product, quantity }) => {
      await queryClient.cancelQueries({ queryKey: qk.cart });
      const previous = queryClient.getQueryData<CartLine[]>(qk.cart);
      queryClient.setQueryData<CartLine[]>(qk.cart, (lines = []) => {
        const exists = lines.some((line) => line.product.id === product.id);
        if (quantity <= 0) return lines.filter((line) => line.product.id !== product.id);
        if (exists) {
          return lines.map((line) => (line.product.id === product.id ? { ...line, quantity } : line));
        }
        return [...lines, { product, quantity }];
      });
      return { previous };
    },
    onError: (error, _variables, context) => {
      queryClient.setQueryData(qk.cart, context?.previous);
      const { title, body } = errorCopy(error);
      toast({ tone: "error", title, body });
    },
    onSuccess: (lines) => {
      queryClient.setQueryData(qk.cart, lines);
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: qk.cartSummary });
    },
  });
}

/** Quantity of each product in the basket, and the total item count. */
export function useCartQuantities() {
  const cart = useCartLines();
  const byProduct = new Map<string, number>();
  let count = 0;
  for (const line of cart.data ?? []) {
    byProduct.set(line.product.id, line.quantity);
    count += line.quantity;
  }
  return { byProduct, count, query: cart };
}
