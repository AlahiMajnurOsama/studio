export type ProductVariant = {
  name: string;
  priceModifier?: number;
};

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: 'Health & Beauty' | 'Electronics' | 'Fashion' | 'Home & Living' | 'Groceries';
  colors: string[]; // hex codes
  sizes?: string[];
  variants?: ProductVariant[];
  popularity: number; // 0-100
};
