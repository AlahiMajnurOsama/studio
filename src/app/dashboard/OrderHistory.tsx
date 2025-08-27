
"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import type { Order } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import OrderCard from "@/app/admin/orders/OrderCard";

interface OrderHistoryProps {
  userEmail: string;
}

export default function OrderHistory({ userEmail }: OrderHistoryProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchOrders = async () => {
      if (!userEmail) return;

      setLoading(true);
      try {
        // Query for orders matching the user's email
        const q = query(
          collection(db, "orders"),
          where("customer.email", "==", userEmail)
        );
        const querySnapshot = await getDocs(q);
        
        // Map and sort the documents client-side
        const ordersData = querySnapshot.docs
          .map((doc) => ({ ...doc.data(), id: doc.id }) as Order)
          .sort((a, b) => {
            const dateA = a.orderDate instanceof Date ? a.orderDate.getTime() : a.orderDate.toMillis();
            const dateB = b.orderDate instanceof Date ? b.orderDate.getTime() : b.orderDate.toMillis();
            return dateB - dateA; // Sort descending
          });

        setOrders(ordersData);
      } catch (error) {
        console.error("Error fetching user orders: ", error);
        toast({
          title: "Error",
          description: "Failed to fetch your order history.",
          variant: "destructive",
        });
      } finally {
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
