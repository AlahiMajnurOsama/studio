
'use server';

import type { CartItem, Order, UserDetails, Coupon } from '@/lib/types';

type CreateOrderData = UserDetails & {
  cart: CartItem[];
  total: number;
  appliedCoupon?: {
    code: string;
    discountAmount: number;
  };
};

// Mock function to simulate creating an order
export async function createOrder(data: CreateOrderData) {
  try {
    // In a real app, you would save this to a database.
    // Here, we're just logging it and returning a mock success response.
    console.log("--- MOCK ORDER CREATED ---");
    console.log("User Details:", { name: data.name, email: data.email, phone: data.phone });
    console.log("Total:", data.total);
    console.log("Cart Items:", data.cart.length);
    if(data.appliedCoupon) {
        console.log("Applied Coupon:", data.appliedCoupon);
    }
    
    // Create a mock order object to return
    const newOrder: Order = {
      id: `mock_${new Date().getTime()}`,
      orderDate: new Date(),
      customer: {
        name: data.name,
        email: data.email,
        phone: data.phone || '',
        ipAddress: '127.0.0.1',
        location: 'Mock Location',
      },
      items: data.cart,
      total: data.total,
      status: 'Completed',
      paymentMethod: 'Demo Payment',
      appliedCoupon: data.appliedCoupon,
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
