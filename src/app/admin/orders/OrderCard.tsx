
"use client";

import { useState } from "react";
import type { Order, OrderStatus } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { CheckCircle, Clock, Truck, XCircle, ChevronDown, ChevronUp } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface OrderCardProps {
  order: Order;
  onStatusChange: (orderId: string, newStatus: OrderStatus) => void;
}

const statusConfig: Record<OrderStatus, { label: string; color: string; icon: React.ElementType }> = {
    Pending: { label: 'Pending', color: 'bg-yellow-500', icon: Clock },
    Processing: { label: 'Processing', color: 'bg-blue-500', icon: Truck },
    Completed: { label: 'Completed', color: 'bg-green-600', icon: CheckCircle },
    Cancelled: { label: 'Cancelled', color: 'bg-red-500', icon: XCircle },
};

function OrderCa({ order, onStatusChange }: OrderCardProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const currentStatus = statusConfig[order.status];
}Line 34:          const [isExpanded, setIsExpanded] = useState(false);
Line 35:          const currentStatus = statusConfig[order.status];
Line 36:
Line 37:          return (
Line 38:              <Card>
Line 39:                  <CardHeader>

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div className="flex-grow">
                        <CardTitle className="text-lg">Order #{order.id.slice(-6).toUpperCase()}</CardTitle>
                        <p className="text-sm text-muted-foreground">{format(new Date(order.orderDate), 'MMMM dd, yyyy')}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge variant="default" className={cn("text-white text-xs", currentStatus.color)}>
                            <currentStatus.icon className="h-3 w-3 mr-1.5" />
                            {currentStatus.label}
                        </Badge>
                        <Button variant="ghost" size="icon" onClick={() => setIsExpanded(!isExpanded)}>
                            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </Button>
                    </div>
                </div>
            </CardHeader>
            {isExpanded && (
                <CardContent className="space-y-4">
                    <Separator />
                    <div>
                        <h4 className="font-semibold text-sm mb-2">Customer</h4>
                        <p className="text-sm text-muted-foreground">{order.customer.name}</p>
                        <p className="text-sm text-muted-foreground">{order.customer.email}</p>
                    </div>
                    <div>
                        <h4 className="font-semibold text-sm mb-2">Items</h4>
                        <div cla
            )}
            <CardFooter className="flex justify-between items-center bg-muted/50 p-4 rounded-b-lg">
                 <p className="font-bold text-lg">Total: ${order.total.toFixed(2)}</p>
                 <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline">Change Status</Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        {(Object.keys(statusConfig) as OrderStatus[]).map(status => (
                            <DropdownMenuItem key={status} onSelect={() => onStatusChange(order.id, status)}>
                                <statusConfig[status].icon className="mr-2 h-4 w-4" />
                                <span>
