
"use client";

import { useEffect, useState, useMemo } from "react";
import type { Product } from "@/lib/types";
import { products as localProducts } from "@/lib/data";
import ProductCard from "@/components/ProductCard";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { X, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useAppContext } from "@/context/AppContext";
import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
  const {
    search,
    sort,
    setSort,
    priceRange,
    setPriceRange,
    selectedCategories,
    toggleCategory,
    clearFilters,
  } = useAppContext();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching data
    setTimeout(() => {
        setProducts(localProducts);
        setLoading(false);
    }, 500);
  }, []);

  const allCategories = useMemo(() => Array.from(new Set(products.map((p) => p.category))), [products]);

  const filteredProducts = useMemo(() => {
    return products
      .filter((product) => {
        const searchLower = search.toLowerCase();
        const nameMatch = product.name.toLowerCase().includes(searchLower);
        const descriptionMatch = product.description
          .toLowerCase()
          .includes(searchLower);
        const priceMatch =
          product.price >= priceRange[0] && product.price <= priceRange[1];
        const categoryMatch =
          selectedCategories.length === 0 ||
          selectedCategories.includes(product.category);

        return (
          (nameMatch || descriptionMatch) && priceMatch && categoryMatch
        );
      })
      .sort((a, b) => {
        switch (sort) {
          case "price-asc":
            return a.price - b.price;
          case "price-desc":
            return b.price - a.price;
          case "popularity-desc":
            return b.popularity - a.popularity;
          default:
            return 0;
        }
      });
  }, [search, sort, priceRange, selectedCategories, products]);

  const heroBanners = [
    {
      id: 1,
      image: "https://picsum.photos/seed/hero1/1200/400",
      title: "Elevate Your Tech",
      subtitle: "Discover the latest in smart devices and accessories.",
      hint: "modern electronics",
    },
    {
      id: 2,
      image: "https://picsum.photos/seed/hero2/1200/400",
      title: "Refresh Your Wardrobe",
      subtitle: "Shop the new season's trends in fashion.",
      hint: "stylish clothing",
    },
    {
      id: 3,
      image: "https://picsum.photos/seed/hero3/1200/400",
      title: "Create Your Sanctuary",
      subtitle: "Find beautiful decor for your home and living space.",
      hint: "cozy home",
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <section className="mb-12">
        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent>
            {heroBanners.map((banner) => (
              <CarouselItem key={banner.id}>
                <div className="relative h-56 md:h-72 lg:h-96 w-full rounded-lg overflow-hidden">
                  <Image
                    src={banner.image}
                    alt={banner.title}
                    fill
                    className="object-cover"
                    data-ai-hint={banner.hint}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-0 left-0 p-6 md:p-10 text-white">
                    <h2 className="text-3xl md:text-5xl font-bold font-headline tracking-tight">
                      {banner.title}
                    </h2>
                    <p className="mt-2 text-lg md:text-xl max-w-lg">
                      {banner.subtitle}
                    </p>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 z-10 hidden sm:flex" />
          <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 z-10 hidden sm:flex" />
        </Carousel>
      </section>

      <section className="mb-12">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold font-headline">Shop by Category</h2>
          <Link
            href="#all-products"
            className="text-sm font-medium text-primary hover:underline flex items-center gap-1"
          >
            View All <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {loading ? (
             Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)
          ) : (
            allCategories.map((category) => (
              <button
                key={category}
                onClick={() => toggleCategory(category)}
                className={`p-4 rounded-lg text-center font-semibold transition-all duration-300 border-2 active:scale-95 ${
                  selectedCategories.includes(category)
                    ? 'bg-primary/10 border-primary text-primary shadow-lg shadow-primary/10'
                    : 'bg-card hover:shadow-md hover:-translate-y-1 border-transparent'
                }`}
              >
                {category}
              </button>
            ))
          )}
        </div>
      </section>

      <div className="flex flex-col md:flex-row gap-8" id="all-products">
        <aside className="w-full md:w-1/4 lg:w-1/5">
          <div className="sticky top-24 space-y-6">
            <h2 className="text-2xl font-headline font-bold">Filters</h2>

            <div>
              <Label htmlFor="price-range" className="font-medium">
                Price Range
              </Label>
              <div className="flex items-center justify-between text-sm mt-2">
                <span>${priceRange[0]}</span>
                <span>${priceRange[1]}</span>
              </div>
              <Slider
                id="price-range"
                min={0}
                max={1000}
                step={10}
                value={priceRange}
                onValueChange={(value) => setPriceRange(value as [number, number])}
                className="mt-2"
              />
            </div>

             <div>
              <Label className="font-medium">Sort by</Label>
               <Select value={sort} onValueChange={setSort}>
                <SelectTrigger className="w-full mt-2">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="popularity-desc">Popularity</SelectItem>
                  <SelectItem value="price-asc">
                    Price: Low to High
                  </SelectItem>
                  <SelectItem value="price-desc">
                    Price: High to Low
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              variant="ghost"
              onClick={clearFilters}
              className="w-full justify-start"
            >
              <X className="mr-2 h-4 w-4" /> Clear All Filters
            </Button>
          </div>
        </aside>

        <main className="w-full md:w-3/4 lg:w-4/5">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mb-6">
            <p className="text-sm text-muted-foreground">
              Showing {filteredProducts.length} of {products.length} products
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-96 w-full" />)
            ) : (
              filteredProducts.map((product, index) => (
                <ProductCard key={`${product.id}-${index}`} product={product} />
              ))
            )}
          </div>
          {!loading && filteredProducts.length === 0 && (
            <div className="text-center py-12 col-span-full">
              <p className="text-muted-foreground">
                No products found. Try adjusting your filters!
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
