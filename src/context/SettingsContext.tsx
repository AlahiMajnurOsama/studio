
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface Settings {
  brandName: string;
  receiptThanksText: string;
  heroImageUrls: [string, string, string];
  isChatEnabled: boolean;
}

interface SettingsContextType extends Settings {
  updateSettings: (newSettings: Partial<Settings>) => Promise<void>;
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
  isChatEnabled: true,
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

  const updateSettings = useCallback(async (newSettings: Partial<Settings>) => {
    return new Promise<void>((resolve) => {
      try {
        const updatedSettings = { ...settings, ...newSettings };
        setSettings(updatedSettings);
        localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(updatedSettings));
        
        // Use a timeout to ensure the state update is processed before showing the toast
        setTimeout(() => {
          toast({
            title: "Settings Updated!",
            description: "Your changes have been saved locally."
          });
          resolve();
        }, 0);

      } catch (error) {
        console.error("Failed to save settings to localStorage", error);
        toast({
          title: "Error",
          description: "Could not save settings.",
          variant: "destructive"
        });
        resolve();
      }
    });
  }, [settings, toast]);

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
