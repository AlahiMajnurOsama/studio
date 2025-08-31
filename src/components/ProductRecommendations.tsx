
"use client";

import { useEffect, useState } from "react";
import ProductCard from "./ProductCard";
import type { Product } from "@/lib/types";
import { Loader } from "./ui/loader";

const BROWSING_HISTORY_KEY = "chromashop_browsing_history";

export default function ProductRecommendations({ allProducts }: { allProducts: Product[] }) {
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [browsingHistory, setBrowsingHistory] = useState<string[]>([]);

  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem(BROWSING_HISTORY_KEY);
      const history = storedHistory ? JSON.parse(storedHistory) : [];
      setBrowsingHistory(history);
    } catch (error) {
      console.error("Failed to get browsing history", error);
    }
  }, []);
  
  // This is a mock recommendation logic.
  // In a real app, you would fetch this from an AI service.
  useEffect(() => {
    if (browsingHistory.length === 0 || allProducts.length === 0) {
      return;
    }
    
    setLoading(true);
    setTimeout(() => {
      const recommendedProducts = allProducts
        .filter(p => !browsingHistory.includes(p.id)) // Exclude viewed items
        .sort(() => 0.5 - Math.random()) // Shuffle
        .slice(0, 4);
      setRecommendations(recommendedProducts);
      setLoading(false);
    }, 700);
  }, [browsingHistory, allProducts]);

  if (loading) {
    return (
      <section className="mt-16">
        <h2 className="text-3xl font-bold text-center mb-8 font-headline">
          Recommended For You
        </h2>
        <div className="flex justify-center items-center py-10">
          <Loader />
        </div>
      </section>
    );
  }

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <section className="mt-20 pt-10 border-t">
      <h2 className="text-3xl font-bold text-center mb-8 font-headline">
        Recommended For You
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {recommendations.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
