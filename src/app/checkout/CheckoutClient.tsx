
"use client";

import { useState, useRef, useTransition, useEffect } from "react";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import type { Order } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import { CheckCircle, ShoppingBag, Download, Loader2 } from "lucide-react";
import Link from "next/link";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { format } from 'date-fns';
import { createOrder } from "../actions";
import { useToast } from "@/hooks/use-toast";
import { useAppContext } from "@/context/AppContext";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";


type CheckoutStep = "payment" | "success";

// Use Omit to remove the Timestamp version of orderDate for client-side state
type CompletedOrder = Omit<Order, 'orderDate'> & {
  orderDate: Date;
};


export default function CheckoutClient() {
  const { cart, subtotal, totalItems, clearCart } = useCart();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const billRef = useRef<HTMLDivElement>(null);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const { setPageLoading } = useAppContext();

  const [step, setStep] = useState<CheckoutStep>("payment");
  const [completedOrder, setCompletedOrder] = useState<CompletedOrder | null>(null);

  useEffect(() => {
    setPageLoading(isPending);
  }, [isPending, setPageLoading]);

  useEffect(() => {
    if (!authLoading && !user) {
      // Redirect to signin page if not logged in, but also pass a query param
      // to let the signin page know where to redirect back to.
      const redirectUrl = `/signin?redirect=/checkout`;
      router.push(redirectUrl);
    }
  }, [authLoading, user, router]);

  const handleDownloadBill = async () => {
    const billElement = billRef.current;
    if (!billElement) return;

    try {
        const canvas = await html2canvas(billElement, {
            scale: 2, 
            useCORS: true, 
            backgroundColor: document.documentElement.classList.contains('dark') ? '#0a0a0a' : '#ffffff' 
        });
        const imgData = canvas.toDataURL('image/png');
        
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'px',
            format: [canvas.width, canvas.height]
        });
        
        pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
        pdf.save(`Shohure-Receipt-${completedOrder?.id}.pdf`);

    } catch (error) {
        console.error("Error generating PDF:", error);
    }
  };


  const handleDemoPayment = () => {
    if (!user) {
        toast({
            title: "Authentication Error",
            description: "You must be logged in to place an order.",
            variant: "destructive"
        });
        return;
    }

    startTransition(async () => {
        const userDetails = {
            name: user.displayName || 'N/A',
            email: user.email || 'N/A',
            phone: user.phoneNumber || 'N/A',
            address: 'N/A' // Address is not stored in user object
        };

        const result = await createOrder(userDetails, cart, subtotal);
        if (result.success && result.order) {
            setCompletedOrder(result.order as CompletedOrder);
            clearCart();
            setStep("success");
        } else {
             toast({
                title: "Order Failed",
                description: result.error || "Something went wrong. Please try again.",
                variant: "destructive"
            });
        }
    });
  };

  if (authLoading || !user) {
    return (
       <div className="space-y-4">
          <h1 className="text-4xl font-bold font-headline mb-8 tracking-tight text-center">Checkout</h1>
          <div className="grid lg:grid-cols-2 lg:gap-12 space-y-8 lg:space-y-0">
             <div className="lg:col-start-2">
                <Skeleton className="h-64 w-full" />
             </div>
             <div className="lg:col-start-1 lg:row-start-1">
                <Skeleton className="h-48 w-full" />
             </div>
          </div>
       </div>
    );
  }

  if (cart.length === 0 && step !== "success") {
    return (
      <div className="text-center py-16 border-2 border-dashed rounded-lg">
        <ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground" />
        <h2 className="mt-4 text-2xl font-semibold">Your bag is empty</h2>
        <p className="text-muted-foreground mt-2">
          Add some products to your bag to start the checkout process.
        </p>
        <Button asChild className="mt-6 transition-transform active:scale-95">
          <Link href="/">Continue Shopping</Link>
        </Button>
      </div>
    );
  }

  const renderPaymentStep = () => (
    <div>
        <h2 className="text-2xl font-bold mb-4">Payment</h2>
        <Card>
            <CardHeader>
                <CardTitle>Confirm Your Order</CardTitle>
            </CardHeader>
            <CardContent>
                <p>Please review your order and press the button below to complete your purchase using our demo payment system.</p>
                <p className="text-sm text-muted-foreground mt-4">Logged in as: {user.displayName || user.email}</p>
            </CardContent>
            <CardFooter>
                <Button className="w-full" size="lg" onClick={handleDemoPayment} disabled={isPending}>
                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Complete Purchase (Demo)
                </Button>
            </CardFooter>
        </Card>
    </div>
  );
  
 const renderSuccessStep = () => (
      <div className="max-w-2xl mx-auto animate-fade-in space-y-6">
        <div className="text-center">
            <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
            <h2 className="mt-4 text-3xl font-bold">Thank You For Your Order!</h2>
            <p className="text-muted-foreground mt-2">
                Your purchase was successful. You can download your receipt below.
            </p>
        </div>
        
        <div ref={billRef} className="p-8 border rounded-lg bg-card text-card-foreground shadow-lg font-sans">
            <div className="flex justify-between items-start mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-primary">Shohure / শহুরে</h2>
                    <p className="text-muted-foreground text-sm">Order Invoice</p>
                </div>
                <div className="text-right">
                    <p className="font-semibold">Receipt #{completedOrder?.id.slice(-8)}</p>
                    <p className="text-sm text-muted-foreground">
                        {completedOrder?.orderDate ? format(completedOrder.orderDate, 'MMM dd, yyyy') : ''}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-8 mb-8">
                <div>
                    <h3 className="font-semibold mb-2 text-muted-foreground">Billed To</h3>
                    <p className="font-medium">{completedOrder?.customer.name}</p>
                    <p className="text-sm">{completedOrder?.customer.email}</p>
                    <p className="text-sm">{completedOrder?.customer.location}</p>
                </div>
                <div className="text-right">
                    <h3 className="font-semibold mb-2 text-muted-foreground">Payment Method</h3>
                    <p className="font-medium">{completedOrder?.paymentMethod}</p>
                </div>
            </div>

            <div className="space-y-4 border-t pt-6">
                <div className="grid grid-cols-12 gap-2 font-semibold text-muted-foreground text-sm">
                    <div className="col-span-6">Item</div>
                    <div className="col-span-3 text-center">Qty</div>
                    <div className="col-span-3 text-right">Total</div>
                </div>

                {completedOrder?.items.map(item => {
                    const itemPrice = item.product.price + (item.selectedVariant?.priceModifier || 0);
                    return (
                        <div key={item.id} className="grid grid-cols-12 gap-2 items-center text-sm">
                            <div className="col-span-6">
                                <p className="font-medium truncate">{item.product.name}</p>
                            </div>
                            <span className="font-medium text-center">{item.quantity}</span>
                            <span className="font-medium text-right">${(itemPrice * item.quantity).toFixed(2)}</span>
                        </div>
                    )
                })}
            </div>
            
            <div className="space-y-2 border-t mt-6 pt-6">
                 <div className="flex justify-between font-medium text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>${completedOrder?.total.toFixed(2)}</span>
                </div>
                 <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>${completedOrder?.total.toFixed(2)}</span>
                </div>
            </div>

            <div className="text-center mt-8 text-xs text-muted-foreground">
                <p>Thank you for your purchase!</p>
                <p>Shohure / শহুরে</p>
            </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={handleDownloadBill}>
                <Download className="mr-2 h-4 w-4" /> Download Receipt
            </Button>
            <Button asChild variant="outline">
                <Link href="/">
                    <ShoppingBag className="mr-2 h-4 w-4" /> Continue Shopping
                </Link>
            </Button>
        </div>
      </div>
  );


  const renderOrderSummary = () => (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Order Summary ({totalItems} items)</h2>
        <Card>
            <CardContent className="p-4 space-y-4">
                <div className="max-h-64 overflow-y-auto space-y-4 pr-2">
                    {cart.map(item => {
                        const itemPrice = item.product.price + (item.selectedVariant?.priceModifier || 0);
                        return (
                            <div key={item.id} className="flex items-center gap-4">
                                <Image 
                                    src={item.selectedColor?.image || item.product.image}
                                    alt={item.product.name}
                                    width={64}
                                    height={64}
                                    className="rounded-md object-cover"
                                />
                                <div className="flex-grow">
                                    <p className="font-semibold">{item.product.name}</p>
                                    <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                                </div>
                                <p className="font-semibold">${(itemPrice * item.quantity).toFixed(2)}</p>
                            </div>
                        )
                    })}
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                </div>
            </CardContent>
        </Card>
      </div>
  );


  if (step === "success") {
      return renderSuccessStep();
  }

  return (
    <div>
        <h1 className="text-4xl font-bold font-headline mb-8 tracking-tight text-center">Checkout</h1>
        <div className="grid lg:grid-cols-2 lg:gap-12 space-y-8 lg:space-y-0">
            <div className="lg:col-start-2">
                {renderOrderSummary()}
            </div>
            <div className="lg:col-start-1 lg:row-start-1">
                {step === 'payment' && renderPaymentStep()}
            </div>
        </div>
    </div>
  );
}
