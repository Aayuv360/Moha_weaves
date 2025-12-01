import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";

const JWT_SECRET = process.env.SESSION_SECRET || "moha-secret-key-2024";

const addressSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  phone: z.string().regex(/^[0-9]{10}$/, "Phone must be a 10-digit number"),
  locality: z.string().min(5, "Locality must be at least 5 characters").max(200),
  city: z.string().min(2, "City must be at least 2 characters").max(100),
  pincode: z.string().regex(/^[0-9]{6}$/, "Pincode must be a 6-digit number"),
  isDefault: z.boolean().optional().default(false),
});

// Auth middleware
function createAuthMiddleware(allowedRoles: string[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = req.cookies?.token;
      if (!token) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; role: string };
      const user = await storage.getUser(decoded.userId);

      if (!user || !allowedRoles.includes(user.role)) {
        return res.status(403).json({ message: "Access denied" });
      }

      (req as any).user = user;
      next();
    } catch {
      return res.status(401).json({ message: "Invalid token" });
    }
  };
}

const authUser = createAuthMiddleware(["user"]);
const authAdmin = createAuthMiddleware(["admin"]);
const authInventory = createAuthMiddleware(["inventory"]);
const authStore = createAuthMiddleware(["store"]);
const authAny = createAuthMiddleware(["user", "admin", "inventory", "store"]);

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // ==================== AUTH ROUTES ====================

  // Get current user
  app.get("/api/auth/me", async (req, res) => {
    try {
      const token = req.cookies?.token;
      if (!token) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
      const user = await storage.getUser(decoded.userId);

      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      const { password, ...safeUser } = user;
      res.json({ user: safeUser });
    } catch {
      res.status(401).json({ message: "Invalid token" });
    }
  });

  // User register
  app.post("/api/auth/user/register", async (req, res) => {
    try {
      const { email, password, name, phone } = req.body;

      const existing = await storage.getUserByEmail(email);
      if (existing) {
        return res.status(400).json({ message: "Email already registered" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await storage.createUser({
        email,
        password: hashedPassword,
        name,
        phone,
        role: "user",
      });

      const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: "7d" });
      res.cookie("token", token, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 });

      const { password: _, ...safeUser } = user;
      res.json({ user: safeUser });
    } catch (error) {
      console.error("Register error:", error);
      res.status(500).json({ message: "Registration failed" });
    }
  });

  // Generic login handler
  const handleLogin = async (req: Request, res: Response, expectedRole: string) => {
    try {
      const { email, password } = req.body;

      const user = await storage.getUserByEmail(email);
      if (!user || user.role !== expectedRole) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      if (!user.isActive) {
        return res.status(401).json({ message: "Account is disabled" });
      }

      const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: "7d" });
      res.cookie("token", token, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 });

      const { password: _, ...safeUser } = user;
      res.json({ user: safeUser });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  };

  app.post("/api/auth/user/login", (req, res) => handleLogin(req, res, "user"));
  app.post("/api/auth/admin/login", (req, res) => handleLogin(req, res, "admin"));
  app.post("/api/auth/inventory/login", (req, res) => handleLogin(req, res, "inventory"));
  app.post("/api/auth/store/login", (req, res) => handleLogin(req, res, "store"));

  // Logout
  app.post("/api/auth/logout", (req, res) => {
    res.clearCookie("token");
    res.json({ success: true });
  });

  // ==================== PUBLIC ROUTES ====================

  // Categories
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  // Colors
  app.get("/api/colors", async (req, res) => {
    try {
      const colors = await storage.getColors();
      res.json(colors);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch colors" });
    }
  });

  // Fabrics
  app.get("/api/fabrics", async (req, res) => {
    try {
      const fabrics = await storage.getFabrics();
      res.json(fabrics);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch fabrics" });
    }
  });

  // Sarees
  app.get("/api/sarees", async (req, res) => {
    try {
      const { search, category, color, fabric, featured, minPrice, maxPrice, sort, limit } = req.query;

      const sarees = await storage.getSarees({
        search: search as string,
        category: category as string,
        color: color as string,
        fabric: fabric as string,
        featured: featured === "true",
        minPrice: minPrice ? parseFloat(minPrice as string) : undefined,
        maxPrice: maxPrice ? parseFloat(maxPrice as string) : undefined,
        sort: sort as string,
        limit: limit ? parseInt(limit as string) : undefined,
        distributionChannel: "online",
      });

      res.json(sarees);
    } catch (error) {
      console.error("Sarees fetch error:", error);
      res.status(500).json({ message: "Failed to fetch sarees" });
    }
  });

  app.get("/api/sarees/:id", async (req, res) => {
    try {
      const saree = await storage.getSaree(req.params.id);
      if (!saree) {
        return res.status(404).json({ message: "Saree not found" });
      }
      res.json(saree);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch saree" });
    }
  });

  // ==================== USER ROUTES ====================

  // Cart
  app.get("/api/user/cart", authUser, async (req, res) => {
    try {
      const items = await storage.getCartItems((req as any).user.id);
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch cart" });
    }
  });

  app.get("/api/user/cart/count", authUser, async (req, res) => {
    try {
      const count = await storage.getCartCount((req as any).user.id);
      res.json({ count });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch cart count" });
    }
  });

  app.post("/api/user/cart", authUser, async (req, res) => {
    try {
      const { sareeId, quantity = 1 } = req.body;
      const item = await storage.addToCart({
        userId: (req as any).user.id,
        sareeId,
        quantity,
      });
      res.json(item);
    } catch (error) {
      res.status(500).json({ message: "Failed to add to cart" });
    }
  });

  app.patch("/api/user/cart/:id", authUser, async (req, res) => {
    try {
      const { quantity } = req.body;
      const item = await storage.updateCartItem(req.params.id, quantity);
      res.json(item);
    } catch (error) {
      res.status(500).json({ message: "Failed to update cart" });
    }
  });

  app.delete("/api/user/cart/:id", authUser, async (req, res) => {
    try {
      await storage.removeFromCart(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to remove from cart" });
    }
  });

  // Wishlist
  app.get("/api/user/wishlist", authUser, async (req, res) => {
    try {
      const items = await storage.getWishlistItems((req as any).user.id);
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch wishlist" });
    }
  });

  app.get("/api/user/wishlist/count", authUser, async (req, res) => {
    try {
      const count = await storage.getWishlistCount((req as any).user.id);
      res.json({ count });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch wishlist count" });
    }
  });

  app.post("/api/user/wishlist", authUser, async (req, res) => {
    try {
      const { sareeId } = req.body;
      const item = await storage.addToWishlist({
        userId: (req as any).user.id,
        sareeId,
      });
      res.json(item);
    } catch (error) {
      res.status(500).json({ message: "Failed to add to wishlist" });
    }
  });

  app.delete("/api/user/wishlist/:sareeId", authUser, async (req, res) => {
    try {
      await storage.removeFromWishlist((req as any).user.id, req.params.sareeId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to remove from wishlist" });
    }
  });

  // Orders
  app.get("/api/user/orders", authUser, async (req, res) => {
    try {
      const orders = await storage.getOrders((req as any).user.id);
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.get("/api/user/orders/:id", authUser, async (req, res) => {
    try {
      const order = await storage.getOrder(req.params.id);
      if (!order || order.userId !== (req as any).user.id) {
        return res.status(404).json({ message: "Order not found" });
      }
      res.json(order);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch order" });
    }
  });

  app.post("/api/user/orders", authUser, async (req, res) => {
    try {
      const { shippingAddress, phone, notes } = req.body;
      const userId = (req as any).user.id;

      const cartItems = await storage.getCartItems(userId);
      if (cartItems.length === 0) {
        return res.status(400).json({ message: "Cart is empty" });
      }

      const totalAmount = cartItems.reduce((sum, item) => {
        const price = typeof item.saree.price === "string" ? parseFloat(item.saree.price) : item.saree.price;
        return sum + price * item.quantity;
      }, 0);

      const order = await storage.createOrder(
        {
          userId,
          totalAmount: totalAmount.toString(),
          shippingAddress,
          phone,
          notes,
          status: "pending",
        },
        cartItems.map((item) => ({
          sareeId: item.sareeId,
          quantity: item.quantity,
          price: item.saree.price,
        }))
      );

      await storage.clearCart(userId);

      res.json({ orderId: order.id });
    } catch (error) {
      console.error("Order error:", error);
      res.status(500).json({ message: "Failed to place order" });
    }
  });

  // User Addresses
  app.get("/api/user/addresses", authUser, async (req, res) => {
    try {
      const addresses = await storage.getUserAddresses((req as any).user.id);
      res.json(addresses);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch addresses" });
    }
  });

  app.post("/api/user/addresses", authUser, async (req, res) => {
    try {
      const validation = addressSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ message: validation.error.errors[0].message });
      }
      const address = await storage.createUserAddress({
        ...validation.data,
        userId: (req as any).user.id,
      });
      res.json(address);
    } catch (error) {
      res.status(500).json({ message: "Failed to create address" });
    }
  });

  app.patch("/api/user/addresses/:id", authUser, async (req, res) => {
    try {
      const address = await storage.getUserAddress(req.params.id);
      if (!address || address.userId !== (req as any).user.id) {
        return res.status(404).json({ message: "Address not found" });
      }
      const validation = addressSchema.partial().safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ message: validation.error.errors[0].message });
      }
      const updated = await storage.updateUserAddress(req.params.id, validation.data);
      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: "Failed to update address" });
    }
  });

  app.patch("/api/user/addresses/:id/default", authUser, async (req, res) => {
    try {
      const address = await storage.setDefaultAddress((req as any).user.id, req.params.id);
      if (!address) {
        return res.status(404).json({ message: "Address not found" });
      }
      res.json(address);
    } catch (error) {
      res.status(500).json({ message: "Failed to set default address" });
    }
  });

  app.delete("/api/user/addresses/:id", authUser, async (req, res) => {
    try {
      const address = await storage.getUserAddress(req.params.id);
      if (!address || address.userId !== (req as any).user.id) {
        return res.status(404).json({ message: "Address not found" });
      }
      await storage.deleteUserAddress(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete address" });
    }
  });

  // Pincode availability check (public)
  app.get("/api/pincodes/:pincode/check", async (req, res) => {
    try {
      const pincode = await storage.checkPincodeAvailability(req.params.pincode);
      if (pincode) {
        res.json({
          available: true,
          city: pincode.city,
          state: pincode.state,
          deliveryDays: pincode.deliveryDays,
        });
      } else {
        res.json({
          available: false,
          message: "Delivery not available in this area",
        });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to check pincode" });
    }
  });

  // ==================== ADMIN ROUTES ====================

  app.get("/api/admin/stats", authAdmin, async (req, res) => {
    try {
      const stats = await storage.getAdminStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  app.get("/api/admin/orders", authAdmin, async (req, res) => {
    try {
      const { status, limit } = req.query;
      const orders = await storage.getAllOrders({
        status: status as string,
        limit: limit ? parseInt(limit as string) : undefined,
      });
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.patch("/api/admin/orders/:id/status", authAdmin, async (req, res) => {
    try {
      const { status } = req.body;
      const order = await storage.updateOrderStatus(req.params.id, status);
      res.json(order);
    } catch (error) {
      res.status(500).json({ message: "Failed to update order" });
    }
  });

  app.get("/api/admin/users", authAdmin, async (req, res) => {
    try {
      const { role } = req.query;
      const users = await storage.getUsers({ role: role as string });
      res.json(users.map(({ password, ...u }) => u));
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.post("/api/admin/users", authAdmin, async (req, res) => {
    try {
      const { email, password, name, phone, role, storeId } = req.body;
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await storage.createUser({
        email,
        password: hashedPassword,
        name,
        phone,
        role,
        storeId,
      });
      const { password: _, ...safeUser } = user;
      res.json(safeUser);
    } catch (error) {
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  // Admin saree management
  app.get("/api/admin/sarees", authAdmin, async (req, res) => {
    try {
      const sarees = await storage.getSarees({});
      res.json(sarees);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch sarees" });
    }
  });

  app.post("/api/admin/sarees", authAdmin, async (req, res) => {
    try {
      const saree = await storage.createSaree(req.body);
      res.json(saree);
    } catch (error) {
      res.status(500).json({ message: "Failed to create saree" });
    }
  });

  app.patch("/api/admin/sarees/:id", authAdmin, async (req, res) => {
    try {
      const saree = await storage.updateSaree(req.params.id, req.body);
      res.json(saree);
    } catch (error) {
      res.status(500).json({ message: "Failed to update saree" });
    }
  });

  app.delete("/api/admin/sarees/:id", authAdmin, async (req, res) => {
    try {
      await storage.deleteSaree(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete saree" });
    }
  });

  // Admin category management
  app.post("/api/admin/categories", authAdmin, async (req, res) => {
    try {
      const category = await storage.createCategory(req.body);
      res.json(category);
    } catch (error) {
      res.status(500).json({ message: "Failed to create category" });
    }
  });

  app.patch("/api/admin/categories/:id", authAdmin, async (req, res) => {
    try {
      const category = await storage.updateCategory(req.params.id, req.body);
      res.json(category);
    } catch (error) {
      res.status(500).json({ message: "Failed to update category" });
    }
  });

  // Admin color management
  app.post("/api/admin/colors", authAdmin, async (req, res) => {
    try {
      const color = await storage.createColor(req.body);
      res.json(color);
    } catch (error) {
      res.status(500).json({ message: "Failed to create color" });
    }
  });

  // Admin fabric management
  app.post("/api/admin/fabrics", authAdmin, async (req, res) => {
    try {
      const fabric = await storage.createFabric(req.body);
      res.json(fabric);
    } catch (error) {
      res.status(500).json({ message: "Failed to create fabric" });
    }
  });

  // Admin store management
  app.get("/api/admin/stores", authAdmin, async (req, res) => {
    try {
      const stores = await storage.getStores();
      res.json(stores);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch stores" });
    }
  });

  app.post("/api/admin/stores", authAdmin, async (req, res) => {
    try {
      const store = await storage.createStore(req.body);
      res.json(store);
    } catch (error) {
      res.status(500).json({ message: "Failed to create store" });
    }
  });

  // ==================== INVENTORY ROUTES ====================

  app.get("/api/inventory/low-stock", authInventory, async (req, res) => {
    try {
      const items = await storage.getLowStockSarees(10);
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch low stock items" });
    }
  });

  app.get("/api/inventory/requests", authInventory, async (req, res) => {
    try {
      const { status } = req.query;
      const requests = await storage.getStockRequests({ status: status as string });
      res.json(requests);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch requests" });
    }
  });

  app.patch("/api/inventory/requests/:id/status", authInventory, async (req, res) => {
    try {
      const { status } = req.body;
      const request = await storage.updateStockRequestStatus(
        req.params.id,
        status,
        (req as any).user.id
      );
      res.json(request);
    } catch (error) {
      res.status(500).json({ message: "Failed to update request" });
    }
  });

  app.get("/api/inventory/orders", authInventory, async (req, res) => {
    try {
      const { status } = req.query;
      const orders = await storage.getAllOrders({ status: status as string });
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.patch("/api/inventory/orders/:id/status", authInventory, async (req, res) => {
    try {
      const { status } = req.body;
      const order = await storage.updateOrderStatus(req.params.id, status);
      res.json(order);
    } catch (error) {
      res.status(500).json({ message: "Failed to update order" });
    }
  });

  app.patch("/api/inventory/sarees/:id/distribution", authInventory, async (req, res) => {
    try {
      const { channel } = req.body;
      const saree = await storage.updateSaree(req.params.id, { distributionChannel: channel });
      res.json(saree);
    } catch (error) {
      res.status(500).json({ message: "Failed to update distribution" });
    }
  });

  app.patch("/api/inventory/sarees/:id/stock", authInventory, async (req, res) => {
    try {
      const { totalStock, onlineStock } = req.body;
      const saree = await storage.updateSaree(req.params.id, { totalStock, onlineStock });
      res.json(saree);
    } catch (error) {
      res.status(500).json({ message: "Failed to update stock" });
    }
  });

  app.get("/api/inventory/stock-distribution", authInventory, async (req, res) => {
    try {
      const distribution = await storage.getStockDistribution();
      res.json(distribution);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch stock distribution" });
    }
  });

  // Inventory saree management (moved from admin)
  app.get("/api/inventory/sarees", authInventory, async (req, res) => {
    try {
      const sarees = await storage.getSarees({});
      res.json(sarees);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch sarees" });
    }
  });

  app.post("/api/inventory/sarees", authInventory, async (req, res) => {
    try {
      const saree = await storage.createSaree(req.body);
      res.json(saree);
    } catch (error) {
      res.status(500).json({ message: "Failed to create saree" });
    }
  });

  app.patch("/api/inventory/sarees/:id", authInventory, async (req, res) => {
    try {
      const saree = await storage.updateSaree(req.params.id, req.body);
      res.json(saree);
    } catch (error) {
      res.status(500).json({ message: "Failed to update saree" });
    }
  });

  app.delete("/api/inventory/sarees/:id", authInventory, async (req, res) => {
    try {
      await storage.deleteSaree(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete saree" });
    }
  });

  // ==================== STORE ROUTES ====================

  app.get("/api/store/stats", authStore, async (req, res) => {
    try {
      const user = (req as any).user;
      if (!user.storeId) {
        return res.status(400).json({ message: "No store assigned" });
      }
      const stats = await storage.getStoreStats(user.storeId);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  app.get("/api/store/inventory", authStore, async (req, res) => {
    try {
      const user = (req as any).user;
      if (!user.storeId) {
        return res.status(400).json({ message: "No store assigned" });
      }
      const inventory = await storage.getStoreInventory(user.storeId);
      res.json(inventory);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch inventory" });
    }
  });

  app.get("/api/store/products", authStore, async (req, res) => {
    try {
      const user = (req as any).user;
      if (!user.storeId) {
        return res.status(400).json({ message: "No store assigned" });
      }
      const products = await storage.getShopAvailableProducts(user.storeId);
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.get("/api/store/sales", authStore, async (req, res) => {
    try {
      const user = (req as any).user;
      if (!user.storeId) {
        return res.status(400).json({ message: "No store assigned" });
      }
      const { limit } = req.query;
      const sales = await storage.getStoreSales(
        user.storeId,
        limit ? parseInt(limit as string) : undefined
      );
      res.json(sales);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch sales" });
    }
  });

  app.post("/api/store/sales", authStore, async (req, res) => {
    try {
      const user = (req as any).user;
      if (!user.storeId) {
        return res.status(400).json({ message: "No store assigned" });
      }
      const { customerName, customerPhone, items, saleType } = req.body;

      const totalAmount = items.reduce(
        (sum: number, item: any) => sum + parseFloat(item.price) * item.quantity,
        0
      );

      const sale = await storage.createStoreSale(
        {
          storeId: user.storeId,
          soldBy: user.id,
          customerName,
          customerPhone,
          totalAmount: totalAmount.toString(),
          saleType,
        },
        items
      );
      res.json(sale);
    } catch (error) {
      res.status(500).json({ message: "Failed to create sale" });
    }
  });

  app.get("/api/store/requests", authStore, async (req, res) => {
    try {
      const user = (req as any).user;
      if (!user.storeId) {
        return res.status(400).json({ message: "No store assigned" });
      }
      const requests = await storage.getStockRequests({ storeId: user.storeId });
      res.json(requests);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch requests" });
    }
  });

  app.post("/api/store/requests", authStore, async (req, res) => {
    try {
      const user = (req as any).user;
      if (!user.storeId) {
        return res.status(400).json({ message: "No store assigned" });
      }
      const { sareeId, quantity, notes } = req.body;
      const request = await storage.createStockRequest({
        storeId: user.storeId,
        requestedBy: user.id,
        sareeId,
        quantity,
        notes,
      });
      res.json(request);
    } catch (error) {
      res.status(500).json({ message: "Failed to create request" });
    }
  });

  return httpServer;
}
