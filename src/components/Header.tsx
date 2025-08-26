"use client";

import Link from "next/link";
import Logo from "./icons/Logo";
import { Heart, Search, ShoppingBag, User } from "lucide-react";
import { Button } from "./ui/button";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/#products", label: "Product" },
  { href: "/#services", label: "Services" },
  { href: "/#about", label: "About Us" },
  { href: "/#testimonials", label: "Testimonials" },
];

const Header = () => {
  const pathname = usePathname();
  return (
    <header className="fixed top-4 left-0 right-0 z-50 w-full">
      <div className="container mx-auto px-4">
        <div className="bg-background/80 backdrop-blur-md rounded-2xl shadow-lg flex items-center h-20 px-6 relative overflow-hidden">
          <div className="mr-8">
            <Link href="/" className="flex items-center space-x-2">
              <Logo />
            </Link>
          </div>

          <div className="absolute left-1/2 top-0 h-full flex items-center -translate-x-1/2">
            <nav className="relative h-full flex items-center justify-center">
                <div className="absolute inset-0 bg-background" style={{
                    clipPath: 'polygon(10% 0, 90% 0, 100% 100%, 0% 100%)'
                }}></div>
                 <div className="absolute inset-0 bg-background/90 backdrop-blur-sm" style={{
                    clipPath: 'path("M 0 0 C 50 0, 50 20, 100 20 L 100 0 L 0 0 Z M 500 0 C 450 0, 450 20, 400 20 L 400 0 L 500 0 Z")'
                }}></div>
                <div className="absolute -bottom-1 w-[105%] h-24 bg-background" style={{
                  clipPath: 'path("M -10 80 C 100 80, 80 20, 250 20 C 420 20, 400 80, 510 80 L 510 100 L -10 100 Z")'
                }}>
                </div>
              <ul className="flex items-center gap-x-8 z-10">
                {navLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className={cn(
                        "text-sm font-medium transition-colors hover:text-primary",
                        pathname === link.href
                          ? "text-primary font-semibold"
                          : "text-muted-foreground"
                      )}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          <div className="flex flex-1 items-center justify-end space-x-2">
            <nav className="flex items-center gap-2">
              <Button variant="ghost" size="icon">
                <Search />
                <span className="sr-only">Search</span>
              </Button>
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
              <Button variant="ghost" size="icon">
                <User />
                <span className="sr-only">Account</span>
              </Button>
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
