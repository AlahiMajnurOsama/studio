import { getFirestore, collection, getDocs, doc, getDoc, query, where, limit } from 'firebase/firestore';
import { db } from './firebase';
import type { Product, Coupon } from './types';

export async function getProducts(options: {
  search?: string;
  sort?: string;
  priceRange?: [number, number];
  categories?: string[];
} = {}): Promise<Product[]> {
  const { search = '', sort = 'popularity-desc', priceRange = [0, 1000], categories = [] } = options;

  let q = query(collection(db, 'products'));

  if (categories.length > 0) {
    q = query(q, where('category', 'in', categories));
  }

  if (priceRange[0] > 0) {
    q = query(q, where('price', '>=', priceRange[0]));
  }

  if (priceRange[1] < 1000) {
    q = query(q, where('price', '<=', priceRange[1]));
  }

  // Firestore does not support full-text search, so we'll have to do this on the client side.
  // We'll also do the sorting on the client side, as Firestore requires a composite index for sorting by multiple fields.

  const productsSnapshot = await getDocs(q);
  let products = productsSnapshot.docs.map((doc) => doc.data() as Product);

  if (search) {
    const searchLower = search.toLowerCase();
    products = products.filter(
      (product) =>
        product.name.toLowerCase().includes(searchLower) ||
        product.description.toLowerCase().includes(searchLower)
    );
  }

  products.sort((a, b) => {
    switch (sort) {
      case 'price-asc':
        return a.price - b.price;
      case 'price-desc':
        return b.price - a.price;
      case 'popularity-desc':
        return b.popularity - a.popularity;
      default:
        return 0;
    }
  });

  return products;
}

export async function getProductById(productId: string): Promise<Product | null> {
  const productDoc = doc(db, 'products', productId);
  const productSnapshot = await getDoc(productDoc);
  return productSnapshot.exists() ? (productSnapshot.data() as Product) : null;
}

export async function getProductsByCategory(category: string, limitCount: number = 4): Promise<Product[]> {
    const productsCollection = collection(db, 'products');
    const q = query(productsCollection, where('category', '==', category), limit(limitCount));
    const productsSnapshot = await getDocs(q);
    return productsSnapshot.docs.map((doc) => doc.data() as Product);
}

export async function getCoupons(): Promise<Coupon[]> {
  const couponsCollection = collection(db, 'coupons');
  const couponsSnapshot = await getDocs(couponsCollection);
  return couponsSnapshot.docs.map((doc) => doc.data() as Coupon);
}
