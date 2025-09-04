
"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import type { CartItem, Product, ProductVariant, Coupon } from '@/lib/types';
import { useToast } from './use-toast';
import { getCoupons } from '@/lib/data';
import { useAppContext } from '@/context/AppContext';

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, quantity: number, selectedColor?: null, selectedSize?: string | null, selectedVariant?: ProductVariant | null) => void;
  removeFromCart: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, newQuantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  appliedCoupon: Coupon | null;
  applyCoupon: (couponCode: string) => void;
  removeCoupon: () => void;
  discount: number;
  total: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'chromashop_cart';
const COUPON_STORAGE_KEY = 'chromashop_coupon';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [allCoupons, setAllCoupons] = useState<Coupon[]>([]);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const { toast } = useToast();
  const { withLoader } = useAppContext();

  useEffect(() => {
    try {
      const storedCart = localStorage.getItem(CART_STORAGE_KEY);
      if (storedCart) setCart(JSON.parse(storedCart));
      
      const storedCoupon = localStorage.getItem(COUPON_STORAGE_KEY);
      if (storedCoupon) setAppliedCoupon(JSON.parse(storedCoupon));

      const fetchCoupons = async () => {
        const coupons = await getCoupons();
        setAllCoupons(coupons);
      };
      fetchCoupons();
    } catch (error) {
      console.error("Failed to parse cart/coupon from localStorage", error);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
      if (appliedCoupon) {
        localStorage.setItem(COUPON_STORAGE_KEY, JSON.stringify(appliedCoupon));
      } else {
        localStorage.removeItem(COUPON_STORAGE_KEY);
      }
    } catch (error) {
      console.error("Failed to save to localStorage", error);
    }
  }, [cart, appliedCoupon]);

  const addToCart = useCallback((
    product: Product,
    quantity: number,
    selectedColor: null = null,
    selectedSize: string | null = null,
    selectedVariant: ProductVariant | null = null
  ) => withLoader(() => {
    const cartItemId = `${product.id}-${selectedSize || 'default'}-${selectedVariant?.name || 'default'}`;
    const pricePerItem = product.price + (selectedVariant?.priceModifier || 0);

    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === cartItemId);
      if (existingItem) {
        return prevCart.map(item =>
          item.id === cartItemId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        const newItem: CartItem = { id: cartItemId, product, quantity, selectedColor: null, selectedSize, selectedVariant, pricePerItem };
        return [...prevCart, newItem];
      }
    });
    
    toast({
      title: "Added to Bag!",
      description: `${product.name} is now in your shopping bag.`,
    });
  }), [toast, withLoader]);

  const removeFromCart = useCallback((cartItemId: string) => withLoader(() => {
    setCart(prevCart => prevCart.filter(item => item.id !== cartItemId));
    toast({ title: "Item Removed", description: "The item has been removed from your bag." });
  }), [toast, withLoader]);

  const updateQuantity = useCallback((cartItemId: string, newQuantity: number) => withLoader(() => {
    if (newQuantity <= 0) {
      removeFromCart(cartItemId);
    } else {
      setCart(prevCart =>
        prevCart.map(item =>
          item.id === cartItemId ? { ...item, quantity: newQuantity } : item
        )
      );
    }
  }), [removeFromCart, withLoader]);
  
  const clearCart = useCallback(() => withLoader(() => {
    setCart([]);
    setAppliedCoupon(null);
    toast({ title: "Cart Cleared", description: "All items have been removed from your bag." });
  }), [toast, withLoader]);

  const totalItems = useMemo(() => cart.reduce((total, item) => total + item.quantity, 0), [cart]);

  const subtotal = useMemo(() => cart.reduce((total, item) => total + (item.pricePerItem * item.quantity), 0), [cart]);

  const applyCoupon = useCallback((couponCode: string) => withLoader(() => {
    const couponToApply = allCoupons.find(c => c.code.toUpperCase() === couponCode.toUpperCase());
    
    if (!couponToApply) {
      toast({ title: "Invalid Coupon", description: "The coupon code you entered is not valid.", variant: "destructive" });
      return;
    }
    if (!couponToApply.isActive) {
      toast({ title: "Inactive Coupon", description: "This coupon is no longer active.", variant: "destructive" });
      return;
    }
    if (couponToApply.minSpend && subtotal < couponToApply.minSpend) {
      toast({ title: "Minimum Spend Not Met", description: `You need to spend at least $${couponToApply.minSpend} to use this coupon.`, variant: "destructive" });
      return;
    }
    if (couponToApply.scope === 'product' && !cart.some(item => item.product.id === couponToApply.productId)) {
        toast({ title: "Coupon Not Applicable", description: "This coupon is not valid for any items in your cart.", variant: "destructive" });
        return;
    }

    setAppliedCoupon(couponToApply);
    toast({ title: "Coupon Applied!", description: `Success! ${couponToApply.description}.` });
  }), [subtotal, cart, toast, withLoader]);

  const removeCoupon = useCallback(() => withLoader(() => {
    setAppliedCoupon(null);
    toast({ title: "Coupon Removed" });
  }), [toast, withLoader]);

  const discount = useMemo(() => {
    if (!appliedCoupon) return 0;

    let applicableValue = 0;
    if (appliedCoupon.scope === 'product') {
        applicableValue = cart.reduce((total, item) => {
            if(item.product.id === appliedCoupon.productId) {
                return total + item.pricePerItem * item.quantity;
            }
            return total;
        }, 0);
    } else {
        applicableValue = subtotal;
    }
    
    if (appliedCoupon.type === 'percentage') {
        return (applicableValue * appliedCoupon.value) / 100;
    }
    
    if (appliedCoupon.type === 'fixed') {
        return Math.min(appliedCoupon.value, applicableValue);
    }

    return 0;
  }, [appliedCoupon, subtotal, cart]);

  const total = useMemo(() => Math.max(0, subtotal - discount), [subtotal, discount]);

  const value = useMemo(() => ({
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    totalItems,
    subtotal,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    discount,
    total,
  }), [cart, addToCart, removeFromCart, updateQuantity, clearCart, totalItems, subtotal, appliedCoupon, applyCoupon, removeCoupon, discount, total]);

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
