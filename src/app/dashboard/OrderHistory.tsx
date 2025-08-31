
"use client";

import { useEffect, useState } from "react";
import type { Order } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import OrderCard from "@/app/admin/orders/OrderCard";
import { products as allProducts } from "@/lib/data";

interface OrderHistoryProps {
  userEmail: string;
}

const generateMockOrdersForUser = (userEmail: string): Order[] => {
    const getRandomItems = () => {
        const numItems = Math.floor(Math.random() * 2) + 1;
        const shuffled = [...allProducts].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, numItems).map(product => ({
            id: product.id,
            product,
            quantity: Math.floor(Math.random() * 2) + 1,
            pricePerItem: product.price,
        }));
    };

    const mockOrder: Omit<Order, 'id'> = {
        orderDate: new Date('2024-05-20T10:30:00Z'),
        customer: { name: 'Demo User', email: userEmail, phone: '123-456-7890', ipAddress: '192.168.1.1', location: 'Your Location' },
        items: getRandomItems(),
        total: 150.99, 
        status: 'Completed', 
        paymentMethod: 'Credit Card',
    };
    
    const total = mockOrder.items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    
    return [{
        ...mockOrder,
        id: `mock_user_order_1`,
        total,
    }];
};

export default function OrderHistory({ userEmail }: OrderHistoryProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchOrders = () => {
      if (!userEmail) return;

      setLoading(true);
      try {
        // Simulate API call
        setTimeout(() => {
          const ordersData = generateMockOrdersForUser(userEmail);
          setOrders(ordersData);
          setLoading(false);
        }, 500);
      } catch (error) {
        console.error("Error fetching user orders: ", error);
        toast({
          title: "Error",
          description: "Failed to fetch your order history.",
          variant: "destructive",
        });
        setLoading(false);
      }
    };

    fetchOrders();
  }, [userEmail, toast]);

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }
  
  if(orders.length === 0) {
    return (
         <div className="text-center py-16 border-2 border-dashed rounded-lg">
            <h2 className="text-2xl font-semibold mb-2">No Orders Found</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              You haven't placed any orders yet. Once you do, they will appear here.
            </p>
        </div>
    )
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <OrderCard key={order.id} order={order} />
      ))}
    </div>
  );
}
