
"use client";

import { useEffect, useState, useTransition } from "react";
import { useWishlist } from "@/hooks/useWishlist";
import { products as allProducts } from "@/lib/data";
import type { Product } from "@/lib/types";
import ProductCard from "@/components/ProductCard";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAppContext } from "@/context/AppContext";

export default function WishlistPage() {
  const { wishlist } = useWishlist();
  const [wishlistedProducts, setWishlistedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { setPageLoading } = useAppContext();
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setPageLoading(isPending);
  }, [isPending, setPageLoading]);
  
  useEffect(() => {
    const fetchWishlistedProducts = async () => {
      if (wishlist.length === 0) {
        setLoading(false);
        setWishlistedProducts([]);
        return;
      }

      setLoading(true);
      // Simulate API call
      setTimeout(() => {
        const productsData = allProducts.filter(p => wishlist.includes(p.id));
        setWishlistedProducts(productsData);
        setLoading(false);
      }, 300);
    };

    fetchWishlistedProducts();
  }, [wishlist]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold font-headline mb-8 tracking-tight">Your Wishlist</h1>
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-96 w-full" />)}
        </div>
      ) : wishlistedProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {wishlistedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
          <h2 className="text-2xl font-semibold mb-2">Your wishlist is empty</h2>
          <p className="text-muted-foreground mb-6">
            Looks like you haven't added anything yet.
          </p>
          <Button asChild className="transition-transform active:scale-95">
            <Link href="/">Start Exploring</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
