
'use server';

import { collection, addDoc, Timestamp, doc, updateDoc } from 'firebase/firestore';
import { headers } from 'next/headers';
import { db } from '@/lib/firebase';
import type { CartItem, Order, UserDetails } from '@/lib/types';
import { performFraudCheck } from '@/ai/flows/order-fraud-check';
import { revalidatePath } from 'next/cache';

export async function createOrder(userDetails: UserDetails, cart: CartItem[], total: number) {
  try {
    const headersList = headers();
    // Use 'x-forwarded-for' for production environments, fallback for local dev
    const ipAddress = headersList.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1';
    
    // 1. Create the initial order object with a pending analysis state
    const orderData: Omit<Order, 'id'> = {
      orderDate: Timestamp.now(),
      customer: {
        name: userDetails.name,
        email: userDetails.email,
        phone: userDetails.phone || 'N/A',
        ipAddress: ipAddress,
        location: 'N/A', // Address not collected in this flow
      },
      items: cart,
      total: total,
      status: 'Completed', // Assume demo payment is always successful
      paymentMethod: 'Demo Payment',
      aiAnalysis: {
        riskScore: -1, // -1 indicates "Pending Analysis"
        summary: 'Awaiting fraud analysis.',
        keyFactors: [],
      },
    };

    // 2. Save the order to Firestore to get a unique ID
    const docRef = await addDoc(collection(db, 'orders'), orderData);
    
    // 3. Immediately revalidate the admin orders page so the new order appears
    // This provides a great real-time experience for the admin
    revalidatePath('/admin/orders');

    // 4. Prepare the complete order data to return to the client
    // We convert the Firestore Timestamp to a standard Date object for client-side use
    const newOrder: Order = { 
        ...orderData, 
        id: docRef.id, 
        orderDate: orderData.orderDate.toDate() 
    };

    // 5. Return a success response with the new order details
    return {
        success: true,
        order: newOrder,
    };

  } catch (error) {
    console.error("Error creating order: ", error);
    // Provide a generic but helpful error message
    return { success: false, error: 'Failed to save the order to the database. Please try again.' };
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
