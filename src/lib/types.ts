export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: 'Health & Beauty' | 'Electronics' | 'Fashion' | 'Home & Living' | 'Groceries';
  colors: string[]; // hex codes
  popularity: number; // 0-100
};
