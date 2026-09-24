"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Heart } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { api } from "@/lib/api";
import { errorCopy } from "@/lib/errors";
import { qk } from "@/lib/query-keys";
import { cn } from "@/lib/utils";

function isEarnerLike(value: unknown): value is { id: string; isFavourite: boolean } {
  return typeof value === "object" && value !== null && "isFavourite" in value && "id" in value;
}

/** Flips `isFavourite` for one carer everywhere it is cached (lists and profile). */
function patchFavourite(data: unknown, earnerId: string, isFavourite: boolean): unknown {
  if (Array.isArray(data)) {
    return data.map((item) => (isEarnerLike(item) && item.id === earnerId ? { ...item, isFavourite } : item));
  }
  if (isEarnerLike(data) && data.id === earnerId) return { ...data, isFavourite };
  return data;
}

export function FavouriteButton({
  earnerId,
  name,
  isFavourite,
  className,
}: {
  earnerId: string;
  name: string;
  isFavourite: boolean;
  className?: string;
}) {
  const queryClient = useQueryClient();
  const toast = useToast();

  const mutation = useMutation({
    mutationFn: (next: boolean) => (next ? api.earners.favourite(earnerId) : api.earners.unfavourite(earnerId)),
    onMutate: async (next) => {
      await queryClient.cancelQueries({ queryKey: qk.earnersAll });
      queryClient.setQueriesData({ queryKey: qk.earnersAll }, (data: unknown) =>
        patchFavourite(data, earnerId, next),
      );
    },
    onError: (error, next) => {
      queryClient.setQueriesData({ queryKey: qk.earnersAll }, (data: unknown) =>
        patchFavourite(data, earnerId, !next),
      );
      const { title, body } = errorCopy(error);
      toast({ tone: "error", title, body });
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ["earners", "list"] });
    },
  });

  return (
    <button
      type="button"
      aria-pressed={isFavourite}
      aria-label={isFavourite ? `Remove ${name} from favourites` : `Save ${name} to favourites`}
      title={isFavourite ? "Saved to favourites" : "Save to favourites"}
      disabled={mutation.isPending}
      onClick={() => mutation.mutate(!isFavourite)}
      className={cn(
        "inline-flex size-11 items-center justify-center rounded-full transition-colors hover:bg-alert-soft disabled:opacity-60",
        className,
      )}
    >
      <Heart
        className={cn("size-5", isFavourite ? "fill-alert text-alert" : "text-ink-muted")}
        aria-hidden
      />
    </button>
  );
}
