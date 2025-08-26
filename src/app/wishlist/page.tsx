"use client";

import { useWishlist } from "@/hooks/useWishlist";
import { products } from "@/lib/data";
import ProductCard from "@/components/ProductCard";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function WishlistPage() {
  const { wishlist } = useWishlist();
  const wishlistedProducts = products.filter((p) => wishlist.includes(p.id));

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold font-headline mb-8 tracking-tight">Your Wishlist</h1>
      {wishlistedProducts.length > 0 ? (
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
