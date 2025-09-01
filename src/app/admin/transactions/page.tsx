
"use client";

import { useEffect, useState } from "react";
import type { Order, OrderStatus } from "@/lib/types";
import { products as allProducts } from "@/lib/data";
import { useAuth } from "@/hooks/useAuth";
import { useNavigation } from "@/hooks/useNavigation";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Tag } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const mockTransactions: Order[] = [
  {
    id: 'mock_ord_1',
    orderDate: new Date('2024-05-20T10:30:00Z'),
    customer: { name: 'Alice Johnson', email: 'alice@example.com', phone: '123-456-7890', ipAddress: '192.168.1.1', location: 'New York, USA' },
    items: [],
    total: 285.49,
    status: 'Completed',
    paymentMethod: 'Credit Card',
    appliedCoupon: { code: 'SAVE10', discountAmount: 31.72 }
  },
  {
    id: 'mock_ord_3',
    orderDate: new Date('2024-05-22T09:15:00Z'),
    customer: { name: 'Charlie Brown', email: 'charlie@example.com', phone: '555-123-4567', ipAddress: '172.16.0.1', location: 'Toronto, CA' },
    items: [],
    total: 499.98,
    status: 'Completed',
    paymentMethod: 'Credit Card',
  },
  {
    id: 'mock_ord_4',
    orderDate: new Date('2024-05-23T18:45:00Z'),
    customer: { name: 'Diana Prince', email: 'diana@example.com', phone: '222-333-4444', ipAddress: '203.0.113.50', location: 'Paris, FR' },
    items: [],
    total: 89.99,
    status: 'Completed',
    paymentMethod: 'Apple Pay',
  },
];

const statusColors: Record<OrderStatus, string> = {
  Pending: "bg-yellow-500/20 text-yellow-500 border-yellow-500/30",
  Processing: "bg-blue-500/20 text-blue-500 border-blue-500/30",
  Completed: "bg-green-500/20 text-green-500 border-green-500/30",
  Cancelled: "bg-red-500/20 text-red-500 border-red-500/30",
};


export default function AdminTransactionsPage() {
  const { user, loading: authLoading, isAdmin } = useAuth();
  const router = useRouter();
  const { handleNav } = useNavigation();

  const [transactions, setTransactions] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push("/signin");
      } else if (!isAdmin) {
        router.push("/");
      }
    }
  }, [user, authLoading, isAdmin, router]);

  useEffect(() => {
    // Simulate fetching data
    setTimeout(() => {
      setTransactions(mockTransactions);
      setLoading(false);
    }, 500);
  }, []);

  if (authLoading || !user || !isAdmin) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-96 w-full" />
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
          Successful Transactions
        </h1>
      </div>

      <Card>
        <CardContent className="p-0">
           {loading ? (
             <div className="p-4">
                {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full mt-2" />
                ))}
            </div>
           ) : (
            <TooltipProvider>
             <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {transactions.map((order) => (
                    <TableRow key={order.id}>
                        <TableCell className="font-medium flex items-center gap-2">
                            <span>#{order.id.slice(-6).toUpperCase()}</span>
                            {order.appliedCoupon && (
                                <Tooltip>
                                    <TooltipTrigger>
                                        <Badge variant="secondary" className="bg-orange-500/20 text-orange-500 border-orange-500/30">
                                            <Tag className="h-3 w-3" />
                                        </Badge>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Coupon: <span className="font-semibold">{order.appliedCoupon.code}</span> (-${order.appliedCoupon.discountAmount.toFixed(2)})</p>
                                    </TooltipContent>
                                </Tooltip>
                            )}
                        </TableCell>
                        <TableCell>{order.customer.name}</TableCell>
                        <TableCell>{format(new Date(order.orderDate), 'MMM dd, yyyy')}</TableCell>
                        <TableCell className="text-right">${order.total.toFixed(2)}</TableCell>
                        <TableCell className="text-center">
                        <Badge variant="outline" className={cn("border", statusColors[order.status])}>
                            {order.status}
                        </Badge>
                        </TableCell>
                    </TableRow>
                    ))}
                </TableBody>
            </Table>
            </TooltipProvider>
           )}
           {!loading && transactions.length === 0 && (
            <div className="text-center p-8 text-muted-foreground">
                No successful transactions found.
            </div>
           )}
        </CardContent>
      </Card>
    </div>
  );
}
