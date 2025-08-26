import Link from "next/link";
import Logo from "./icons/Logo";
import { Heart, ShoppingBag } from "lucide-react";
import { Button } from "./ui/button";

const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Logo />
          </Link>
        </div>
        
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <nav className="flex items-center gap-2">
            <Button variant="ghost" size="icon" asChild>
                <Link href="/wishlist">
                    <Heart />
                    <span className="sr-only">Wishlist</span>
                </Link>
            </Button>
            <Button variant="ghost" size="icon">
                <ShoppingBag />
                <span className="sr-only">Shopping Cart</span>
            </Button>
            <Button className="transition-transform active:scale-95">
                Sign In
            </Button>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
