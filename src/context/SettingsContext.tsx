
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface Settings {
  brandName: string;
  receiptThanksText: string;
  heroImageUrls: [string, string, string];
}

interface SettingsContextType extends Settings {
  updateSettings: (newSettings: Partial<Settings>) => void;
  isSettingsLoading: boolean;
}

const SETTINGS_STORAGE_KEY = 'chromashop_site_settings';

const defaultSettings: Settings = {
  brandName: 'ChromaShop',
  receiptThanksText: 'Thank you for your purchase!',
  heroImageUrls: [
    "https://picsum.photos/seed/hero1/1200/400",
    "https://picsum.photos/seed/hero2/1200/400",
    "https://picsum.photos/seed/hero3/1200/400",
  ],
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [isSettingsLoading, setIsSettingsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    try {
      const storedSettings = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (storedSettings) {
        setSettings(JSON.parse(storedSettings));
      }
    } catch (error) {
      console.error("Failed to load settings from localStorage", error);
    }
    setIsSettingsLoading(false);
  }, []);

  const updateSettings = useCallback((newSettings: Partial<Settings>) => {
    setSettings(prevSettings => {
      const updatedSettings = { ...prevSettings, ...newSettings };
      try {
        localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(updatedSettings));
        toast({
            title: "Settings Updated!",
            description: "Your changes have been saved locally."
        })
      } catch (error) {
        console.error("Failed to save settings to localStorage", error);
         toast({
            title: "Error",
            description: "Could not save settings.",
            variant: "destructive"
        })
      }
      return updatedSettings;
    });
  }, [toast]);

  return (
    <SettingsContext.Provider value={{ ...settings, updateSettings, isSettingsLoading }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
