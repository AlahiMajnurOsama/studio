
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import type { Order, OrderStatus } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MoreHorizontal, CheckCircle, Clock, Truck, XCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { products as allProducts } from "@/lib/data";
import { useNavigation } from "@/hooks/useNavigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

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
        },
        {
            orderDate: new Date('2024-05-21T14:00:00Z'),
            customer: { name: 'Bob Smith', email: 'bob@example.com', phone: '987-654-3210', ipAddress: '10.0.0.1', location: 'London, UK' },
            items: getRandomItems(),
            total: 120.00, status: 'Pending', paymentMethod: 'PayPal',
        },
        {
            orderDate: new Date('2024-05-22T09:15:00Z'),
            customer: { name: 'Charlie Brown', email: 'charlie@example.com', phone: '555-123-4567', ipAddress: '172.16.0.1', location: 'Toronto, CA' },
            items: getRandomItems(),
            total: 499.98, status: 'Completed', paymentMethod: 'Credit Card',
        },
        {
            orderDate: new Date('2024-05-23T18:45:00Z'),
            customer: { name: 'Diana Prince', email: 'diana@example.com', phone: '222-333-4444', ipAddress: '203.0.113.50', location: 'Paris, FR' },
            items: getRandomItems(),
            total: 89.98, status: 'Processing', paymentMethod: 'Apple Pay',
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

const statusConfig: Record<OrderStatus, { label: string; color: string; icon: React.ElementType }> = {
    Pending: { label: 'Pending', color: 'bg-yellow-500', icon: Clock },
    Processing: { label: 'Processing', color: 'bg-blue-500', icon: Truck },
    Completed: { label: 'Completed', color: 'bg-green-600', icon: CheckCircle },
    Cancelled: { label: 'Cancelled', color: 'bg-red-500', icon: XCircle },
};


export default function AdminOrdersPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
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
      setTimeout(() => {
        const mockData = generateMockOrders();
        setOrders(mockData.sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()));
        setLoading(false);
      }, 500);
    }
  }, [user]);

  const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
    setOrders(prevOrders =>
      prevOrders.map(order =>
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );
    toast({
        title: "Order Status Updated",
        description: `Order #${orderId.slice(-6).toUpperCase()} is now ${newStatus}.`,
    });
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
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : orders.length > 0 ? (
        <div className="bg-card border rounded-lg shadow-sm">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Order ID</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                        <TableHead className="text-center">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {orders.map(order => {
                        const currentStatus = statusConfig[order.status];
                        return (
                            <TableRow key={order.id}>
                                <TableCell className="font-medium">#{order.id.slice(-6).toUpperCase()}</TableCell>
                                <TableCell>{order.customer.name}</TableCell>
                                <TableCell>{format(new Date(order.orderDate), 'MMM dd, yyyy')}</TableCell>
                                <TableCell>
                                    <Badge variant="default" className={cn("text-white text-xs", currentStatus.color)}>
                                        <currentStatus.icon className="h-3 w-3 mr-1.5" />
                                        {currentStatus.label}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">${order.total.toFixed(2)}</TableCell>
                                <TableCell className="text-center">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem>View Details</DropdownMenuItem>
                                            {(Object.keys(statusConfig) as OrderStatus[]).map(status => (
                                                <DropdownMenuItem key={status} onSelect={() => handleStatusChange(order.id, status)}>
                                                    <statusConfig[status].icon className="mr-2 h-4 w-4" />
                                                    <span>Set to {statusConfig[status].label}</span>
                                                </DropdownMenuItem>
                                            ))}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        )
                    })}
                </TableBody>
            </Table>
        </div>
      ) : (
         <div className="text-center py-16 border-2 border-dashed rounded-lg">
            <h2 className="text-2xl font-semibold mb-2">No transactions found</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Transactions will appear here once orders are placed.
            </p>
        </div>
      )}
    </div>
  );
}
