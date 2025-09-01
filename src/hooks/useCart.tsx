
"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import type { CartItem, Product, ColorVariant, ProductVariant } from '@/lib/types';
import { useToast } from './use-toast';

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, quantity: number, selectedColor?: ColorVariant | null, selectedSize?: string | null, selectedVariant?: ProductVariant | null) => void;
  removeFromCart: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, newQuantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'chromashop_cart';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    try {
      const storedCart = localStorage.getItem(CART_STORAGE_KEY);
      if (storedCart) {
        setCart(JSON.parse(storedCart));
      }
    } catch (error) {
      console.error("Failed to parse cart from localStorage", error);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (error) {
      console.error("Failed to save cart to localStorage", error);
    }
  }, [cart]);

  const addToCart = useCallback((
    product: Product,
    quantity: number,
    selectedColor: ColorVariant | null = null,
    selectedSize: string | null = null,
    selectedVariant: ProductVariant | null = null
  ) => {
    const cartItemId = `${product.id}-${selectedColor?.color || 'default'}-${selectedSize || 'default'}-${selectedVariant?.name || 'default'}`;
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
        const newItem: CartItem = {
          id: cartItemId,
          product,
          quantity,
          selectedColor: null, // Color variants removed
          selectedSize,
          selectedVariant,
          pricePerItem,
        };
        return [...prevCart, newItem];
      }
    });
    
    toast({
      title: "Added to Bag!",
      description: `${product.name} is now in your shopping bag.`,
    });

  }, [toast]);

  const removeFromCart = useCallback((cartItemId: string) => {
    setCart(prevCart => prevCart.filter(item => item.id !== cartItemId));
    toast({
      title: "Item Removed",
      description: "The item has been removed from your bag.",
    });
  }, [toast]);

  const updateQuantity = useCallback((cartItemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(cartItemId);
    } else {
      setCart(prevCart =>
        prevCart.map(item =>
          item.id === cartItemId ? { ...item, quantity: newQuantity } : item
        )
      );
    }
  }, [removeFromCart]);
  
  const clearCart = useCallback(() => {
    setCart([]);
     toast({
      title: "Cart Cleared",
      description: "All items have been removed from your bag.",
    });
  }, [toast]);

  const totalItems = useMemo(() => cart.reduce((total, item) => total + item.quantity, 0), [cart]);

  const subtotal = useMemo(() => {
    return cart.reduce((total, item) => {
      return total + (item.pricePerItem * item.quantity);
    }, 0);
  }, [cart]);


  const value = useMemo(() => ({
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    totalItems,
    subtotal,
  }), [cart, addToCart, removeFromCart, updateQuantity, clearCart, totalItems, subtotal]);

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
