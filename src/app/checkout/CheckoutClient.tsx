
"use client";

import { useState, useRef } from "react";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import type { CartItem } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import { CheckCircle, ShoppingBag, Download } from "lucide-react";
import Link from "next/link";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { format } from 'date-fns';


type CheckoutStep = "initial" | "guest_form" | "payment" | "success";

interface CompletedOrder {
  transactionId: string;
  items: CartItem[];
  total: number;
  orderDate: Date;
}

export default function CheckoutClient() {
  const { cart, subtotal, totalItems, clearCart } = useCart();
  const { user, signInWithGoogle } = useAuth();
  const billRef = useRef<HTMLDivElement>(null);

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
            backgroundColor: document.documentElement.classList.contains('dark') ? '#0a0a0a' : '#ffffff' // Adjusted background for better PDF
        });
        const imgData = canvas.toDataURL('image/png');
        
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'px',
            format: [canvas.width, canvas.height]
        });
        
        pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
        pdf.save(`Shohure-Receipt-${completedOrder?.transactionId}.pdf`);

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
    console.log("Processing payment for:", user || guestDetails);
    console.log("Order details:", cart);

    const transactionId = `TRX-${Date.now()}`;
    
    setCompletedOrder({
      transactionId,
      items: [...cart],
      total: subtotal,
      orderDate: new Date(),
    });
    
    clearCart();
    setStep("success");
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
            <Input id="address" required value={guestDetails.address} onChange={(e) => setGuestDetails({...guestDetails, address: e.target.value})} />
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
                <p>Please review your order and press the button below to complete your purchase using our demo payment system.</p>
            </CardContent>
            <CardFooter>
                <Button className="w-full" size="lg" onClick={handleDemoPayment}>
                    Complete Purchase (Demo)
                </Button>
            </CardFooter>
        </Card>
    </div>
  );
  
  const renderSuccessStep = () => (
      <div className="max-w-md mx-auto animate-fade-in space-y-6">
        <div className="text-center">
            <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
            <h2 className="mt-4 text-3xl font-bold">Thank You For Your Order!</h2>
            <p className="text-muted-foreground mt-2">
                Your purchase was successful. You can download your receipt below.
            </p>
        </div>
        
        <div ref={billRef} className="p-8 border rounded-2xl bg-card text-card-foreground shadow-lg font-mono">
            <div className="text-center space-y-2 mb-8">
                <h3 className="text-2xl font-bold text-blue-500 tracking-widest">RECEIPT</h3>
                <p className="font-semibold text-orange-500">Bill ID: {completedOrder?.transactionId}</p>
                <p className="text-sm text-muted-foreground">
                    {completedOrder?.orderDate ? format(completedOrder.orderDate, 'MM/dd/yyyy, h:mm:ss a') : ''}
                </p>
            </div>

            <div className="space-y-4 border-t-2 border-dashed pt-6">
                <div className="grid grid-cols-12 gap-2 font-bold text-blue-500">
                    <div className="col-span-6">Item</div>
                    <div className="col-span-3 text-center">Qty</div>
                    <div className="col-span-3 text-right">Total</div>
                </div>

                {completedOrder?.items.map(item => {
                    const itemPrice = item.product.price + (item.selectedVariant?.priceModifier || 0);
                    return (
                        <div key={item.id} className="grid grid-cols-12 gap-2 items-center">
                            <div className="col-span-6">
                                <p className="font-medium truncate">{item.product.name}</p>
                            </div>
                            <span className="font-medium text-center">{item.quantity}</span>
                            <span className="font-medium text-right">${(itemPrice * item.quantity).toFixed(2)}</span>
                        </div>
                    )
                })}
            </div>
            
            <div className="space-y-2 border-t-2 border-dashed mt-6 pt-6">
                 <div className="flex justify-between font-medium">
                    <span>Subtotal</span>
                    <span>${completedOrder?.total.toFixed(2)}</span>
                </div>
                 <div className="flex justify-between font-bold text-blue-500 text-lg">
                    <span>Total</span>
                    <span>${completedOrder?.total.toFixed(2)}</span>
                </div>
            </div>


            <div className="text-center mt-8 text-lg font-semibold text-orange-500">
                <p>Thank You!</p>
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

    