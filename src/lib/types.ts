export type ProductVariant = {
  name: string;
  priceModifier?: number;
};

export type ColorVariant = {
  color: string; // hex code
  image: string; // URL
};

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string; // Main/default image
  category?: 'Health & Beauty' | 'Electronics' | 'Fashion' | 'Home & Living' | 'Groceries';
  colorVariants?: ColorVariant[];
  sizes?: string[];
  variants?: ProductVariant[];
  popularity: number; // 0-100
};

export type CartItem = {
  id: string; // A unique ID for the cart item, e.g., `${product.id}-${color}-${size}`
  product: Product;
  quantity: number;
  selectedColor?: ColorVariant | null;
  selectedSize?: string | null;
  selectedVariant?: ProductVariant | null;
};
