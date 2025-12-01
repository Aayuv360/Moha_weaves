import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ShoppingBag, CreditCard, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import type { CartItemWithSaree } from "@shared/schema";

const checkoutSchema = z.object({
  shippingAddress: z.string().min(10, "Please enter a complete address"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  notes: z.string().optional(),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

export default function Checkout() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderId, setOrderId] = useState("");

  const { data: cartItems, isLoading } = useQuery<CartItemWithSaree[]>({
    queryKey: ["/api/user/cart"],
    enabled: !!user,
  });

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      shippingAddress: "",
      phone: user?.phone || "",
      notes: "",
    },
  });

  const placeOrderMutation = useMutation({
    mutationFn: async (data: CheckoutFormValues) => {
      const response = await apiRequest("POST", "/api/user/orders", data);
      return response.json();
    },
    onSuccess: (data: { orderId: string }) => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/cart"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/cart/count"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/orders"] });
      setOrderId(data.orderId);
      setOrderSuccess(true);
    },
    onError: (error: Error) => {
      toast({ title: "Order failed", description: error.message || "Failed to place order.", variant: "destructive" });
    },
  });

  const formatPrice = (price: string | number) => {
    const numPrice = typeof price === "string" ? parseFloat(price) : price;
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(numPrice);
  };

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h2 className="text-2xl font-semibold mb-2">Please login to checkout</h2>
        <Link to="/user/login">
          <Button data-testid="button-login">Login</Button>
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Skeleton className="h-8 w-48 mb-8" />
        <div className="grid lg:grid-cols-2 gap-8">
          <Skeleton className="h-96" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h2 className="text-2xl font-semibold mb-2">Your cart is empty</h2>
        <Link to="/sarees">
          <Button data-testid="button-shop">Continue Shopping</Button>
        </Link>
      </div>
    );
  }

  if (orderSuccess) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
        </div>
        <h2 className="text-2xl font-semibold mb-2" data-testid="text-order-success">Order Placed Successfully!</h2>
        <p className="text-muted-foreground mb-2">Thank you for shopping with Moha.</p>
        <p className="text-sm text-muted-foreground mb-6">
          Order ID: <span className="font-medium" data-testid="text-order-id">#{orderId.slice(0, 8).toUpperCase()}</span>
        </p>
        <div className="flex flex-col gap-3">
          <Link to={`/user/orders/${orderId}`}>
            <Button className="w-full" data-testid="button-view-order">View Order</Button>
          </Link>
          <Link to="/sarees">
            <Button variant="outline" className="w-full" data-testid="button-continue-shopping">
              Continue Shopping
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const subtotal = cartItems.reduce((sum, item) => {
    const price = typeof item.saree.price === "string" ? parseFloat(item.saree.price) : item.saree.price;
    return sum + price * item.quantity;
  }, 0);

  const shipping = subtotal >= 2999 ? 0 : 199;
  const total = subtotal + shipping;

  const onSubmit = (values: CheckoutFormValues) => {
    placeOrderMutation.mutate(values);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link to="/user/cart">
        <Button variant="ghost" className="mb-6" data-testid="button-back">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Cart
        </Button>
      </Link>

      <h1 className="font-serif text-3xl font-semibold mb-8" data-testid="text-page-title">Checkout</h1>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Shipping Form */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Shipping Information</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter your phone number"
                            data-testid="input-phone"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="shippingAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Shipping Address</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Enter your complete shipping address"
                            className="min-h-[100px]"
                            data-testid="input-address"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Order Notes (Optional)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Any special instructions for delivery"
                            data-testid="input-notes"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={placeOrderMutation.isPending}
                    data-testid="button-place-order"
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    {placeOrderMutation.isPending ? "Placing Order..." : `Pay ${formatPrice(total)}`}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="w-16 h-20 rounded-md overflow-hidden bg-muted flex-shrink-0">
                      <img
                        src={item.saree.imageUrl || "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=100&h=150&fit=crop"}
                        alt={item.saree.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm line-clamp-1">{item.saree.name}</h4>
                      <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                      <p className="text-sm font-medium text-primary">{formatPrice(item.saree.price)}</p>
                    </div>
                  </div>
                ))}
              </div>

              <Separator className="my-4" />

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>
                    {shipping === 0 ? (
                      <span className="text-green-600">Free</span>
                    ) : (
                      formatPrice(shipping)
                    )}
                  </span>
                </div>
              </div>

              <Separator className="my-4" />

              <div className="flex justify-between font-semibold text-lg">
                <span>Total</span>
                <span data-testid="text-total">{formatPrice(total)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
