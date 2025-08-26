"use client";

import { useEffect, useState } from "react";
import ProductCard from "./ProductCard";
import { products } from "@/lib/data";
import type { Product } from "@/lib/types";
import { getProductRecommendations } from "@/ai/flows/product-recommendations";
import { Loader } from "./ui/loader";

const BROWSING_HISTORY_KEY = "chromashop_browsing_history";

export default function ProductRecommendations() {
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [browsingHistory, setBrowsingHistory] = useState<string[]>([]);

  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem(BROWSING_HISTORY_KEY);
      const history = storedHistory ? JSON.parse(storedHistory) : [];
      setBrowsingHistory(history);
    } catch (error) {
      console.error("Failed to get browsing history", error);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (browsingHistory.length === 0) {
      setLoading(false);
      return;
    }

    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        const result = await getProductRecommendations({ browsingHistory });
        
        // Filter out products already in history and map IDs to full product objects
        const recommendedProducts = result.recommendations
          .filter(id => !browsingHistory.includes(id))
          .map(id => products.find(p => p.id === id))
          .filter((p): p is Product => p !== undefined)
          .slice(0, 4); // Show up to 4 recommendations

        setRecommendations(recommendedProducts);
      } catch (error) {
        console.error("Error fetching recommendations:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [browsingHistory]);

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
    return null; // Don't show the section if there are no recommendations
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
