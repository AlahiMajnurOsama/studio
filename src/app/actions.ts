'use server';

import { collection, addDoc, Timestamp, doc, updateDoc } from 'firebase/firestore';
import { headers } from 'next/headers';
import { db } from '@/lib/firebase';
import type { CartItem, Order } from '@/lib/types';
import { performFraudCheck } from '@/ai/flows/order-fraud-check';
import { revalidatePath } from 'next/cache';

interface GuestDetails {
  name: string;
  email: string;
  phone: string;
  address: string;
}

export async function createOrder(guestDetails: GuestDetails, cart: CartItem[], total: number) {
  try {
    const headersList = headers();
    const ipAddress = headersList.get('x-forwarded-for') || '127.0.0.1';
    
    // 1. Create the order object with pending AI analysis
    const orderData: Omit<Order, 'id'> = {
      orderDate: Timestamp.now(),
      customer: {
        name: guestDetails.name,
        email: guestDetails.email,
        phone: guestDetails.phone,
        ipAddress: ipAddress,
        location: guestDetails.address,
      },
      items: cart,
      total: total,
      status: 'Completed', // Assuming demo payment is always successful
      paymentMethod: 'Demo Payment',
      aiAnalysis: {
        riskScore: -1, // Use -1 to indicate "Pending Analysis"
        summary: 'Awaiting fraud analysis.',
        keyFactors: [],
      },
    };

    // 2. Save the order to Firestore
    const docRef = await addDoc(collection(db, 'orders'), orderData);

    // 3. Return the new order ID and the full order data
    return {
        success: true,
        orderId: docRef.id,
        order: { ...orderData, id: docRef.id, orderDate: new Date() } // Return with JS Date object
    };

  } catch (error) {
    console.error("Error creating order: ", error);
    return { success: false, error: 'Failed to create order.' };
  }
}


export async function analyzeOrderFraud(order: Order) {
  try {
     // 1. Perform AI Fraud Analysis
    const aiAnalysis = await performFraudCheck({
      customer: {
        name: order.customer.name,
        email: order.customer.email,
        phone: order.customer.phone,
        ipAddress: order.customer.ipAddress,
      },
      order: {
        total: order.total,
        itemCount: order.items.reduce((sum, item) => sum + item.quantity, 0),
      }
    });
    
    // 2. Update the order document in Firestore
    const orderRef = doc(db, 'orders', order.id);
    await updateDoc(orderRef, {
      aiAnalysis: aiAnalysis
    });
    
    // 3. Revalidate the path to refresh the data on the client
    revalidatePath('/admin/orders');

    return { success: true, aiAnalysis };

  } catch (error) {
    console.error("Error analyzing order fraud: ", error);
    return { success: false, error: 'Failed to analyze order.' };
  }
}
