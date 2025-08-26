"use client";

import Link from "next/link";
import Image from "next/image";
import type { Product } from "@/lib/types";
import { useWishlist } from "@/hooks/useWishlist";
import { Button } from "./ui/button";
import { Heart, ShoppingBag, Plus } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "./ui/card";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const isWishlisted = isInWishlist(product.id);

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isWishlisted) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product.id);
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // In a real app, you'd add logic here to add the item to the cart
    console.log(`Added ${product.name} to cart`);
  };

  return (
    <Link href={`/${product.id}`} className="group block">
      <Card className="h-full flex flex-col overflow-hidden transition-all duration-500 ease-in-out hover:shadow-2xl hover:-translate-y-2 hover:shadow-primary/10 border-transparent bg-card/50 backdrop-blur-sm">
        <CardHeader className="p-0 relative overflow-hidden">
          <Image
            src={product.image}
            alt={product.name}
            width={600}
            height={400}
            className="w-full h-48 object-cover transition-transform duration-500 ease-in-out group-hover:scale-110"
            data-ai-hint={`${product.category} product`}
          />
           <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
           <Button
            size="icon"
            variant="ghost"
            className="absolute top-3 right-3 h-9 w-9 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-all duration-300 scale-90 opacity-0 group-hover:opacity-100 group-hover:scale-100 active:scale-90"
            onClick={handleWishlistToggle}
            aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart className={cn("h-5 w-5", isWishlisted ? "fill-red-500 text-red-500" : "fill-white/80 text-white/80")} />
          </Button>
        </CardHeader>
        <CardContent className="p-4 flex-grow flex flex-col">
           <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-muted-foreground mb-1">{product.category}</p>
              <h3 className="text-lg font-medium tracking-tight leading-snug font-headline flex-grow group-hover:text-primary transition-colors duration-300">
                {product.name}
              </h3>
            </div>
            <p className="text-xl font-bold text-primary">${product.price.toFixed(2)}</p>
          </div>
        </CardContent>
        <CardFooter className="p-4 pt-0">
          <Button 
            variant="outline" 
            className="w-full transition-all duration-300 group-hover:bg-primary group-hover:text-primary-foreground group-hover:shadow-lg group-hover:shadow-primary/30"
            onClick={handleAddToCart}
          >
            <ShoppingBag className="mr-2 h-5 w-5" /> Add to Bag
          </Button>
        </CardFooter>
      </Card>
    </Link>
  );
};

export default ProductCard;
