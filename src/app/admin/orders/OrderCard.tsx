
"use client";

import { useState } from 'react';
import type { Order, OrderStatus } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, Copy, CheckCircle, Clock, Truck, XCircle, AlertTriangle } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import Image from 'next/image';

interface OrderCardProps {
  order: Order;
  onStatusChange: (orderId: string, newStatus: OrderStatus) => void;
}

const DetailRow = ({ label, value, canCopy = false }: { label: string; value?: string | number; canCopy?: boolean }) => {
  const { toast } = useToast();
  
  const handleCopy = () => {
    if (value) {
      navigator.clipboard.writeText(value.toString());
      toast({ title: `${label} copied to clipboard!` });
    }
  };

  if (!value) return null;

  return (
    <div className="flex justify-between items-center text-sm py-2">
      <span className="text-muted-foreground">{label}</span>
      <div className="flex items-center gap-2">
        <span className="font-medium text-right">{value}</span>
        {canCopy && (
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleCopy}>
            <Copy className="h-3 w-3" />
          </Button>
        )}
      </div>
    </div>
  );
};

const statusConfig: Record<OrderStatus, { label: string; color: string; icon: React.ElementType }> = {
    Pending: { label: 'Pending', color: 'bg-yellow-500', icon: Clock },
    Processing: { label: 'Processing', color: 'bg-blue-500', icon: Truck },
    Completed: { label: 'Completed', color: 'bg-green-600', icon: CheckCircle },
    Cancelled: { label: 'Cancelled', color: 'bg-red-500', icon: XCircle },
};

export default function OrderCard({ order, onStatusChange }: OrderCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const orderDate = new Date(order.orderDate);
  const { toast } = useToast();
  const currentStatus = statusConfig[order.status];

  const handleStatusChange = (newStatus: OrderStatus) => {
    onStatusChange(order.id, newStatus);
    toast({
        title: "Order Status Updated",
        description: `Order #${order.id.slice(-6).toUpperCase()} is now ${newStatus}.`,
    });
  }

  const riskLevel = order.aiAnalysis 
    ? order.aiAnalysis.riskScore > 75 ? 'High' : order.aiAnalysis.riskScore > 40 ? 'Medium' : 'Low'
    : 'Unknown';
    
  const riskColor = riskLevel === 'High' ? 'text-red-500' : riskLevel === 'Medium' ? 'text-yellow-500' : 'text-green-500';

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
            <div className="flex-grow">
                <div className="flex items-center gap-4">
                    <CardTitle className="text-lg font-bold">Order #{order.id.slice(-6).toUpperCase()}</CardTitle>
                    <Badge variant="default" className={cn("text-white", currentStatus.color)}>
                        <currentStatus.icon className="h-3 w-3 mr-1" />
                        {currentStatus.label}
                    </Badge>
                </div>
                <CardDescription className="mt-1">
                    {format(orderDate, 'MMM dd, yyyy, HH:mm')} by {order.customer.name}
                </CardDescription>
            </div>
             <div className="flex items-center gap-2">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline">Update Status</Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        {(Object.keys(statusConfig) as OrderStatus[]).map(status => (
                             <DropdownMenuItem key={status} onSelect={() => handleStatusChange(status)}>
                                <statusConfig[status].icon className="mr-2 h-4 w-4" />
                                <span>{statusConfig[status].label}</span>
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
                <Button variant="ghost" size="icon" onClick={() => setIsExpanded(!isExpanded)}>
                    <ChevronDown className={cn("h-5 w-5 transition-transform", isExpanded && "rotate-180")} />
                </Button>
             </div>
        </div>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="animate-accordion-down space-y-6 pt-4 border-t">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className='md:col-span-2 space-y-4'>
                 <div>
                    <h4 className="font-semibold mb-2">Purchased Items ({order.items.length}) - <span className='font-bold'>${order.total.toFixed(2)}</span></h4>
                    <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
                    {order.items.map(item => (
                        <div key={item.id} className="flex items-center gap-4 text-sm p-2 rounded-md bg-muted/50">
                        <Image src={item.product.image} alt={item.product.name} width={48} height={48} className="rounded-md object-cover bg-muted" />
                        <div className="flex-grow">
                            <p className="font-medium">{item.product.name}</p>
                            <p className="text-muted-foreground">Qty: {item.quantity}</p>
                        </div>
                        <p className="font-medium">${(item.pricePerItem * item.quantity).toFixed(2)}</p>
                        </div>
                    ))}
                    </div>
                </div>
            </div>
            <div className="space-y-4">
                 <div>
                    <h4 className="font-semibold mb-2">Customer Details</h4>
                    <DetailRow label="Name" value={order.customer.name} />
                    <DetailRow label="Email" value={order.customer.email} canCopy />
                    <DetailRow label="Phone" value={order.customer.phone} canCopy />
                </div>
                 <div>
                    <h4 className="font-semibold mb-2">Transaction Details</h4>
                    <DetailRow label="Transaction ID" value={order.id} canCopy />
                    <DetailRow label="Payment Source" value={order.paymentMethod} />
                    <DetailRow label="IP Address" value={order.customer.ipAddress} canCopy />
                </div>
            </div>

          </div>

          {order.aiAnalysis && (
            <div className="pt-4 border-t">
                <h4 className="font-semibold mb-2 flex items-center">
                    <AlertTriangle className="mr-2 h-5 w-5 text-primary" />
                    AI Fraud Analysis
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm bg-muted/50 p-4 rounded-lg">
                    <div className='flex items-center gap-2'>
                        <span className="font-medium text-muted-foreground">Risk Level:</span>
                        <span className={cn('font-bold', riskColor)}>{riskLevel} ({order.aiAnalysis.riskScore}/100)</span>
                    </div>
                    <div className='md:col-span-2'>
                        <p><span className="font-medium text-muted-foreground">Summary:</span> {order.aiAnalysis.summary}</p>
                    </div>
                     <div className='md:col-span-3'>
                        <p><span className="font-medium text-muted-foreground">Key Factors:</span> {order.aiAnalysis.keyFactors.join(', ')}</p>
                    </div>
                </div>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
