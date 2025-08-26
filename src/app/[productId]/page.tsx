import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Product } from "@/lib/types";
import { notFound } from "next/navigation";
import Image from "next/image";
import ProductDetailsClient from "./ProductDetailsClient";
import ProductCard from "@/components/ProductCard";
import Particles from "@/components/Particles";

async function getProduct(productId: string): Promise<Product | null> {
  const docRef = doc(db, "products", productId);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return docSnap.data() as Product;
  }
  return null;
}

async function getProducts(): Promise<Product[]> {
    const querySnapshot = await getDocs(collection(db, "products"));
    return querySnapshot.docs.map(doc => doc.data() as Product);
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
  
  const allProducts = await getProducts();

  const relatedProducts = allProducts
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-12 animate-fade-in relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
            <div className="absolute w-[50vw] h-[50vw] rounded-full bg-primary/30 -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
            <div className="absolute w-[40vw] h-[40vw] rounded-full bg-red-500/30 top-full left-full -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
        </div>
        <div className="grid lg:grid-cols-2 gap-12 items-center relative z-10">
          <div className="relative w-full h-[60vh] flex items-center justify-center">
             <div className="absolute inset-0 z-0">
                <Particles
                    particleColors={['#9D4EDD', '#5A86FF']}
                    particleCount={200}
                    particleSpread={10}
                    speed={0.1}
                    particleBaseSize={100}
                    moveParticlesOnHover={true}
                    alphaParticles={false}
                    disableRotation={false}
                />
            </div>
            <div className="relative w-[80%] aspect-square group transition-transform duration-500 hover:scale-105 z-10">
              <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-contain drop-shadow-[0_25px_25px_rgba(0,0,0,0.5)]"
                  data-ai-hint={`${product.category} product`}
                />
            </div>
          </div>
          
          <ProductDetailsClient product={product} />

        </div>
        
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

export async function generateStaticParams() {
    const products = await getProducts();
    return products.map((product) => ({
        productId: product.id,
    }));
}
