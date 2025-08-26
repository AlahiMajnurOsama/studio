import { collection, doc, getDoc, getDocs, query, where, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Product } from "@/lib/types";
import { notFound } from "next/navigation";
import ProductDetailsClient from "./ProductDetailsClient";
import ProductCard from "@/components/ProductCard";

export const dynamic = 'force-dynamic';

async function getProduct(productId: string): Promise<Product | null> {
  const docRef = doc(db, "products", productId);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { ...docSnap.data(), id: docSnap.id } as Product;
  }
  return null;
}

async function getRelatedProducts(product: Product): Promise<Product[]> {
    if (!product.category) return [];
    
    // Fetch 5 products of the same category
    const q = query(
        collection(db, "products"), 
        where("category", "==", product.category),
        limit(5)
    );
    
    const querySnapshot = await getDocs(q);
    
    // Filter out the current product from the results and take the first 4
    return querySnapshot.docs
        .map(doc => ({ ...doc.data(), id: doc.id }) as Product)
        .filter(p => p.id !== product.id)
        .slice(0, 4);
}


export default async function ProductDetailsPage({
  params,
}: {
  params: { productId: string };
}) {
  const product = await getProduct(params.productId);

  if (!product) {
    notFound();
  }
  
  const relatedProducts = await getRelatedProducts(product);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-12 animate-fade-in relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
            <div className="absolute w-[50vw] h-[50vw] rounded-full bg-primary/30 -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
            <div className="absolute w-[40vw] h-[40vw] rounded-full bg-red-500/30 top-full left-full -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
        </div>
        
        <ProductDetailsClient product={product} />

        {relatedProducts.length > 0 && (
          <div className="mt-24 pt-12 border-t border-white/10">
            <h2 className="text-3xl font-bold text-center mb-10 font-headline">
              You Might Also Like
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {relatedProducts.map((relatedProduct) => (
                <ProductCard key={relatedProduct.id} product={relatedProduct} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
