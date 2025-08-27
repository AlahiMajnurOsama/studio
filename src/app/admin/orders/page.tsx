
"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import type { Order } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import OrderCard from "./OrderCard";
import { useAppContext } from "@/context/AppContext";

export default function AdminOrdersPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { setPageLoading } = useAppContext();
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setPageLoading(isPending);
  }, [isPending, setPageLoading]);
  
  useEffect(() => {
    if (!authLoading && !user) {
      startTransition(() => {
        router.push("/signin");
      });
    }
  }, [user, authLoading, router]);


  useEffect(() => {
    if (user) {
      const q = query(collection(db, "orders"), orderBy("orderDate", "desc"));
      
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const ordersData = querySnapshot.docs.map(
          (doc) => ({ ...doc.data(), id: doc.id }) as Order
        );
        setOrders(ordersData);
        setLoading(false);
      }, (error) => {
        console.error("Error fetching orders in real-time: ", error);
        toast({
          title: "Error",
          description: "Failed to fetch orders. You may need to create the collection first.",
          variant: "destructive",
        });
        setLoading(false);
      });

      // Cleanup subscription on unmount
      return () => unsubscribe();
    }
  }, [user, toast]);

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
        <Button variant="outline" size="icon" asChild>
          <Link href="/admin">
            <ArrowLeft />
          </Link>
        </Button>
        <h1 className="text-3xl md:text-4xl font-bold font-headline tracking-tight">
          Customer Orders
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
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      ) : (
         <div className="text-center py-16 border-2 border-dashed rounded-lg">
            <h2 className="text-2xl font-semibold mb-2">No orders found</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Looks like there are no orders in your database yet. Once a customer completes a checkout, the order will appear here in real-time.
            </p>
        </div>
      )}
    </div>
  );
}
