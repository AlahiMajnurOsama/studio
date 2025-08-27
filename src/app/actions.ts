
'use server';

import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { headers } from 'next/headers';
import { db } from '@/lib/firebase';
import type { CartItem, Order, UserDetails } from '@/lib/types';
import { revalidatePath } from 'next/cache';

export async function createOrder(userDetails: UserDetails, cart: CartItem[], total: number) {
  try {
    const headersList = headers();
    const ipAddress = headersList.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1';
    
    // Sanitize cart items for Firestore
    const sanitizedCartItems = cart.map(item => {
       // Create a simplified product object for Firestore
      const simplifiedProduct = {
          id: item.product.id,
          name: item.product.name,
          price: item.product.price,
          image: item.product.image,
          category: item.product.category || 'N/A',
      };
      
      // Calculate final item price including variants
      const itemPrice = item.product.price + (item.selectedVariant?.priceModifier || 0);

      return {
          id: item.id,
          product: simplifiedProduct,
          quantity: item.quantity,
          pricePerItem: itemPrice, // Store the final price per item
          selectedColor: item.selectedColor?.color || null,
          selectedSize: item.selectedSize || null,
          selectedVariant: item.selectedVariant?.name || null,
      };
    });

    // Create the initial order object
    const orderData: Omit<Order, 'id' | 'orderDate'> & { orderDate: Timestamp } = {
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

    // Return a plain object that is compatible with the client
    const newOrder: Order = { 
        ...orderData, 
        id: docRef.id, 
        // Convert Timestamp to a serializable Date for the client
        orderDate: orderData.orderDate.toDate() 
    };

    return {
        success: true,
        order: newOrder,
    };

  } catch (error) {
    console.error("Error creating order: ", error);
    // Ensure the error message is a string
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return { success: false, error: `Failed to save the order to the database. Please try again. Details: ${errorMessage}` };
  }
}
