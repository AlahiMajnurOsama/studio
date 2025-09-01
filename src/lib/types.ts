

export type ProductVariant = {
  name: string;
  priceModifier?: number;
  sizes?: string[];
};

export type Product = {
  id: string;
  name:string;
  description: string;
  price: number;
  image: string; // Main/default image
  category?: 'Health & Beauty' | 'Electronics' | 'Fashion' | 'Home & Living' | 'Groceries';
  sizes?: string[];
  variants?: ProductVariant[];
  popularity: number; // 0-100
};

export type CartItem = {
  id: string; // A unique ID for the cart item, e.g., `${product.id}-${color}-${size}`
  product: Product;
  quantity: number;
  selectedColor?: null;
  selectedSize?: string | null;
  selectedVariant?: ProductVariant | null;
  pricePerItem: number;
};

export type UserDetails = {
  name: string;
  email: string;
  phone: string | null;
};

export type OrderStatus = 'Pending' | 'Processing' | 'Completed' | 'Cancelled';

export type Coupon = {
  code: string; // e.g., "SUMMER20"
  type: 'percentage' | 'fixed';
  value: number;
  scope: 'product' | 'order';
  productId?: string; // only if scope is 'product'
  minSpend?: number;
  description: string;
  isActive: boolean;
};


export type Order = {
  id: string;
  orderDate: Date;
  customer: {
    name: string;
    email: string;
    phone: string;
    ipAddress: string;
    location: string;
  };
  items: CartItem[];
  total: number;
  status: OrderStatus;
  paymentMethod: string;
  appliedCoupon?: {
    code: string;
    discountAmount: number;
  };
};

