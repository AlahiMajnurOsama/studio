
"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ShoppingBag, User, Search, X, Sun, Moon } from 'lucide-react';
import { Button } from './ui/button';
import Logo from './icons/Logo';
import { Input } from './ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAppContext } from '@/context/AppContext';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

const ThemeSwitcher = () => {
  const { theme, setTheme } = useAppContext();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" disabled>
        <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        <span className="sr-only">Toggle theme</span>
      </Button>
    );
  }

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <Button variant="ghost" size="icon" onClick={toggleTheme}>
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
};

const SearchBar = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { search, setSearch, sort, setSort } = useAppContext();
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div
      ref={searchRef}
      className={cn(
        'relative transition-all duration-300 ease-in-out w-full md:absolute md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2',
        isSearchOpen ? 'max-w-md' : 'md:w-64'
      )}
    >
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onFocus={() => setIsSearchOpen(true)}
          className="pl-10 w-full rounded-full bg-secondary/50 focus:bg-background"
        />
        {search && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full"
            onClick={() => setSearch('')}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      <div
        className={cn(
          'absolute top-full mt-2 w-full origin-top transition-all duration-200 ease-in-out z-20',
          isSearchOpen
            ? 'scale-y-100 opacity-100'
            : 'scale-y-95 opacity-0 pointer-events-none'
        )}
      >
        <div className="p-4 bg-background rounded-lg shadow-lg border">
          <p className="text-sm font-medium mb-2">Sort by:</p>
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="popularity-desc">Popularity</SelectItem>
              <SelectItem value="price-asc">
                Price: Low to High
              </SelectItem>
              <SelectItem value="price-desc">
                Price: High to Low
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};


const Header = () => {
  const isMobile = useIsMobile();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          <Link href="/" className="flex items-center space-x-2">
            <Logo />
          </Link>
          
          {!isMobile && <SearchBar />}

          <div className="flex items-center gap-2">
            <ThemeSwitcher />
            <Button variant="ghost" size="icon">
              <ShoppingBag />
              <span className="sr-only">Shopping Cart</span>
            </Button>
            <Button variant="ghost" size="icon">
              <User />
              <span className="sr-only">Account</span>
            </Button>
          </div>
        </div>
        {isMobile && <div className="pb-4 px-4"><SearchBar /></div>}
      </div>
    </header>
  );
};

export default Header;
