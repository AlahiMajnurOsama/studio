
"use client";

import { useEffect, useState, useMemo } from "react";
import type { Product, ProductVariant } from "@/lib/types";
import { useWishlist } from "@/hooks/useWishlist";
import { Button } from "@/components/ui/button";
import { Heart, ShoppingBag, Check, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Particles from "@/components/Particles";
import { useCart } from "@/hooks/useCart";

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
    <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
      {label}
    </h3>
    <div className="flex flex-wrap items-center gap-3">{children}</div>
  </div>
);

export default function ProductDetailsClient({ product }: { product: Product }) {
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const [isAdded, setIsAdded] = useState(false);

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    product.variants?.[0] || null
  );

  const availableSizes = useMemo(() => {
    if (selectedVariant?.sizes && selectedVariant.sizes.length > 0) {
      return selectedVariant.sizes;
    }
    return product.sizes || [];
  }, [selectedVariant, product.sizes]);
  
  const [selectedSize, setSelectedSize] = useState<string | null>(
    availableSizes?.[0] || null
  );
  
  // Reset selected size when available sizes change
  useEffect(() => {
    setSelectedSize(availableSizes?.[0] || null);
  }, [availableSizes]);


  const isWishlisted = isInWishlist(product.id);

  const handleWishlistToggle = () => {
    if (isWishlisted) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product.id);
    }
  };

  const handleAddToCart = () => {
    addToCart(product, 1, null, selectedSize, selectedVariant);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
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
    <div className="grid lg:grid-cols-2 gap-12 items-center relative z-10">
        <div className="relative w-full h-[60vh] flex items-center justify-center">
            <div className="absolute inset-0 z-0">
            <Particles
                particleColors={['#9D4EDD', '#5A86FF']}
                particleCount={200}
                particleSpread={10}
                speed={0.1}
                particleBaseSize={100}
                moveParticlesOnHover={true}
                alphaParticles={false}
                disableRotation={false}
            />
        </div>
        <div className="relative w-[80%] aspect-square group transition-transform duration-500 hover:scale-105 z-10">
            <Image
                key={product.image}
                src={product.image}
                alt={product.name}
                fill
                className="object-contain drop-shadow-[0_25px_25px_rgba(0,0,0,0.5)] animate-fade-in"
                data-ai-hint={`${product.category} product`}
            />
        </div>
        </div>

        <div className="flex flex-col h-full space-y-6 relative">
        <div className="absolute -z-10 top-0 left-0 w-full h-full text-[12rem] font-black text-white/5 leading-none select-none break-all opacity-50">
            {product.name.toUpperCase().split(' ').join('')}
        </div>

        <div className="space-y-4">
            <p className="text-primary font-semibold tracking-widest uppercase text-sm">
            {product.category}
            </p>
            <h1 className="text-5xl md:text-6xl font-black font-headline tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white to-neutral-400">
            {product.name}
            </h1>
            <div className="flex items-center gap-4">
                <p className="text-4xl font-bold text-primary">${finalPrice.toFixed(2)}</p>
                <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-5 h-5 ${i < 4 ? 'text-yellow-400 fill-yellow-400' : 'text-neutral-600'}`} />
                    ))}
                    <span className="text-sm text-muted-foreground ml-2">(128 reviews)</span>
                </div>
            </div>
            <p className="text-neutral-300 text-lg leading-relaxed pt-4 max-w-prose">
            {product.description}
            </p>
        </div>

        <div className="space-y-6">
            {product.variants && product.variants.length > 0 && (
            <VariationSelector label="Variant">
                {product.variants.map((variant) => (
                <button
                    key={variant.name}
                    onClick={() => setSelectedVariant(variant)}
                    className={cn(
                    "px-4 py-2 rounded-md border text-sm font-bold transition-all duration-200 active:scale-95",
                    selectedVariant?.name === variant.name
                        ? "bg-primary text-primary-foreground border-transparent shadow-lg shadow-primary/30"
                        : "bg-neutral-800 border-neutral-700 hover:border-primary hover:bg-neutral-700"
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

            {availableSizes.length > 0 && (
                <VariationSelector label="Size">
                    {availableSizes.map((size) => (
                    <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={cn(
                        "px-4 py-2 rounded-md border text-sm font-bold transition-all duration-200 active:scale-95",
                        selectedSize === size
                            ? "bg-primary text-primary-foreground border-transparent shadow-lg shadow-primary/30"
                            : "bg-neutral-800 border-neutral-700 hover:border-primary hover:bg-neutral-700"
                        )}
                    >
                        {size}
                    </button>
                    ))}
                </VariationSelector>
            )}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button
            size="lg"
            className="flex-1 font-bold text-lg transition-all duration-300 active:scale-95 hover:shadow-lg hover:shadow-primary/30 hover:-translate-y-1 bg-gradient-to-br from-primary to-red-500 text-white"
            onClick={handleAddToCart}
            disabled={isAdded}
            >
            {isAdded ? (
                <>
                <Check className="mr-2 h-5 w-5" /> Added!
                </>
            ) : (
                <>
                <ShoppingBag className="mr-2 h-5 w-5" /> Add to Bag
                </>
            )}
            </Button>
            <Button
            size="lg"
            variant="outline"
            className="flex-1 font-bold text-lg transition-all duration-300 active:scale-95 hover:shadow-lg group bg-neutral-800/50 border-neutral-700 hover:bg-neutral-700 hover:border-primary"
            onClick={handleWishlistToggle}
            >
            <Heart
                className={cn(
                "mr-2 h-5 w-5 transition-all group-hover:fill-red-500 group-hover:text-red-500",
                isWishlisted ? "fill-red-500 text-red-500" : "text-neutral-400"
                )}
            />
            {isWishlisted ? "In Wishlist" : "Add to Wishlist"}
            </Button>
        </div>
        </div>
    </div>
  );
}
