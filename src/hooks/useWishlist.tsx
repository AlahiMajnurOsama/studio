"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useToast } from './use-toast';
import { useAppContext } from '@/context/AppContext';

interface WishlistContextType {
  wishlist: string[];
  addToWishlist: (productId: string) => void;
  removeFromWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

const WISHLIST_STORAGE_KEY = 'chromashop_wishlist';

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wishlist, setWishlist] = useState<string[]>([]);
  const { toast } = useToast();
  const { withLoader } = useAppContext();
  const [lastAction, setLastAction] = useState<{ type: 'add' | 'remove'; productId: string } | null>(null);

  // Load wishlist from localStorage on initial render
  useEffect(() => {
    try {
      const storedWishlist = localStorage.getItem(WISHLIST_STORAGE_KEY);
      if (storedWishlist) {
        setWishlist(JSON.parse(storedWishlist));
      }
    } catch (error) {
      console.error("Failed to parse wishlist from localStorage", error);
    }
  }, []);

  // Persist wishlist to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlist));
    } catch (error) {
      console.error("Failed to save wishlist to localStorage", error);
    }
  }, [wishlist]);
  
  // Show toast notifications after the state has been updated
  useEffect(() => {
    if (lastAction) {
      if (lastAction.type === 'add') {
         toast({
          title: "Added to Wishlist!",
          description: "You've got great taste.",
        });
      } else if (lastAction.type === 'remove') {
         toast({
          title: "Removed from Wishlist",
        });
      }
      setLastAction(null); // Reset the action
    }
  }, [lastAction, toast]);


  const addToWishlist = useCallback((productId: string) => withLoader(() => {
    if (!wishlist.includes(productId)) {
      setWishlist(prev => [...prev, productId]);
      setLastAction({ type: 'add', productId });
    }
  }), [wishlist, withLoader]);

  const removeFromWishlist = useCallback((productId: string) => withLoader(() => {
    if (wishlist.includes(productId)) {
      setWishlist(prev => prev.filter(id => id !== productId));
      setLastAction({ type: 'remove', productId });
    }
  }), [wishlist, withLoader]);

  const isInWishlist = useCallback((productId: string) => {
    return wishlist.includes(productId);
  }, [wishlist]);

  const value = useMemo(() => ({
    wishlist,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
  }), [wishlist, addToWishlist, removeFromWishlist, isInWishlist]);

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = (): WishlistContextType => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
