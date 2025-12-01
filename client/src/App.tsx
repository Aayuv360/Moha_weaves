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
import AdminSarees from "@/pages/admin/Sarees";
import AdminCategories from "@/pages/admin/Categories";
import AdminColors from "@/pages/admin/Colors";
import AdminFabrics from "@/pages/admin/Fabrics";
import AdminUsers from "@/pages/admin/Users";
import AdminStaff from "@/pages/admin/Staff";
import AdminStores from "@/pages/admin/Stores";
import AdminOrders from "@/pages/admin/Orders";

import InventoryLogin from "@/pages/inventory/Login";
import InventoryDashboard from "@/pages/inventory/Dashboard";
import InventoryStock from "@/pages/inventory/Stock";
import InventoryRequests from "@/pages/inventory/Requests";
import InventoryOrders from "@/pages/inventory/Orders";

import StoreLogin from "@/pages/store/Login";
import StoreDashboard from "@/pages/store/Dashboard";
import StoreSale from "@/pages/store/Sale";
import StoreInventoryPage from "@/pages/store/Inventory";
import StoreRequests from "@/pages/store/Requests";
import StoreHistory from "@/pages/store/History";

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
        <Route path="/admin/sarees" component={AdminSarees} />
        <Route path="/admin/categories" component={AdminCategories} />
        <Route path="/admin/colors" component={AdminColors} />
        <Route path="/admin/fabrics" component={AdminFabrics} />
        <Route path="/admin/users" component={AdminUsers} />
        <Route path="/admin/staff" component={AdminStaff} />
        <Route path="/admin/stores" component={AdminStores} />
        <Route path="/admin/orders" component={AdminOrders} />
        
        {/* Inventory module */}
        <Route path="/inventory/login" component={InventoryLogin} />
        <Route path="/inventory/dashboard" component={InventoryDashboard} />
        <Route path="/inventory/stock" component={InventoryStock} />
        <Route path="/inventory/requests" component={InventoryRequests} />
        <Route path="/inventory/orders" component={InventoryOrders} />
        
        {/* Store module */}
        <Route path="/store/login" component={StoreLogin} />
        <Route path="/store/dashboard" component={StoreDashboard} />
        <Route path="/store/sale" component={StoreSale} />
        <Route path="/store/inventory" component={StoreInventoryPage} />
        <Route path="/store/requests" component={StoreRequests} />
        <Route path="/store/history" component={StoreHistory} />
        
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
