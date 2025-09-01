
"use client";

import { useEffect, useState } from "react";
import type { Order, OrderStatus } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { products as allProducts } from "@/lib/data";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { CheckCircle, Clock, Truck, XCircle } from "lucide-react";


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

const statusConfig: Record<OrderStatus, { label: string; color: string; icon: React.ElementType }> = {
    Pending: { label: 'Pending', color: 'bg-yellow-500', icon: Clock },
    Processing: { label: 'Processing', color: 'bg-blue-500', icon: Truck },
    Completed: { label: 'Completed', color: 'bg-green-600', icon: CheckCircle },
    Cancelled: { label: 'Cancelled', color: 'bg-red-500', icon: XCircle },
};

function UserOrderCard({ order }: { order: Order }) {
    const currentStatus = statusConfig[order.status];

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-lg">Order #{order.id.slice(-6).toUpperCase()}</CardTitle>
                        <p className="text-sm text-muted-foreground">{format(new Date(order.orderDate), 'MMMM dd, yyyy')}</p>
                    </div>
                     <Badge variant="default" className={cn("text-white text-xs", currentStatus.color)}>
                        <currentStatus.icon className="h-3 w-3 mr-1.5" />
                        {currentStatus.label}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <Separator />
                <div className="space-y-3">
                    {order.items.map(item => (
                        <div key={item.id} className="flex items-center gap-4 text-sm">
                            <Image src={item.product.image} alt={item.product.name} width={48} height={48} className="rounded-md" />
                            <div className="flex-grow">
                                <p className="font-semibold">{item.product.name}</p>
                                <p className="text-muted-foreground">Qty: {item.quantity}</p>
                            </div>
                            <p className="font-medium">${(item.pricePerItem * item.quantity).toFixed(2)}</p>
                        </div>
                    ))}
                </div>
            </CardContent>
            <CardFooter className="flex justify-end bg-muted/50 p-4 rounded-b-lg">
                <p className="font-bold text-lg">Total: ${order.total.toFixed(2)}</p>
            </CardFooter>
        </Card>
    )
}

export default function OrderHistory({ userEmail }: OrderHistoryProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchOrders = () => {
      if (!userEmail) return;

      setLoading(true);
      try {
        // We removed the artificial delay to make it faster
        const ordersData = generateMockOrdersForUser(userEmail);
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
        <Skeleton className="h-48 w-full" />
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
        <UserOrderCard key={order.id} order={order} />
      ))}
    </div>
  );
}
