"use client";

import { useEffect, useState, useMemo } from "react";
import type { Product, ProductVariant } from "@/lib/types";
import { useWishlist } from "@/hooks/useWishlist";
import { Button } from "@/components/ui/button";
import { Heart, ShoppingBag, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

const BROWSING_HISTORY_KEY = "chromashop_browsing_history";
const MAX_HISTORY_LENGTH = 10;

const VariationSelector = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <div>
    <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
      {label}
    </h3>
    <div className="flex flex-wrap items-center gap-2 mt-2">{children}</div>
  </div>
);

export default function ProductDetailsClient({ product }: { product: Product }) {
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const [selectedColor, setSelectedColor] = useState<string | null>(
    product.colors?.[0] || null
  );
  const [selectedSize, setSelectedSize] = useState<string | null>(
    product.sizes?.[0] || null
  );
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    product.variants?.[0] || null
  );

  const isWishlisted = isInWishlist(product.id);

  const handleWishlistToggle = () => {
    if (isWishlisted) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product.id);
    }
  };

  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem(BROWSING_HISTORY_KEY);
      let history: string[] = storedHistory ? JSON.parse(storedHistory) : [];

      history = history.filter((id) => id !== product.id);
      history.unshift(product.id);

      if (history.length > MAX_HISTORY_LENGTH) {
        history = history.slice(0, MAX_HISTORY_LENGTH);
      }

      localStorage.setItem(BROWSING_HISTORY_KEY, JSON.stringify(history));
    } catch (error) {
      console.error("Failed to update browsing history", error);
    }
  }, [product.id]);

  const finalPrice = useMemo(() => {
    return product.price + (selectedVariant?.priceModifier || 0);
  }, [product.price, selectedVariant]);

  return (
    <div className="flex flex-col h-full space-y-8">
      <div className="space-y-4 text-center md:text-left">
        <p className="text-primary font-semibold tracking-wider uppercase">
          {product.category}
        </p>
        <h1 className="text-4xl md:text-5xl font-bold font-headline tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-foreground to-muted-foreground">
          {product.name}
        </h1>
        <p className="text-3xl font-semibold text-primary">
          ${finalPrice.toFixed(2)}
        </p>
        <p className="text-muted-foreground text-lg leading-relaxed pt-4">
          {product.description}
        </p>
      </div>

      <Separator />

      <div className="space-y-6">
        {product.colors && product.colors.length > 0 && (
          <VariationSelector label="Color">
            {product.colors.map((color) => (
              <button
                key={color}
                onClick={() => setSelectedColor(color)}
                className={cn(
                  "h-8 w-8 rounded-full border-2 transition-transform duration-200 active:scale-90",
                  selectedColor === color
                    ? "border-primary scale-110 shadow-lg"
                    : "border-border hover:scale-110"
                )}
                style={{ backgroundColor: color }}
                aria-label={`Select color ${color}`}
              >
                {selectedColor === color && (
                  <Check className="h-5 w-5 text-white mix-blend-difference" />
                )}
              </button>
            ))}
          </VariationSelector>
        )}

        {product.sizes && product.sizes.length > 0 && (
          <VariationSelector label="Size">
            {product.sizes.map((size) => (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                className={cn(
                  "px-4 py-2 rounded-md border text-sm font-medium transition-all duration-200 active:scale-95",
                  selectedSize === size
                    ? "bg-primary text-primary-foreground border-transparent shadow-md"
                    : "bg-transparent hover:border-primary"
                )}
              >
                {size}
              </button>
            ))}
          </VariationSelector>
        )}

        {product.variants && product.variants.length > 0 && (
          <VariationSelector label="Variant">
            {product.variants.map((variant) => (
              <button
                key={variant.name}
                onClick={() => setSelectedVariant(variant)}
                className={cn(
                  "px-4 py-2 rounded-md border text-sm font-medium transition-all duration-200 active:scale-95",
                  selectedVariant?.name === variant.name
                    ? "bg-primary text-primary-foreground border-transparent shadow-md"
                    : "bg-transparent hover:border-primary"
                )}
              >
                {variant.name}
                {variant.priceModifier && variant.priceModifier > 0
                  ? ` (+$${variant.priceModifier})`
                  : ""}
              </button>
            ))}
          </VariationSelector>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-4 pt-4">
        <Button
          size="lg"
          className="flex-1 font-bold text-lg transition-all duration-300 active:scale-95 hover:shadow-lg hover:shadow-primary/30 hover:-translate-y-1"
        >
          <ShoppingBag className="mr-2 h-5 w-5" /> Add to Bag
        </Button>
        <Button
          size="lg"
          variant="outline"
          className="flex-1 font-bold text-lg transition-all duration-300 active:scale-95 hover:shadow-lg hover:border-primary group"
          onClick={handleWishlistToggle}
        >
          <Heart
            className={cn(
              "mr-2 h-5 w-5 transition-all group-hover:fill-red-500 group-hover:text-red-500",
              isWishlisted && "fill-red-500 text-red-500"
            )}
          />
          {isWishlisted ? "In Wishlist" : "Add to Wishlist"}
        </Button>
      </div>
    </div>
  );
}
