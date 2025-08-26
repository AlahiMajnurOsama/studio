"use client";

import { useEffect } from "react";
import type { Product } from "@/lib/types";
import { useWishlist } from "@/hooks/useWishlist";
import { Button } from "@/components/ui/button";
import { Heart, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";

const BROWSING_HISTORY_KEY = "chromashop_browsing_history";
const MAX_HISTORY_LENGTH = 10;

export default function ProductDetailsClient({ product }: { product: Product }) {
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
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
      
      // Remove existing entry to move it to the front
      history = history.filter(id => id !== product.id);
      
      // Add new product ID to the front
      history.unshift(product.id);

      // Trim history to max length
      if (history.length > MAX_HISTORY_LENGTH) {
        history = history.slice(0, MAX_HISTORY_LENGTH);
      }
      
      localStorage.setItem(BROWSING_HISTORY_KEY, JSON.stringify(history));
    } catch (error) {
      console.error("Failed to update browsing history", error);
    }
  }, [product.id]);

  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <Button size="lg" className="flex-1 transition-all duration-300 active:scale-95 hover:shadow-lg hover:shadow-primary/30">
        <ShoppingBag className="mr-2 h-5 w-5" /> Add to Bag
      </Button>
      <Button
        size="lg"
        variant="outline"
        className="flex-1 transition-all duration-300 active:scale-95 hover:shadow-lg"
        onClick={handleWishlistToggle}
      >
        <Heart className={cn("mr-2 h-5 w-5 transition-all", isWishlisted && "fill-red-500 text-red-500")} />
        {isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
      </Button>
    </div>
  );
}
