"use client";

import Link from "next/link";
import Logo from "./icons/Logo";
import { ShoppingBag, User } from "lucide-react";
import { Button } from "./ui/button";

const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full bg-background/80 backdrop-blur-md shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <Logo />
            </Link>
          </div>

          <div className="flex items-center gap-2">
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
      </div>
    </header>
  );
};

export default Header;
