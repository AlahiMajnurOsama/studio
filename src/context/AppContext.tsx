"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from 'react';

type Theme = 'light' | 'dark';

interface AppContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  search: string;
  setSearch: (search: string) => void;
  sort: string;
  setSort: (sort: string) => void;
  priceRange: [number, number];
  setPriceRange: (range: [number, number]) => void;
  selectedCategories: string[];
  setSelectedCategories: (categories: string[]) => void;
  toggleCategory: (category: string) => void;
  clearFilters: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setThemeState] = useState<Theme>('dark');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('popularity-desc');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  useEffect(() => {
    const storedTheme = localStorage.getItem('theme') as Theme | null;
    const initialTheme = storedTheme || 'dark';
    setThemeState(initialTheme);
    document.documentElement.className = initialTheme;
  }, []);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.className = newTheme;
  };

  const toggleCategory = useCallback((category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  }, []);

  const clearFilters = useCallback(() => {
    setPriceRange([0, 1000]);
    setSelectedCategories([]);
  }, []);

  const value = {
    theme,
    setTheme,
    search,
    setSearch,
    sort,
    setSort,
    priceRange,
    setPriceRange,
    selectedCategories,
    setSelectedCategories,
    toggleCategory,
    clearFilters,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
