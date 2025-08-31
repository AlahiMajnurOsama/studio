
'use server';

import type { CartItem, Order, UserDetails } from '@/lib/types';

// Mock function to simulate creating an order
export async function createOrder(userDetails: UserDetails, cart: CartItem[], total: number) {
  try {
    // In a real app, you would save this to a database.
    // Here, we're just logging it and returning a mock success response.
    console.log("--- MOCK ORDER CREATED ---");
    console.log("User Details:", userDetails);
    console.log("Total:", total);
    console.log("Cart Items:", cart.length);
    
    // Create a mock order object to return
    const newOrder: Order = {
      id: `mock_${new Date().getTime()}`,
      orderDate: new Date(),
      customer: {
        ...userDetails,
        ipAddress: '127.0.0.1',
        location: 'Mock Location',
      },
      items: cart,
      total: total,
      status: 'Completed',
      paymentMethod: 'Demo Payment',
    };

    return {
        success: true,
        order: newOrder,
    };

  } catch (error) {
    console.error("Error creating mock order: ", error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return { success: false, error: `Failed to create mock order. Details: ${errorMessage}` };
  }
}
