
'use server';

import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { headers } from 'next/headers';
import { db } from '@/lib/firebase';
import type { CartItem, Order, UserDetails, Product } from '@/lib/types';
import { revalidatePath } from 'next/cache';

// This is a type guard to check if an object is a Product.
function isProduct(obj: any): obj is Product {
  return obj && typeof obj.id === 'string' && typeof obj.name === 'string' && typeof obj.price === 'number';
}

export async function createOrder(userDetails: UserDetails, cart: CartItem[], total: number) {
  try {
    const headersList = headers();
    const ipAddress = headersList.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1';
    
    // Sanitize cart items for Firestore
    const sanitizedCartItems = cart.map(item => {
      if (!isProduct(item.product)) {
          throw new Error(`Invalid product data in cart item: ${item.id}`);
      }
      return {
          ...item,
          product: {
              id: item.product.id,
              name: item.product.name,
              price: item.product.price,
              image: item.product.image,
              category: item.product.category || 'N/A',
          }
      };
    });

    // Create the initial order object
    const orderData: Omit<Order, 'id'> = {
      orderDate: Timestamp.now(),
      customer: {
        name: userDetails.name,
        email: userDetails.email,
        phone: userDetails.phone || 'N/A',
        ipAddress: ipAddress,
        location: 'N/A', 
      },
      items: sanitizedCartItems,
      total: total,
      status: 'Completed',
      paymentMethod: 'Demo Payment',
    };

    const docRef = await addDoc(collection(db, 'orders'), orderData);
    
    revalidatePath('/admin/orders');

    const newOrder: Order = { 
        ...orderData, 
        id: docRef.id, 
        orderDate: orderData.orderDate.toDate() 
    };

    return {
        success: true,
        order: newOrder,
    };

  } catch (error) {
    console.error("Error creating order: ", error);
    return { success: false, error: 'Failed to save the order to the database. Please try again.' };
  }
}
