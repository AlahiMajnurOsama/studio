
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import type { Order } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import OrderCard from "./OrderCard";
import { products as allProducts } from "@/lib/data";
import { useNavigation } from "@/hooks/useNavigation";


const generateMockOrders = (): Order[] => {
    const getRandomItems = () => {
        const numItems = Math.floor(Math.random() * 3) + 1;
        const shuffled = [...allProducts].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, numItems).map(product => ({
            id: product.id,
            product,
            quantity: Math.floor(Math.random() * 2) + 1,
            pricePerItem: product.price,
        }));
    };

    const mockOrders: Omit<Order, 'id'>[] = [
        {
            orderDate: new Date('2024-05-20T10:30:00Z'),
            customer: { name: 'Alice Johnson', email: 'alice@example.com', phone: '123-456-7890', ipAddress: '192.168.1.1', location: 'New York, USA' },
            items: getRandomItems(),
            total: 285.49, status: 'Completed', paymentMethod: 'Credit Card',
            aiAnalysis: { riskScore: 10, summary: 'Low risk. Verified customer with consistent purchase history.', keyFactors: ['Repeat customer', 'Standard shipping address', 'IP matches location'] },
        },
        {
            orderDate: new Date('2024-05-21T14:00:00Z'),
            customer: { name: 'Bob Smith', email: 'bob@example.com', phone: '987-654-3210', ipAddress: '10.0.0.1', location: 'London, UK' },
            items: getRandomItems(),
            total: 120.00, status: 'Pending', paymentMethod: 'PayPal',
            aiAnalysis: { riskScore: 45, summary: 'Medium risk. New customer with high-value order.', keyFactors: ['First-time purchase', 'International shipping', 'Proxy IP detected'] },
        },
        {
            orderDate: new Date('2024-05-22T09:15:00Z'),
            customer: { name: 'Charlie Brown', email: 'charlie@example.com', phone: '555-123-4567', ipAddress: '172.16.0.1', location: 'Toronto, CA' },
            items: getRandomItems(),
            total: 499.98, status: 'Completed', paymentMethod: 'Credit Card',
            aiAnalysis: { riskScore: 5, summary: 'Very low risk. Long-term customer.', keyFactors: ['Established account', 'AVS match success', 'No unusual activity'] },
        },
        {
            orderDate: new Date('2024-05-23T18:45:00Z'),
            customer: { name: 'Diana Prince', email: 'diana@example.com', phone: '222-333-4444', ipAddress: '203.0.113.50', location: 'Paris, FR' },
            items: getRandomItems(),
            total: 89.98, status: 'Processing', paymentMethod: 'Apple Pay',
            aiAnalysis: { riskScore: 85, summary: 'High risk. Mismatched IP and shipping.', keyFactors: ['IP location different from shipping', 'Temp email service', 'Unusual order time'] },
        }
    ];

    return mockOrders.map((order, index) => {
        const total = order.items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
        return {
            ...order,
            id: `mock_order_${index + 1}`,
            total: total
        }
    });
};


export default function AdminOrdersPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { handleNav } = useNavigation();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
     if (!authLoading && !user) {
        router.push("/signin");
    }
  }, [user, authLoading, router]);


  useEffect(() => {
    if (user) {
      setLoading(true);
      // Simulate fetching data
      setTimeout(() => {
        const mockData = generateMockOrders();
        setOrders(mockData);
        setLoading(false);
      }, 500);
    }
  }, [user]);

  const handleStatusChange = (orderId: string, newStatus: Order['status']) => {
    setOrders(prevOrders =>
      prevOrders.map(order =>
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );
  };


  if (authLoading || !user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-screen">
          <Skeleton className="w-full h-96" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="outline" size="icon" onClick={handleNav('/admin')}>
            <ArrowLeft />
        </Button>
        <h1 className="text-3xl md:text-4xl font-bold font-headline tracking-tight">
          Transactions
        </h1>
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : orders.length > 0 ? (
        <div className="space-y-4">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} onStatusChange={handleStatusChange} />
          ))}
        </div>
      ) : (
         <div className="text-center py-16 border-2 border-dashed rounded-lg">
            <h2 className="text-2xl font-semibold mb-2">No transactions found</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              This is a demo environment. Transactions will appear here once a backend is connected.
            </p>
        </div>
      )}
    </div>
  );
}
