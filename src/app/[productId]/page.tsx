import { products } from "@/lib/data";
import { notFound } from "next/navigation";
import Image from "next/image";
import ProductDetailsClient from "./ProductDetailsClient";

export default function ProductDetailsPage({
  params,
}: {
  params: { productId: string };
}) {
  const product = products.find((p) => p.id === params.productId);

  if (!product) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="grid md:grid-cols-2 gap-12 items-start">
        <div className="bg-card rounded-lg overflow-hidden">
          <Image
            src={product.image}
            alt={product.name}
            width={800}
            height={600}
            className="w-full h-auto object-cover"
            data-ai-hint={`${product.category} product`}
          />
        </div>
        <div>
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
                  className="w-8 h-8 rounded-full border-2 border-border"
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          </div>
          
          <ProductDetailsClient product={product} />

        </div>
      </div>
    </div>
  );
}

export function generateStaticParams() {
    return products.map((product) => ({
        productId: product.id,
    }));
}
