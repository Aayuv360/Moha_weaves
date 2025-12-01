import { Link, useLocation } from "wouter";
import { Heart, ShoppingBag, User, Menu, Search, X, LogOut, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/sarees", label: "Shop All" },
  { href: "/sarees?featured=true", label: "Featured" },
  { href: "/categories", label: "Categories" },
];

export function Header() {
  const [, setLocation] = useLocation();
  const { user, logout } = useAuth();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: cartCount } = useQuery<{ count: number }>({
    queryKey: ["/api/user/cart/count"],
    enabled: !!user && user.role === "user",
  });

  const { data: wishlistCount } = useQuery<{ count: number }>({
    queryKey: ["/api/user/wishlist/count"],
    enabled: !!user && user.role === "user",
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLocation(`/sarees?search=${encodeURIComponent(searchQuery)}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  const handleLogout = async () => {
    await logout();
    setLocation("/");
  };

  const getDashboardLink = () => {
    if (!user) return null;
    switch (user.role) {
      case "admin": return "/admin/dashboard";
      case "inventory": return "/inventory/dashboard";
      case "store": return "/store/dashboard";
      default: return "/user/orders";
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-background border-b">
      {/* Top bar */}
      <div className="bg-primary text-primary-foreground">
        <div className="max-w-7xl mx-auto px-4 py-2 text-center text-sm">
          Free shipping on orders above ₹2,999
        </div>
      </div>

      {/* Main header */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Mobile menu */}
          <Sheet>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon" data-testid="button-mobile-menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72">
              <div className="flex flex-col gap-6 mt-8">
                <Link href="/" className="font-serif text-2xl font-semibold text-primary">
                  Moha
                </Link>
                <nav className="flex flex-col gap-4">
                  {navLinks.map((link) => (
                    <SheetClose asChild key={link.href}>
                      <Link
                        href={link.href}
                        className="text-lg hover:text-primary transition-colors"
                        data-testid={`link-nav-${link.label.toLowerCase().replace(/\s/g, "-")}`}
                      >
                        {link.label}
                      </Link>
                    </SheetClose>
                  ))}
                </nav>
              </div>
            </SheetContent>
          </Sheet>

          {/* Logo */}
          <Link href="/" className="font-serif text-2xl md:text-3xl font-semibold text-primary" data-testid="link-logo">
            Moha
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium hover:text-primary transition-colors"
                data-testid={`link-nav-${link.label.toLowerCase().replace(/\s/g, "-")}`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Search toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSearchOpen(!searchOpen)}
              data-testid="button-search-toggle"
            >
              {searchOpen ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
            </Button>

            {user && user.role === "user" && (
              <>
                {/* Wishlist */}
                <Link href="/user/wishlist">
                  <Button variant="ghost" size="icon" className="relative" data-testid="link-wishlist">
                    <Heart className="h-5 w-5" />
                    {wishlistCount && wishlistCount.count > 0 && (
                      <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                        {wishlistCount.count}
                      </span>
                    )}
                  </Button>
                </Link>

                {/* Cart */}
                <Link href="/user/cart">
                  <Button variant="ghost" size="icon" className="relative" data-testid="link-cart">
                    <ShoppingBag className="h-5 w-5" />
                    {cartCount && cartCount.count > 0 && (
                      <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                        {cartCount.count}
                      </span>
                    )}
                  </Button>
                </Link>
              </>
            )}

            {/* User menu */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" data-testid="button-user-menu">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  {getDashboardLink() && (
                    <DropdownMenuItem asChild>
                      <Link href={getDashboardLink()!} className="cursor-pointer" data-testid="link-dashboard">
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive" data-testid="button-logout">
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/user/login">
                <Button variant="ghost" size="icon" data-testid="link-login">
                  <User className="h-5 w-5" />
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Search bar */}
        {searchOpen && (
          <div className="pb-4">
            <form onSubmit={handleSearch} className="flex gap-2">
              <Input
                type="search"
                placeholder="Search for sarees..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
                data-testid="input-search"
                autoFocus
              />
              <Button type="submit" data-testid="button-search-submit">
                Search
              </Button>
            </form>
          </div>
        )}
      </div>
    </header>
  );
}
