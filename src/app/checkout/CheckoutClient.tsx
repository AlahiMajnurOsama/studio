"use client";

import { useState } from "react";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import { CheckCircle, ShoppingBag } from "lucide-react";
import Link from "next/link";

type CheckoutStep = "initial" | "guest_form" | "payment" | "success";

export default function CheckoutClient() {
  const { cart, subtotal, totalItems, clearCart } = useCart();
  const { user, signInWithGoogle } = useAuth();
  const router = useRouter();

  const [step, setStep] = useState<CheckoutStep>("initial");
  const [guestDetails, setGuestDetails] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

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
    // In a real app, you'd process the payment here.
    console.log("Processing payment for:", user || guestDetails);
    console.log("Order details:", cart);
    
    // Simulate success
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
      <Card className="text-center animate-fade-in">
        <CardContent className="p-8">
            <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
            <h2 className="mt-4 text-3xl font-bold">Thank You!</h2>
            <p className="text-muted-foreground mt-2">
                Your order has been placed successfully.
            </p>
            <Button asChild className="mt-8">
                <Link href="/">Continue Shopping</Link>
            </Button>
        </CardContent>
      </Card>
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
