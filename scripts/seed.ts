import 'dotenv/config';
import { initAdmin } from '../src/lib/firebase-admin';
import { products, coupons } from '../src/lib/data';
import { getFirestore } from 'firebase-admin/firestore';

async function seedDatabase() {
  const adminApp = initAdmin();
  const db = getFirestore(adminApp);

  console.log('Seeding products...');
  const productsCollection = db.collection('products');
  for (const product of products) {
    await productsCollection.doc(product.id).set(product);
  }
  console.log('Products seeded successfully!');

  console.log('Seeding coupons...');
  const couponsCollection = db.collection('coupons');
  for (const coupon of coupons) {
    await couponsCollection.doc(coupon.code).set(coupon);
  }
  console.log('Coupons seeded successfully!');

  console.log('Database seeding complete!');
  process.exit(0);
}

seedDatabase().catch((error) => {
  console.error('Error seeding database:', error);
  process.exit(1);
});
