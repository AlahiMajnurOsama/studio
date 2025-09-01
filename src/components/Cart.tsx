
"use client";

import Image from 'next/image';
import { useCart } from '@/hooks/useCart';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Trash2, Plus, Minus, Tag, XCircle } from 'lucide-react';
import { Separator } from './ui/separator';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTransition, useEffect, useState } from 'react';
import { useAppContext } from '@/context/AppContext';
import { Input } from './ui/input';
import { Badge } from './ui/badge';

interface CartProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export default function Cart({ isOpen, onOpenChange }: CartProps) {
  const { cart, removeFromCart, updateQuantity, subtotal, totalItems, clearCart, applyCoupon, removeCoupon, appliedCoupon, discount, total } = useCart();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { setPageLoading } = useAppContext();
  const [couponCode, setCouponCode] = useState('');

  useEffect(() => {
    setPageLoading(isPending);
  }, [isPending, setPageLoading]);

  const handleCheckout = () => {
    onOpenChange(false);
    startTransition(() => {
      router.push('/checkout');
    });
  };

  const handleApplyCoupon = () => {
    if(couponCode.trim()) {
        applyCoupon(couponCode.trim());
        setCouponCode('');
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md flex flex-col">
        <SheetHeader className='pr-6'>
          <SheetTitle>My Bag ({totalItems})</SheetTitle>
        </SheetHeader>
        {cart.length > 0 ? (
          <>
            <ScrollArea className="flex-grow pr-6 -mr-6">
              <div className="space-y-4 py-4">
                {cart.map((item) => {
                  const itemPrice = item.pricePerItem;
                  const displayImage = item.product.image;

                  return (
                    <div key={item.id} className="flex gap-4">
                      <div className="relative w-24 h-24 rounded-md overflow-hidden bg-muted">
                         <Image
                            src={displayImage}
                            alt={item.product.name}
                            fill
                            className="object-cover"
                            data-ai-hint={`${item.product.category} product`}
                         />
                      </div>
                      <div className="flex-grow flex flex-col justify-between py-1">
                        <div>
                          <h4 className="font-semibold text-sm">{item.product.name}</h4>
                          <div className="text-xs text-muted-foreground space-y-0.5 mt-1">
                            {item.selectedSize && <p>Size: {item.selectedSize}</p>}
                            {item.selectedVariant && <p>Variant: {item.selectedVariant.name}</p>}
                          </div>
                        </div>
                        <p className="font-bold text-sm">${itemPrice.toFixed(2)}</p>
                      </div>
                      <div className="flex flex-col items-end justify-between py-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => removeFromCart(item.id)}>
                            <Trash2 className="h-4 w-4 text-muted-foreground" />
                        </Button>
                        <div className="flex items-center gap-2 border rounded-md p-1">
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                                <Minus className="h-4 w-4"/>
                            </Button>
                            <span className="font-semibold text-sm w-4 text-center">{item.quantity}</span>
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                                <Plus className="h-4 w-4"/>
                            </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
            <SheetFooter className="mt-auto pr-6 -mr-6 border-t pt-4 space-y-4">
               <div className='space-y-2'>
                    <div className="flex gap-2">
                        <Input 
                            placeholder="Discount code" 
                            value={couponCode} 
                            onChange={(e) => setCouponCode(e.target.value)}
                            disabled={!!appliedCoupon}
                        />
                        <Button onClick={handleApplyCoupon} disabled={!!appliedCoupon || !couponCode.trim()}>
                            Apply
                        </Button>
                    </div>
                    {appliedCoupon && (
                        <div className='flex justify-between items-center text-sm'>
                            <Badge variant="secondary" className='gap-2'>
                                <Tag className='h-3 w-3' /> {appliedCoupon.code}
                            </Badge>
                             <Button variant="ghost" size="sm" className='text-red-500 hover:text-red-500' onClick={removeCoupon}>
                                <XCircle className="mr-1.5 h-4 w-4" />
                                Remove
                            </Button>
                        </div>
                    )}
               </div>
               <Separator />
                <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span>${subtotal.toFixed(2)}</span>
                    </div>
                    {discount > 0 && (
                        <div className="flex justify-between text-green-500">
                            <span className="text-muted-foreground">Discount</span>
                            <span>-${discount.toFixed(2)}</span>
                        </div>
                    )}
                     <div className="flex justify-between font-semibold text-lg">
                        <span>Total</span>
                        <span>${total.toFixed(2)}</span>
                    </div>
                </div>
                <Button size="lg" className="w-full font-bold" onClick={handleCheckout} disabled={isPending}>
                    Proceed to Checkout
                </Button>
            </SheetFooter>
          </>
        ) : (
          <div className="flex-grow flex flex-col items-center justify-center text-center">
            <h3 className="text-xl font-semibold">Your bag is empty</h3>
            <p className="text-muted-foreground mt-2">Add some products to get started!</p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
