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
    <div className="container mx-auto px-4 py-12">
      <div className="grid md:grid-cols-2 gap-12 items-start">
        <div className="bg-card rounded-lg overflow-hidden shadow-lg">
          <Image
            src={product.image}
            alt={product.name}
            width={800}
            height={600}
            className="w-full h-auto object-cover"
            data-ai-hint={`${product.category} product`}
          />
        </div>
        <div className="flex flex-col h-full">
          <div className="flex-grow">
            <p className="text-primary font-semibold mb-2">{product.category}</p>
            <h1 className="text-4xl md:text-5xl font-bold font-headline mb-4 tracking-tight">
              {product.name}
            </h1>
            <p className="text-3xl font-semibold text-primary mb-6">
              ${product.price.toFixed(2)}
            </p>
            <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
              {product.description}
            </p>
            <div className="flex items-center gap-4 mb-8">
              <span className="text-sm font-medium">Colors:</span>
              <div className="flex gap-2">
                {product.colors.map((color) => (
                  <div
                    key={color}
                    className="w-8 h-8 rounded-full border-2 border-border shadow-inner"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>
          </div>
          
          <ProductDetailsClient product={product} />

        </div>
      </div>
      
      {relatedProducts.length > 0 && (
        <div className="mt-20 pt-10 border-t">
          <h2 className="text-3xl font-bold text-center mb-8 font-headline">
            Related Products
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
