"use client";

import { useState, useMemo } from "react";
import type { Product } from "@/lib/types";
import { products } from "@/lib/data";
import ProductCard from "@/components/ProductCard";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Search, X, ChevronRight } from "lucide-react";
import ProductRecommendations from "@/components/ProductRecommendations";
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

const allColors = Array.from(new Set(products.flatMap((p) => p.colors)));
const allCategories = Array.from(new Set(products.map((p) => p.category)));

export default function Home() {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("popularity-desc");
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

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
        const colorMatch =
          selectedColors.length === 0 ||
          product.colors.some((color) => selectedColors.includes(color));
        const categoryMatch =
          selectedCategories.length === 0 ||
          selectedCategories.includes(product.category);

        return (
          (nameMatch || descriptionMatch) &&
          priceMatch &&
          colorMatch &&
          categoryMatch
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
  }, [search, sort, priceRange, selectedColors, selectedCategories]);

  const toggleColor = (color: string) => {
    setSelectedColors((prev) =>
      prev.includes(color)
        ? prev.filter((c) => c !== color)
        : [...prev, color]
    );
  };

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const clearFilters = () => {
    setPriceRange([0, 1000]);
    setSelectedColors([]);
    setSelectedCategories([]);
    setSearch("");
  };

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
          <Link href="#all-products" className="text-sm font-medium text-primary hover:underline flex items-center gap-1">
            View All <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {allCategories.map((category) => (
            <button
              key={category}
              onClick={() => toggleCategory(category)}
              className={`p-4 rounded-lg text-center font-semibold transition-all duration-300 border-2 ${
                selectedCategories.includes(category)
                  ? 'bg-primary/10 border-primary text-primary'
                  : 'bg-card hover:shadow-md hover:-translate-y-1 border-transparent'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </section>

      <div className="flex flex-col md:flex-row gap-8" id="all-products">
        <aside className="w-full md:w-1/4 lg:w-1/5">
          <div className="sticky top-24 space-y-6">
            <h2 className="text-2xl font-headline font-bold">Filters</h2>
            
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            <div>
              <Label htmlFor="price-range" className="font-medium">Price Range</Label>
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
                onValueChange={(value) => setPriceRange(value)}
                className="mt-2"
              />
            </div>
            
            <div>
              <h3 className="font-medium mb-2">Colors</h3>
              <div className="flex flex-wrap gap-2">
                {allColors.map((color) => (
                  <button
                    key={color}
                    onClick={() => toggleColor(color)}
                    className={`w-8 h-8 rounded-full border-2 transition-transform transform hover:scale-110 ${
                      selectedColors.includes(color)
                        ? "border-primary scale-110"
                        : "border-border"
                    }`}
                    style={{ backgroundColor: color }}
                    aria-label={`Filter by color ${color}`}
                  />
                ))}
              </div>
            </div>
            
            <Button variant="ghost" onClick={clearFilters} className="w-full justify-start">
              <X className="mr-2 h-4 w-4" /> Clear All Filters
            </Button>
          </div>
        </aside>

        <main className="w-full md:w-3/4 lg:w-4/5">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mb-6">
            <p className="text-sm text-muted-foreground">
              Showing {filteredProducts.length} of {products.length} products
            </p>
            <div className="w-full sm:w-auto">
              <Select value={sort} onValueChange={setSort}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="popularity-desc">Popularity</SelectItem>
                  <SelectItem value="price-asc">Price: Low to High</SelectItem>
                  <SelectItem value="price-desc">Price: High to Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          {filteredProducts.length === 0 && (
             <div className="text-center py-12 col-span-full">
               <p className="text-muted-foreground">No products found. Try adjusting your filters!</p>
             </div>
          )}
        </main>
      </div>

      <ProductRecommendations />
    </div>
  );
}
