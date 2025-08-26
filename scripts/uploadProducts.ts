import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, collection, doc, setDoc, writeBatch } from "firebase/firestore";
import { products as localProducts } from '../src/lib/data';

// IMPORTANT: Make sure to paste your Firebase config object here
const firebaseConfig = {
  projectId: "chromashop-f88nq",
  appId: "1:725680619675:web:9a9de9b8f29ddb8cff063e",
  storageBucket: "chromashop-f88nq.firebasestorage.app",
  apiKey: "AIzaSyA88NaKH9xnxElZcv2O1-QSpAkx1kfKQG0",
  authDomain: "chromashop-f88nq.firebaseapp.com",
  measurementId: "",
  messagingSenderId: "725680619675"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

async function uploadProducts() {
  const productsCollection = collection(db, 'products');
  const batch = writeBatch(db);

  localProducts.forEach((product) => {
    const docRef = doc(productsCollection, product.id);
    batch.set(docRef, product);
  });

  try {
    await batch.commit();
    console.log('✅ Products uploaded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error uploading products:', error);
    process.exit(1);
  }
}

uploadProducts();
