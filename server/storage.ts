import {
  users, categories, colors, fabrics, stores, sarees, storeInventory,
  wishlist, cart, orders, orderItems, storeSales, storeSaleItems, stockRequests,
  type User, type InsertUser, type Category, type InsertCategory,
  type Color, type InsertColor, type Fabric, type InsertFabric,
  type Store, type InsertStore, type Saree, type InsertSaree,
  type StoreInventory, type InsertStoreInventory,
  type WishlistItem, type InsertWishlistItem,
  type CartItem, type InsertCartItem,
  type Order, type InsertOrder, type OrderItem, type InsertOrderItem,
  type StoreSale, type InsertStoreSale, type StoreSaleItem, type InsertStoreSaleItem,
  type StockRequest, type InsertStockRequest,
  type SareeWithDetails, type CartItemWithSaree, type WishlistItemWithSaree,
  type OrderWithItems, type StockRequestWithDetails, type StoreSaleWithItems,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, or, ilike, desc, asc, sql, gte, lte, inArray } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getUsers(filters?: { role?: string }): Promise<User[]>;
  updateUser(id: string, data: Partial<InsertUser>): Promise<User | undefined>;

  // Categories
  getCategories(): Promise<Category[]>;
  getCategory(id: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: string, data: Partial<InsertCategory>): Promise<Category | undefined>;
  deleteCategory(id: string): Promise<boolean>;

  // Colors
  getColors(): Promise<Color[]>;
  getColor(id: string): Promise<Color | undefined>;
  createColor(color: InsertColor): Promise<Color>;
  updateColor(id: string, data: Partial<InsertColor>): Promise<Color | undefined>;
  deleteColor(id: string): Promise<boolean>;

  // Fabrics
  getFabrics(): Promise<Fabric[]>;
  getFabric(id: string): Promise<Fabric | undefined>;
  createFabric(fabric: InsertFabric): Promise<Fabric>;
  updateFabric(id: string, data: Partial<InsertFabric>): Promise<Fabric | undefined>;
  deleteFabric(id: string): Promise<boolean>;

  // Stores
  getStores(): Promise<Store[]>;
  getStore(id: string): Promise<Store | undefined>;
  createStore(store: InsertStore): Promise<Store>;
  updateStore(id: string, data: Partial<InsertStore>): Promise<Store | undefined>;

  // Sarees
  getSarees(filters?: {
    search?: string;
    category?: string;
    color?: string;
    fabric?: string;
    featured?: boolean;
    minPrice?: number;
    maxPrice?: number;
    distributionChannel?: string;
    sort?: string;
    limit?: number;
  }): Promise<SareeWithDetails[]>;
  getSaree(id: string): Promise<SareeWithDetails | undefined>;
  createSaree(saree: InsertSaree): Promise<Saree>;
  updateSaree(id: string, data: Partial<InsertSaree>): Promise<Saree | undefined>;
  deleteSaree(id: string): Promise<boolean>;
  getLowStockSarees(threshold?: number): Promise<SareeWithDetails[]>;

  // Cart
  getCartItems(userId: string): Promise<CartItemWithSaree[]>;
  getCartCount(userId: string): Promise<number>;
  addToCart(item: InsertCartItem): Promise<CartItem>;
  updateCartItem(id: string, quantity: number): Promise<CartItem | undefined>;
  removeFromCart(id: string): Promise<boolean>;
  clearCart(userId: string): Promise<boolean>;

  // Wishlist
  getWishlistItems(userId: string): Promise<WishlistItemWithSaree[]>;
  getWishlistCount(userId: string): Promise<number>;
  addToWishlist(item: InsertWishlistItem): Promise<WishlistItem>;
  removeFromWishlist(userId: string, sareeId: string): Promise<boolean>;
  isInWishlist(userId: string, sareeId: string): Promise<boolean>;

  // Orders
  getOrders(userId: string): Promise<OrderWithItems[]>;
  getOrder(id: string): Promise<OrderWithItems | undefined>;
  getAllOrders(filters?: { status?: string; limit?: number }): Promise<Order[]>;
  createOrder(order: InsertOrder, items: InsertOrderItem[]): Promise<Order>;
  updateOrderStatus(id: string, status: string): Promise<Order | undefined>;

  // Store Inventory
  getStoreInventory(storeId: string): Promise<(StoreInventory & { saree: SareeWithDetails })[]>;
  updateStoreInventory(storeId: string, sareeId: string, quantity: number): Promise<StoreInventory>;

  // Store Sales
  getStoreSales(storeId: string, limit?: number): Promise<StoreSaleWithItems[]>;
  createStoreSale(sale: InsertStoreSale, items: InsertStoreSaleItem[]): Promise<StoreSale>;

  // Stock Requests
  getStockRequests(filters?: { storeId?: string; status?: string }): Promise<StockRequestWithDetails[]>;
  createStockRequest(request: InsertStockRequest): Promise<StockRequest>;
  updateStockRequestStatus(id: string, status: string, approvedBy?: string): Promise<StockRequest | undefined>;

  // Stats
  getAdminStats(): Promise<{
    totalUsers: number;
    totalSarees: number;
    totalOrders: number;
    totalRevenue: number;
    pendingOrders: number;
    lowStockItems: number;
  }>;
  getStoreStats(storeId: string): Promise<{
    todaySales: number;
    todayRevenue: number;
    totalInventory: number;
    pendingRequests: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getUsers(filters?: { role?: string }): Promise<User[]> {
    if (filters?.role) {
      return db.select().from(users).where(eq(users.role, filters.role as any));
    }
    return db.select().from(users);
  }

  async updateUser(id: string, data: Partial<InsertUser>): Promise<User | undefined> {
    const [user] = await db.update(users).set(data).where(eq(users.id, id)).returning();
    return user || undefined;
  }

  // Categories
  async getCategories(): Promise<Category[]> {
    return db.select().from(categories).where(eq(categories.isActive, true));
  }

  async getCategory(id: string): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.id, id));
    return category || undefined;
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const [result] = await db.insert(categories).values(category).returning();
    return result;
  }

  async updateCategory(id: string, data: Partial<InsertCategory>): Promise<Category | undefined> {
    const [result] = await db.update(categories).set(data).where(eq(categories.id, id)).returning();
    return result || undefined;
  }

  async deleteCategory(id: string): Promise<boolean> {
    const [result] = await db.update(categories).set({ isActive: false }).where(eq(categories.id, id)).returning();
    return !!result;
  }

  // Colors
  async getColors(): Promise<Color[]> {
    return db.select().from(colors).where(eq(colors.isActive, true));
  }

  async getColor(id: string): Promise<Color | undefined> {
    const [color] = await db.select().from(colors).where(eq(colors.id, id));
    return color || undefined;
  }

  async createColor(color: InsertColor): Promise<Color> {
    const [result] = await db.insert(colors).values(color).returning();
    return result;
  }

  async updateColor(id: string, data: Partial<InsertColor>): Promise<Color | undefined> {
    const [result] = await db.update(colors).set(data).where(eq(colors.id, id)).returning();
    return result || undefined;
  }

  async deleteColor(id: string): Promise<boolean> {
    const [result] = await db.update(colors).set({ isActive: false }).where(eq(colors.id, id)).returning();
    return !!result;
  }

  // Fabrics
  async getFabrics(): Promise<Fabric[]> {
    return db.select().from(fabrics).where(eq(fabrics.isActive, true));
  }

  async getFabric(id: string): Promise<Fabric | undefined> {
    const [fabric] = await db.select().from(fabrics).where(eq(fabrics.id, id));
    return fabric || undefined;
  }

  async createFabric(fabric: InsertFabric): Promise<Fabric> {
    const [result] = await db.insert(fabrics).values(fabric).returning();
    return result;
  }

  async updateFabric(id: string, data: Partial<InsertFabric>): Promise<Fabric | undefined> {
    const [result] = await db.update(fabrics).set(data).where(eq(fabrics.id, id)).returning();
    return result || undefined;
  }

  async deleteFabric(id: string): Promise<boolean> {
    const [result] = await db.update(fabrics).set({ isActive: false }).where(eq(fabrics.id, id)).returning();
    return !!result;
  }

  // Stores
  async getStores(): Promise<Store[]> {
    return db.select().from(stores).where(eq(stores.isActive, true));
  }

  async getStore(id: string): Promise<Store | undefined> {
    const [store] = await db.select().from(stores).where(eq(stores.id, id));
    return store || undefined;
  }

  async createStore(store: InsertStore): Promise<Store> {
    const [result] = await db.insert(stores).values(store).returning();
    return result;
  }

  async updateStore(id: string, data: Partial<InsertStore>): Promise<Store | undefined> {
    const [result] = await db.update(stores).set(data).where(eq(stores.id, id)).returning();
    return result || undefined;
  }

  // Sarees
  async getSarees(filters?: {
    search?: string;
    category?: string;
    color?: string;
    fabric?: string;
    featured?: boolean;
    minPrice?: number;
    maxPrice?: number;
    distributionChannel?: string;
    sort?: string;
    limit?: number;
  }): Promise<SareeWithDetails[]> {
    const conditions = [eq(sarees.isActive, true)];

    if (filters?.search) {
      conditions.push(
        or(
          ilike(sarees.name, `%${filters.search}%`),
          ilike(sarees.description, `%${filters.search}%`)
        ) as any
      );
    }
    if (filters?.category) {
      conditions.push(eq(sarees.categoryId, filters.category));
    }
    if (filters?.color) {
      conditions.push(eq(sarees.colorId, filters.color));
    }
    if (filters?.fabric) {
      conditions.push(eq(sarees.fabricId, filters.fabric));
    }
    if (filters?.featured) {
      conditions.push(eq(sarees.isFeatured, true));
    }
    if (filters?.minPrice) {
      conditions.push(gte(sarees.price, filters.minPrice.toString()));
    }
    if (filters?.maxPrice) {
      conditions.push(lte(sarees.price, filters.maxPrice.toString()));
    }
    if (filters?.distributionChannel) {
      if (filters.distributionChannel === "online") {
        conditions.push(or(
          eq(sarees.distributionChannel, "online"),
          eq(sarees.distributionChannel, "both")
        ) as any);
      } else if (filters.distributionChannel === "shop") {
        conditions.push(or(
          eq(sarees.distributionChannel, "shop"),
          eq(sarees.distributionChannel, "both")
        ) as any);
      }
    }

    let orderBy: any = desc(sarees.createdAt);
    if (filters?.sort === "price-low") {
      orderBy = asc(sarees.price);
    } else if (filters?.sort === "price-high") {
      orderBy = desc(sarees.price);
    } else if (filters?.sort === "name") {
      orderBy = asc(sarees.name);
    }

    const result = await db
      .select()
      .from(sarees)
      .leftJoin(categories, eq(sarees.categoryId, categories.id))
      .leftJoin(colors, eq(sarees.colorId, colors.id))
      .leftJoin(fabrics, eq(sarees.fabricId, fabrics.id))
      .where(and(...conditions))
      .orderBy(orderBy)
      .limit(filters?.limit || 100);

    return result.map((row) => ({
      ...row.sarees,
      category: row.categories,
      color: row.colors,
      fabric: row.fabrics,
    }));
  }

  async getSaree(id: string): Promise<SareeWithDetails | undefined> {
    const [result] = await db
      .select()
      .from(sarees)
      .leftJoin(categories, eq(sarees.categoryId, categories.id))
      .leftJoin(colors, eq(sarees.colorId, colors.id))
      .leftJoin(fabrics, eq(sarees.fabricId, fabrics.id))
      .where(eq(sarees.id, id));

    if (!result) return undefined;

    return {
      ...result.sarees,
      category: result.categories,
      color: result.colors,
      fabric: result.fabrics,
    };
  }

  async createSaree(saree: InsertSaree): Promise<Saree> {
    const [result] = await db.insert(sarees).values(saree).returning();
    return result;
  }

  async updateSaree(id: string, data: Partial<InsertSaree>): Promise<Saree | undefined> {
    const [result] = await db.update(sarees).set(data).where(eq(sarees.id, id)).returning();
    return result || undefined;
  }

  async deleteSaree(id: string): Promise<boolean> {
    const [result] = await db.update(sarees).set({ isActive: false }).where(eq(sarees.id, id)).returning();
    return !!result;
  }

  async getLowStockSarees(threshold = 10): Promise<SareeWithDetails[]> {
    const result = await db
      .select()
      .from(sarees)
      .leftJoin(categories, eq(sarees.categoryId, categories.id))
      .leftJoin(colors, eq(sarees.colorId, colors.id))
      .leftJoin(fabrics, eq(sarees.fabricId, fabrics.id))
      .where(and(eq(sarees.isActive, true), lte(sarees.totalStock, threshold)))
      .orderBy(asc(sarees.totalStock));

    return result.map((row) => ({
      ...row.sarees,
      category: row.categories,
      color: row.colors,
      fabric: row.fabrics,
    }));
  }

  // Cart
  async getCartItems(userId: string): Promise<CartItemWithSaree[]> {
    const result = await db
      .select()
      .from(cart)
      .innerJoin(sarees, eq(cart.sareeId, sarees.id))
      .leftJoin(categories, eq(sarees.categoryId, categories.id))
      .leftJoin(colors, eq(sarees.colorId, colors.id))
      .leftJoin(fabrics, eq(sarees.fabricId, fabrics.id))
      .where(eq(cart.userId, userId));

    return result.map((row) => ({
      ...row.cart,
      saree: {
        ...row.sarees,
        category: row.categories,
        color: row.colors,
        fabric: row.fabrics,
      },
    }));
  }

  async getCartCount(userId: string): Promise<number> {
    const [result] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(cart)
      .where(eq(cart.userId, userId));
    return result?.count || 0;
  }

  async addToCart(item: InsertCartItem): Promise<CartItem> {
    const [existing] = await db
      .select()
      .from(cart)
      .where(and(eq(cart.userId, item.userId), eq(cart.sareeId, item.sareeId)));

    if (existing) {
      const [updated] = await db
        .update(cart)
        .set({ quantity: existing.quantity + (item.quantity || 1) })
        .where(eq(cart.id, existing.id))
        .returning();
      return updated;
    }

    const [result] = await db.insert(cart).values(item).returning();
    return result;
  }

  async updateCartItem(id: string, quantity: number): Promise<CartItem | undefined> {
    const [result] = await db.update(cart).set({ quantity }).where(eq(cart.id, id)).returning();
    return result || undefined;
  }

  async removeFromCart(id: string): Promise<boolean> {
    const [result] = await db.delete(cart).where(eq(cart.id, id)).returning();
    return !!result;
  }

  async clearCart(userId: string): Promise<boolean> {
    await db.delete(cart).where(eq(cart.userId, userId));
    return true;
  }

  // Wishlist
  async getWishlistItems(userId: string): Promise<WishlistItemWithSaree[]> {
    const result = await db
      .select()
      .from(wishlist)
      .innerJoin(sarees, eq(wishlist.sareeId, sarees.id))
      .leftJoin(categories, eq(sarees.categoryId, categories.id))
      .leftJoin(colors, eq(sarees.colorId, colors.id))
      .leftJoin(fabrics, eq(sarees.fabricId, fabrics.id))
      .where(eq(wishlist.userId, userId));

    return result.map((row) => ({
      ...row.wishlist,
      saree: {
        ...row.sarees,
        category: row.categories,
        color: row.colors,
        fabric: row.fabrics,
      },
    }));
  }

  async getWishlistCount(userId: string): Promise<number> {
    const [result] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(wishlist)
      .where(eq(wishlist.userId, userId));
    return result?.count || 0;
  }

  async addToWishlist(item: InsertWishlistItem): Promise<WishlistItem> {
    const [existing] = await db
      .select()
      .from(wishlist)
      .where(and(eq(wishlist.userId, item.userId), eq(wishlist.sareeId, item.sareeId)));

    if (existing) return existing;

    const [result] = await db.insert(wishlist).values(item).returning();
    return result;
  }

  async removeFromWishlist(userId: string, sareeId: string): Promise<boolean> {
    const [result] = await db
      .delete(wishlist)
      .where(and(eq(wishlist.userId, userId), eq(wishlist.sareeId, sareeId)))
      .returning();
    return !!result;
  }

  async isInWishlist(userId: string, sareeId: string): Promise<boolean> {
    const [result] = await db
      .select()
      .from(wishlist)
      .where(and(eq(wishlist.userId, userId), eq(wishlist.sareeId, sareeId)));
    return !!result;
  }

  // Orders
  async getOrders(userId: string): Promise<OrderWithItems[]> {
    const orderList = await db
      .select()
      .from(orders)
      .where(eq(orders.userId, userId))
      .orderBy(desc(orders.createdAt));

    const result: OrderWithItems[] = [];

    for (const order of orderList) {
      const items = await db
        .select()
        .from(orderItems)
        .innerJoin(sarees, eq(orderItems.sareeId, sarees.id))
        .leftJoin(categories, eq(sarees.categoryId, categories.id))
        .leftJoin(colors, eq(sarees.colorId, colors.id))
        .leftJoin(fabrics, eq(sarees.fabricId, fabrics.id))
        .where(eq(orderItems.orderId, order.id));

      result.push({
        ...order,
        items: items.map((row) => ({
          ...row.order_items,
          saree: {
            ...row.sarees,
            category: row.categories,
            color: row.colors,
            fabric: row.fabrics,
          },
        })),
      });
    }

    return result;
  }

  async getOrder(id: string): Promise<OrderWithItems | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    if (!order) return undefined;

    const items = await db
      .select()
      .from(orderItems)
      .innerJoin(sarees, eq(orderItems.sareeId, sarees.id))
      .leftJoin(categories, eq(sarees.categoryId, categories.id))
      .leftJoin(colors, eq(sarees.colorId, colors.id))
      .leftJoin(fabrics, eq(sarees.fabricId, fabrics.id))
      .where(eq(orderItems.orderId, order.id));

    return {
      ...order,
      items: items.map((row) => ({
        ...row.order_items,
        saree: {
          ...row.sarees,
          category: row.categories,
          color: row.colors,
          fabric: row.fabrics,
        },
      })),
    };
  }

  async getAllOrders(filters?: { status?: string; limit?: number }): Promise<Order[]> {
    let query = db.select().from(orders).orderBy(desc(orders.createdAt));

    if (filters?.status) {
      query = query.where(eq(orders.status, filters.status as any)) as any;
    }

    if (filters?.limit) {
      query = query.limit(filters.limit) as any;
    }

    return query;
  }

  async createOrder(order: InsertOrder, items: InsertOrderItem[]): Promise<Order> {
    const [newOrder] = await db.insert(orders).values(order).returning();

    for (const item of items) {
      await db.insert(orderItems).values({ ...item, orderId: newOrder.id });
      await db
        .update(sarees)
        .set({ onlineStock: sql`${sarees.onlineStock} - ${item.quantity}` })
        .where(eq(sarees.id, item.sareeId));
    }

    return newOrder;
  }

  async updateOrderStatus(id: string, status: string): Promise<Order | undefined> {
    const [result] = await db
      .update(orders)
      .set({ status: status as any, updatedAt: new Date() })
      .where(eq(orders.id, id))
      .returning();
    return result || undefined;
  }

  // Store Inventory
  async getStoreInventory(storeId: string): Promise<(StoreInventory & { saree: SareeWithDetails })[]> {
    const result = await db
      .select()
      .from(storeInventory)
      .innerJoin(sarees, eq(storeInventory.sareeId, sarees.id))
      .leftJoin(categories, eq(sarees.categoryId, categories.id))
      .leftJoin(colors, eq(sarees.colorId, colors.id))
      .leftJoin(fabrics, eq(sarees.fabricId, fabrics.id))
      .where(eq(storeInventory.storeId, storeId));

    return result.map((row) => ({
      ...row.store_inventory,
      saree: {
        ...row.sarees,
        category: row.categories,
        color: row.colors,
        fabric: row.fabrics,
      },
    }));
  }

  async updateStoreInventory(storeId: string, sareeId: string, quantity: number): Promise<StoreInventory> {
    const [existing] = await db
      .select()
      .from(storeInventory)
      .where(and(eq(storeInventory.storeId, storeId), eq(storeInventory.sareeId, sareeId)));

    if (existing) {
      const [updated] = await db
        .update(storeInventory)
        .set({ quantity, updatedAt: new Date() })
        .where(eq(storeInventory.id, existing.id))
        .returning();
      return updated;
    }

    const [result] = await db
      .insert(storeInventory)
      .values({ storeId, sareeId, quantity })
      .returning();
    return result;
  }

  // Store Sales
  async getStoreSales(storeId: string, limit?: number): Promise<StoreSaleWithItems[]> {
    let query = db
      .select()
      .from(storeSales)
      .innerJoin(stores, eq(storeSales.storeId, stores.id))
      .where(eq(storeSales.storeId, storeId))
      .orderBy(desc(storeSales.createdAt));

    if (limit) {
      query = query.limit(limit) as any;
    }

    const salesList = await query;
    const result: StoreSaleWithItems[] = [];

    for (const row of salesList) {
      const items = await db
        .select()
        .from(storeSaleItems)
        .innerJoin(sarees, eq(storeSaleItems.sareeId, sarees.id))
        .leftJoin(categories, eq(sarees.categoryId, categories.id))
        .leftJoin(colors, eq(sarees.colorId, colors.id))
        .leftJoin(fabrics, eq(sarees.fabricId, fabrics.id))
        .where(eq(storeSaleItems.saleId, row.store_sales.id));

      result.push({
        ...row.store_sales,
        store: row.stores,
        items: items.map((itemRow) => ({
          ...itemRow.store_sale_items,
          saree: {
            ...itemRow.sarees,
            category: itemRow.categories,
            color: itemRow.colors,
            fabric: itemRow.fabrics,
          },
        })),
      });
    }

    return result;
  }

  async createStoreSale(sale: InsertStoreSale, items: InsertStoreSaleItem[]): Promise<StoreSale> {
    const [newSale] = await db.insert(storeSales).values(sale).returning();

    for (const item of items) {
      await db.insert(storeSaleItems).values({ ...item, saleId: newSale.id });
      await db
        .update(storeInventory)
        .set({ quantity: sql`${storeInventory.quantity} - ${item.quantity}` })
        .where(and(eq(storeInventory.storeId, sale.storeId), eq(storeInventory.sareeId, item.sareeId)));
    }

    return newSale;
  }

  // Stock Requests
  async getStockRequests(filters?: { storeId?: string; status?: string }): Promise<StockRequestWithDetails[]> {
    const conditions = [];

    if (filters?.storeId) {
      conditions.push(eq(stockRequests.storeId, filters.storeId));
    }
    if (filters?.status) {
      conditions.push(eq(stockRequests.status, filters.status as any));
    }

    const result = await db
      .select()
      .from(stockRequests)
      .innerJoin(stores, eq(stockRequests.storeId, stores.id))
      .innerJoin(sarees, eq(stockRequests.sareeId, sarees.id))
      .leftJoin(categories, eq(sarees.categoryId, categories.id))
      .leftJoin(colors, eq(sarees.colorId, colors.id))
      .leftJoin(fabrics, eq(sarees.fabricId, fabrics.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(stockRequests.createdAt));

    return result.map((row) => ({
      ...row.stock_requests,
      store: row.stores,
      saree: {
        ...row.sarees,
        category: row.categories,
        color: row.colors,
        fabric: row.fabrics,
      },
    }));
  }

  async createStockRequest(request: InsertStockRequest): Promise<StockRequest> {
    const [result] = await db.insert(stockRequests).values(request).returning();
    return result;
  }

  async updateStockRequestStatus(id: string, status: string, approvedBy?: string): Promise<StockRequest | undefined> {
    const [result] = await db
      .update(stockRequests)
      .set({ status: status as any, approvedBy, updatedAt: new Date() })
      .where(eq(stockRequests.id, id))
      .returning();
    return result || undefined;
  }

  // Stats
  async getAdminStats(): Promise<{
    totalUsers: number;
    totalSarees: number;
    totalOrders: number;
    totalRevenue: number;
    pendingOrders: number;
    lowStockItems: number;
  }> {
    const [userCount] = await db.select({ count: sql<number>`count(*)::int` }).from(users);
    const [sareeCount] = await db.select({ count: sql<number>`count(*)::int` }).from(sarees).where(eq(sarees.isActive, true));
    const [orderCount] = await db.select({ count: sql<number>`count(*)::int` }).from(orders);
    const [revenueSum] = await db.select({ sum: sql<number>`coalesce(sum(total_amount::numeric), 0)::float` }).from(orders).where(eq(orders.status, "delivered"));
    const [pendingCount] = await db.select({ count: sql<number>`count(*)::int` }).from(orders).where(eq(orders.status, "pending"));
    const [lowStockCount] = await db.select({ count: sql<number>`count(*)::int` }).from(sarees).where(and(eq(sarees.isActive, true), lte(sarees.totalStock, 10)));

    return {
      totalUsers: userCount?.count || 0,
      totalSarees: sareeCount?.count || 0,
      totalOrders: orderCount?.count || 0,
      totalRevenue: revenueSum?.sum || 0,
      pendingOrders: pendingCount?.count || 0,
      lowStockItems: lowStockCount?.count || 0,
    };
  }

  async getStoreStats(storeId: string): Promise<{
    todaySales: number;
    todayRevenue: number;
    totalInventory: number;
    pendingRequests: number;
  }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [salesCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(storeSales)
      .where(and(eq(storeSales.storeId, storeId), gte(storeSales.createdAt, today)));

    const [revenueSum] = await db
      .select({ sum: sql<number>`coalesce(sum(total_amount::numeric), 0)::float` })
      .from(storeSales)
      .where(and(eq(storeSales.storeId, storeId), gte(storeSales.createdAt, today)));

    const [inventorySum] = await db
      .select({ sum: sql<number>`coalesce(sum(quantity), 0)::int` })
      .from(storeInventory)
      .where(eq(storeInventory.storeId, storeId));

    const [requestCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(stockRequests)
      .where(and(eq(stockRequests.storeId, storeId), eq(stockRequests.status, "pending")));

    return {
      todaySales: salesCount?.count || 0,
      todayRevenue: revenueSum?.sum || 0,
      totalInventory: inventorySum?.sum || 0,
      pendingRequests: requestCount?.count || 0,
    };
  }
}

export const storage = new DatabaseStorage();
