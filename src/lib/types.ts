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
