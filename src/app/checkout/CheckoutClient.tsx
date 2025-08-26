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
import { CheckCircle, ShoppingBag, FileText, Download, Printer } from "lucide-react";
import Link from "next/link";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import Logo from "@/components/icons/Logo";


type CheckoutStep = "initial" | "guest_form" | "payment" | "success";

interface CompletedOrder {
  transactionId: string;
  items: CartItem[];
  total: number;
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
            backgroundColor: document.documentElement.classList.contains('dark') ? '#0f172a' : '#ffffff'
        });
        const imgData = canvas.toDataURL('image/png');
        
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'px',
            format: [canvas.width, canvas.height]
        });
        
        pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
        pdf.save(`Shohure-Invoice-${completedOrder?.transactionId}.pdf`);

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

    // Generate unique transaction ID
    const transactionId = `SHR-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    
    // Save order details before clearing cart
    setCompletedOrder({
      transactionId,
      items: [...cart],
      total: subtotal,
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
      <div className="max-w-4xl mx-auto animate-fade-in space-y-6">
        <div className="text-center">
            <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
            <h2 className="mt-4 text-3xl font-bold">Thank You For Your Order!</h2>
            <p className="text-muted-foreground mt-2">
                Your purchase was successful. You can download your invoice below.
            </p>
        </div>
        
        <div ref={billRef} className="p-8 border rounded-lg bg-card text-card-foreground shadow-sm">
            <div className="flex justify-between items-start pb-6 border-b mb-6">
                <div>
                    <h3 className="text-xl font-bold font-headline">Invoice</h3>
                    <p className="text-muted-foreground text-sm">Order #{completedOrder?.transactionId}</p>
                    <p className="text-muted-foreground text-sm">Date: {new Date().toLocaleDateString()}</p>
                </div>
                 <div className="text-right">
                    <Logo />
                    <p className="text-sm">Shohure /শহুরে</p>
                    <p className="text-xs text-muted-foreground">Modern E-commerce</p>
                </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-6 mb-8">
                <div>
                    <h4 className="font-semibold mb-2">Billed To:</h4>
                    <address className="not-italic text-sm text-muted-foreground">
                        {user ? user.displayName : guestDetails.name}<br />
                        {user ? user.email : guestDetails.email}<br/>
                        {guestDetails.phone}<br/>
                        {guestDetails.address}
                    </address>
                </div>
                <div className="sm:text-right">
                    <h4 className="font-semibold mb-2">Payment Details:</h4>
                    <p className="text-sm text-muted-foreground">
                        Payment Method: Demo Payment<br />
                        Status: <span className="text-green-500 font-semibold">Paid</span>
                    </p>
                </div>
            </div>
            
            <div className="space-y-4">
                 <div className="grid grid-cols-5 gap-4 font-semibold text-sm border-b pb-2">
                    <div className="col-span-2">Item</div>
                    <div className="text-right">Price</div>
                    <div className="text-right">Quantity</div>
                    <div className="text-right">Total</div>
                </div>

                {completedOrder?.items.map(item => {
                        const itemPrice = item.product.price + (item.selectedVariant?.priceModifier || 0);
                        return (
                        <div key={item.id} className="grid grid-cols-5 gap-4 text-sm items-center">
                            <div className="col-span-2">
                                <p className="font-medium">{item.product.name}</p>
                                <div className="text-xs text-muted-foreground">
                                    {item.selectedColor && <span>{item.selectedColor.color} </span>}
                                    {item.selectedSize && <span>/ {item.selectedSize} </span>}
                                    {item.selectedVariant && <span>/ {item.selectedVariant.name}</span>}
                                </div>
                            </div>
                            <span className="font-medium text-right">${itemPrice.toFixed(2)}</span>
                            <span className="font-medium text-right">{item.quantity}</span>
                            <span className="font-medium text-right">${(itemPrice * item.quantity).toFixed(2)}</span>
                        </div>
                        )
                })}
            </div>

            <Separator className="my-6" />

             <div className="flex justify-end">
                <div className="w-full max-w-xs space-y-2">
                    <div className="flex justify-between font-bold text-lg">
                        <span>Total Paid</span>
                        <span>${completedOrder?.total.toFixed(2)}</span>
                    </div>
                </div>
            </div>

            <div className="text-center mt-8 text-xs text-muted-foreground">
                <p>Thank you for your business!</p>
            </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={handleDownloadBill}>
                <Download className="mr-2 h-4 w-4" /> Download Bill (PDF)
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
