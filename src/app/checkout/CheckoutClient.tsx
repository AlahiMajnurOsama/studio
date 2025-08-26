
"use client";

import { useState, useRef, useTransition } from "react";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import type { CartItem, Order } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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


type CheckoutStep = "initial" | "guest_form" | "payment" | "success";

// Use Omit to remove the Timestamp version of orderDate for client-side state
type CompletedOrder = Omit<Order, 'orderDate'> & {
  orderDate: Date;
};


export default function CheckoutClient() {
  const { cart, subtotal, totalItems, clearCart } = useCart();
  const { user, signInWithGoogle } = useAuth();
  const billRef = useRef<HTMLDivElement>(null);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const [step, setStep] = useState<CheckoutStep>("initial");
  const [completedOrder, setCompletedOrder] = useState<CompletedOrder | null>(null);
  const [guestDetails, setGuestDetails] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

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

  const handleGuestFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep("payment");
  };

  const handleDemoPayment = () => {
    startTransition(async () => {
        const result = await createOrder(guestDetails, cart, subtotal);
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

  const renderInitialStep = () => (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Checkout</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p>How would you like to proceed?</p>
        <Button className="w-full" size="lg" onClick={() => setStep("guest_form")}>
          Checkout as Guest
        </Button>
        <Button className="w-full" size="lg" variant="outline" onClick={async () => {
          await signInWithGoogle();
          if (user) setStep("payment");
        }}>
          Sign In & Checkout
        </Button>
      </CardContent>
    </Card>
  );

  const renderGuestForm = () => (
    <form onSubmit={handleGuestFormSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Guest Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" required value={guestDetails.name} onChange={(e) => setGuestDetails({...guestDetails, name: e.target.value})} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" required value={guestDetails.email} onChange={(e) => setGuestDetails({...guestDetails, email: e.target.value})} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input id="phone" type="tel" required value={guestDetails.phone} onChange={(e) => setGuestDetails({...guestDetails, phone: e.target.value})} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Shipping Address</Label>
            <Input id="address" required placeholder="e.g. 123 Main St, Anytown, USA" value={guestDetails.address} onChange={(e) => setGuestDetails({...guestDetails, address: e.target.value})} />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" size="lg">Continue to Payment</Button>
        </CardFooter>
      </Card>
    </form>
  );

  const renderPaymentStep = () => (
    <div>
        <h2 className="text-2xl font-bold mb-4">Payment</h2>
        <Card>
            <CardHeader>
                <CardTitle>Confirm Your Order</CardTitle>
            </CardHeader>
            <CardContent>
                <p>Please review your order and press the button below to complete your purchase using our demo payment system. An AI fraud check will be performed.</p>
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
                {step === 'initial' && renderInitialStep()}
                {step === 'guest_form' && renderGuestForm()}
                {step === 'payment' && renderPaymentStep()}
            </div>
        </div>
    </div>
  );
}

    
