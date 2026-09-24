import { Package } from "lucide-react";
import Image from "next/image";
import { CATEGORY_ICONS } from "@/components/ui/icons";
import type { ProductCategory } from "@/lib/types";
import { cn } from "@/lib/utils";

/** The product photo when there is one, otherwise the category mark on the brand tint. */
export function ProductImage({
  imageUrl,
  category,
  name,
  muted = false,
  className,
  iconClassName = "size-10",
}: {
  imageUrl: string | null;
  category?: ProductCategory;
  name: string;
  muted?: boolean;
  className?: string;
  iconClassName?: string;
}) {
  const Icon = category ? CATEGORY_ICONS[category] : Package;
  return (
    <div
      className={cn(
        "relative flex items-center justify-center overflow-hidden rounded-field",
        muted ? "bg-canvas text-ink-faint" : "bg-sky text-leash",
        className,
      )}
    >
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={name}
          fill
          unoptimized
          sizes="(min-width: 1024px) 240px, 50vw"
          className={cn("object-cover", muted && "opacity-60 grayscale")}
        />
      ) : (
        <Icon className={iconClassName} aria-hidden />
      )}
    </div>
  );
}
