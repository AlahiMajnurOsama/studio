import { products } from "@/lib/data";
import { notFound } from "next/navigation";
import Image from "next/image";
import ProductDetailsClient from "./ProductDetailsClient";
import ProductCard from "@/components/ProductCard";

export default function ProductDetailsPage({
  params,
}: {
  params: { productId: string };
}) {
  const product = products.find((p) => p.id === params.productId);

  if (!product) {
    notFound();
  }

  const relatedProducts = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  return (
    <div className="container mx-auto px-4 py-12 animate-fade-in">
      <div className="grid md:grid-cols-2 gap-12 items-start">
        <div className="bg-card rounded-xl overflow-hidden shadow-2xl group relative transition-all duration-500 hover:shadow-primary/20">
           <Image
            src={product.image}
            alt={product.name}
            width={800}
            height={600}
            className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
            data-ai-hint={`${product.category} product`}
          />
           <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </div>
        <div className="flex flex-col h-full space-y-8">
            <div className="space-y-4 text-center md:text-left">
              <p className="text-primary font-semibold tracking-wider uppercase">{product.category}</p>
              <h1 className="text-4xl md:text-5xl font-bold font-headline tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-foreground to-muted-foreground">
                {product.name}
              </h1>
              <p className="text-3xl font-semibold text-primary">
                ${product.price.toFixed(2)}
              </p>
              <p className="text-muted-foreground text-lg leading-relaxed pt-4">
                {product.description}
              </p>
            </div>
          
          <ProductDetailsClient product={product} />

        </div>
      </div>
      
      {relatedProducts.length > 0 && (
        <div className="mt-24 pt-12 border-t">
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
  );
}

export function generateStaticParams() {
    return products.map((product) => ({
        productId: product.id,
    }));
}
