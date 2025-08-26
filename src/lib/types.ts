export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: 'Lifestyle' | 'Tech' | 'Apparel' | 'Home';
  colors: string[]; // hex codes
  popularity: number; // 0-100
};
