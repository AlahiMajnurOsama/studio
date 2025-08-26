"use client";

import { useState } from 'react';
import type { Order } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, Copy, Bot } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import Image from 'next/image';

interface OrderCardProps {
  order: Order;
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

export default function OrderCard({ order }: OrderCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const orderDate = order.orderDate.toDate ? order.orderDate.toDate() : new Date(order.orderDate as any);

  return (
    <Card>
      <CardHeader className="cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="flex justify-between items-center">
          <div className='w-full'>
            <div className="flex justify-between items-center w-full">
              <CardTitle className="text-lg font-bold">Order #{order.id.slice(-6)}</CardTitle>
              <Badge variant={order.status === 'Completed' ? 'default' : 'secondary'} className={cn(order.status === 'Completed' && 'bg-green-600')}>{order.status}</Badge>
            </div>
            <div className="flex justify-between items-center text-sm text-muted-foreground mt-1">
              <span>{order.customer.name}</span>
              <span>{format(orderDate, 'MMM dd, yyyy')}</span>
              <span className="font-bold text-foreground">${order.total.toFixed(2)}</span>
            </div>
          </div>
          <ChevronDown className={cn("h-5 w-5 ml-4 transition-transform", isExpanded && "rotate-180")} />
        </div>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="animate-accordion-down space-y-4">
          <Separator />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            <div>
              <h4 className="font-semibold mb-2">Customer Details</h4>
              <DetailRow label="Name" value={order.customer.name} />
              <DetailRow label="Email" value={order.customer.email} canCopy />
              <DetailRow label="Phone" value={order.customer.phone} canCopy />
              <DetailRow label="IP Address" value={order.customer.ipAddress} canCopy />
              <DetailRow label="Location" value={order.customer.location} canCopy />
            </div>
             <div>
              <h4 className="font-semibold mb-2">Order Information</h4>
              <DetailRow label="Order ID" value={order.id} canCopy />
              <DetailRow label="Order Date" value={format(orderDate, 'PPpp')} />
              <DetailRow label="Payment Method" value={order.paymentMethod} />
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold mb-2">Items ({order.items.length})</h4>
            <div className="space-y-3">
              {order.items.map(item => (
                <div key={item.id} className="flex items-center gap-4 text-sm">
                  <Image src={item.product.image} alt={item.product.name} width={48} height={48} className="rounded-md object-cover bg-muted" />
                  <div className="flex-grow">
                    <p className="font-medium">{item.product.name}</p>
                    <p className="text-muted-foreground">Qty: {item.quantity}</p>
                  </div>
                  <p className="font-medium">${(item.product.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>
          </div>

          <Separator />
          
          <div>
            <h4 className="font-semibold mb-2 flex items-center gap-2"><Bot className="h-5 w-5 text-primary" /> AI Fraud Analysis</h4>
            <div className="p-4 bg-muted/50 rounded-md text-sm space-y-2">
              <p><strong className="text-primary">Risk Score:</strong> {order.aiAnalysis.riskScore}/100</p>
              <p><strong className="text-primary">Summary:</strong> {order.aiAnalysis.summary}</p>
              <ul className="list-disc list-inside pl-2">
                {order.aiAnalysis.keyFactors.map((factor, i) => (
                  <li key={i}>{factor}</li>
                ))}
              </ul>
            </div>
          </div>

        </CardContent>
      )}
    </Card>
  );
}
