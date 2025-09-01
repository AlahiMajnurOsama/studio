import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, collection, doc, writeBatch, Timestamp } from "firebase/firestore";
import type { Order } from '../src/lib/types';
import { products } from '../src/lib/data';

// IMPORTANT: Make sure to paste your Firebase config object here
const firebaseConfig = {
  projectId: "chromashop-f88nq",
  appId: "1:725680619675:web:9a9de9b8f29ddb8cff063e",
  storageBucket: "chromashop-f88nq.appspot.com",
  apiKey: "AIzaSyA88NaKH9xnxElZcv2O1-QSpAkx1kfKQG0",
  authDomain: "chromashop-f88nq.firebaseapp.com",
  messagingSenderId: "725680619675"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

const getRandomItems = () => {
    const numItems = Math.floor(Math.random() * 3) + 1;
    const shuffled = [...products].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, numItems).map(product => ({
        id: product.id,
        product,
        quantity: Math.floor(Math.random() * 2) + 1,
    }));
}

const sampleOrders: Omit<Order, 'id'>[] = [
    {
        orderDate: Timestamp.fromDate(new Date('2024-05-20T10:30:00Z')),
        customer: {
            name: 'Alice Johnson',
            email: 'alice@example.com',
            phone: '123-456-7890',
            ipAddress: '192.168.1.1',
            location: 'New York, USA',
        },
        items: getRandomItems(),
        total: 285.49,
        status: 'Completed',
        paymentMethod: 'Credit Card',
    },
    {
        orderDate: Timestamp.fromDate(new Date('2024-05-21T14:00:00Z')),
        customer: {
            name: 'Bob Smith',
            email: 'bob@example.com',
            phone: '987-654-3210',
            ipAddress: '10.0.0.1',
            location: 'London, UK',
        },
        items: getRandomItems(),
        total: 120.00,
        status: 'Pending',
        paymentMethod: 'PayPal',
    },
     {
        orderDate: Timestamp.fromDate(new Date('2024-05-22T09:15:00Z')),
        customer: {
            name: 'Charlie Brown',
            email: 'charlie@example.com',
            phone: '555-123-4567',
            ipAddress: '172.16.0.1',
            location: 'Toronto, CA',
        },
        items: getRandomItems(),
        total: 499.98,
        status: 'Completed',
        paymentMethod: 'Credit Card',
    },
    {
        orderDate: Timestamp.fromDate(new Date('2024-05-23T18:45:00Z')),
        customer: {
            name: 'Diana Prince',
            email: 'diana@example.com',
            phone: '222-333-4444',
            ipAddress: '203.0.113.50',
            location: 'Paris, FR',
        },
        items: getRandomItems(),
        total: 89.99,
        status: 'Completed',
        paymentMethod: 'Apple Pay',
    }
];


async function uploadOrders() {
  const ordersCollection = collection(db, 'orders');
  const batch = writeBatch(db);

  sampleOrders.forEach((orderData) => {
    // Recalculate total based on random items
    const total = orderData.items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    const finalOrderData = { ...orderData, total };

    const docRef = doc(ordersCollection); // Auto-generate ID
    batch.set(docRef, finalOrderData);
  });

  try {
    await batch.commit();
    console.log('✅ Sample orders uploaded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error uploading orders:', error);
    process.exit(1);
  }
}

uploadOrders();
