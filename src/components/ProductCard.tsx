"use client";

import Link from "next/link";
import Image from "next/image";
import type { Product } from "@/lib/types";
import { useWishlist } from "@/hooks/useWishlist";
import { Button } from "./ui/button";
import { Heart, ShoppingBag } from "lucide-react";
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
      <Card className="h-full flex flex-col overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
        <CardHeader className="p-0 relative">
          <Image
            src={product.image}
            alt={product.name}
            width={600}
            height={400}
            className="w-full h-48 object-cover"
            data-ai-hint={`${product.category} product`}
          />
           <Button
            size="icon"
            variant="secondary"
            className="absolute top-3 right-3 h-9 w-9 rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100 active:scale-90"
            onClick={handleWishlistToggle}
            aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart className={cn("h-5 w-5", isWishlisted ? "fill-red-500 text-red-500" : "text-foreground")} />
          </Button>
        </CardHeader>
        <CardContent className="p-4 flex-grow flex flex-col">
          <p className="text-sm text-muted-foreground mb-1">{product.category}</p>
          <h3 className="text-lg font-medium tracking-tight leading-snug font-headline flex-grow">
            {product.name}
          </h3>
        </CardContent>
        <CardFooter className="p-4 pt-0 flex-col items-start">
          <p className="text-xl font-semibold mb-3">${product.price.toFixed(2)}</p>
          <Button 
            variant="outline" 
            className="w-full transition-colors duration-300 hover:bg-primary hover:text-primary-foreground"
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
