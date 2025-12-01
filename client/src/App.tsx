import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/lib/auth";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

import NotFound from "@/pages/not-found";
import Home from "@/pages/user/Home";
import Sarees from "@/pages/user/Sarees";
import SareeDetail from "@/pages/user/SareeDetail";
import Categories from "@/pages/user/Categories";
import Cart from "@/pages/user/Cart";
import Wishlist from "@/pages/user/Wishlist";
import Orders from "@/pages/user/Orders";
import Checkout from "@/pages/user/Checkout";
import UserLogin from "@/pages/user/Login";
import UserRegister from "@/pages/user/Register";

import AdminLogin from "@/pages/admin/Login";
import AdminDashboard from "@/pages/admin/Dashboard";

import InventoryLogin from "@/pages/inventory/Login";
import InventoryDashboard from "@/pages/inventory/Dashboard";

import StoreLogin from "@/pages/store/Login";
import StoreDashboard from "@/pages/store/Dashboard";

function UserLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

function Router() {
  const [location] = useLocation();
  const { user, isLoading } = useAuth();
  
  const isAuthPage = [
    "/user/login",
    "/user/register",
    "/admin/login",
    "/inventory/login",
    "/store/login",
  ].includes(location);

  const isDashboardPage = [
    "/admin/dashboard",
    "/inventory/dashboard",
    "/store/dashboard",
  ].some((path) => location.startsWith(path.replace("/dashboard", "")));

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">
          <div className="font-serif text-3xl font-semibold text-primary">Moha</div>
        </div>
      </div>
    );
  }

  if (isAuthPage || isDashboardPage) {
    return (
      <Switch>
        {/* User auth */}
        <Route path="/user/login" component={UserLogin} />
        <Route path="/user/register" component={UserRegister} />
        
        {/* Admin module */}
        <Route path="/admin/login" component={AdminLogin} />
        <Route path="/admin/dashboard" component={AdminDashboard} />
        <Route path="/admin/:rest*" component={AdminDashboard} />
        
        {/* Inventory module */}
        <Route path="/inventory/login" component={InventoryLogin} />
        <Route path="/inventory/dashboard" component={InventoryDashboard} />
        <Route path="/inventory/:rest*" component={InventoryDashboard} />
        
        {/* Store module */}
        <Route path="/store/login" component={StoreLogin} />
        <Route path="/store/dashboard" component={StoreDashboard} />
        <Route path="/store/:rest*" component={StoreDashboard} />
        
        <Route component={NotFound} />
      </Switch>
    );
  }

  return (
    <UserLayout>
      <Switch>
        {/* User public pages */}
        <Route path="/" component={Home} />
        <Route path="/sarees" component={Sarees} />
        <Route path="/sarees/:id" component={SareeDetail} />
        <Route path="/categories" component={Categories} />
        
        {/* User auth pages */}
        <Route path="/user/login" component={UserLogin} />
        <Route path="/user/register" component={UserRegister} />
        
        {/* User protected pages */}
        <Route path="/user/cart" component={Cart} />
        <Route path="/user/wishlist" component={Wishlist} />
        <Route path="/user/orders" component={Orders} />
        <Route path="/user/checkout" component={Checkout} />
        
        {/* Fallback */}
        <Route component={NotFound} />
      </Switch>
    </UserLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Router />
          <Toaster />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
