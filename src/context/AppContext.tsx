"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
  useTransition,
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
  isPageLoading: boolean;
  setPageLoading: (isLoading: boolean) => void;
  isInitialLoading: boolean;
  setIsInitialLoading: (isLoading: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setThemeState] = useState<Theme>('dark');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('popularity-desc');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isPageLoading, setPageLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const storedTheme = localStorage.getItem('theme') as Theme | null;
    const initialTheme = storedTheme || 'dark';
    setThemeState(initialTheme);
    document.documentElement.className = initialTheme;
    setIsInitialLoading(false);
  }, []);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.className = newTheme;
  };

  const toggleCategory = useCallback((category: string) => {
    startTransition(() => {
      setSelectedCategories((prev) =>
        prev.includes(category)
          ? prev.filter((c) => c !== category)
          : [...prev, category]
      );
    });
  }, []);

  const clearFilters = useCallback(() => {
    startTransition(() => {
      setPriceRange([0, 1000]);
      setSelectedCategories([]);
    });
  }, []);

  useEffect(() => {
    setPageLoading(isPending);
  }, [isPending]);

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
    isPageLoading: isPageLoading || isPending,
    setPageLoading,
    isInitialLoading,
    setIsInitialLoading,
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
