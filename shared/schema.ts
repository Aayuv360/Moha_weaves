import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, boolean, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
export const userRoleEnum = pgEnum("user_role", ["user", "admin", "inventory", "store"]);
export const orderStatusEnum = pgEnum("order_status", ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"]);
export const distributionChannelEnum = pgEnum("distribution_channel", ["shop", "online", "both"]);
export const requestStatusEnum = pgEnum("request_status", ["pending", "approved", "dispatched", "received", "rejected"]);
export const storeSaleTypeEnum = pgEnum("store_sale_type", ["walk_in", "reserved"]);

// Users table - supports all roles
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  phone: text("phone"),
  role: userRoleEnum("role").notNull().default("user"),
  storeId: varchar("store_id"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Categories for sarees
export const categories = pgTable("categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique(),
  description: text("description"),
  imageUrl: text("image_url"),
  isActive: boolean("is_active").notNull().default(true),
});

// Colors
export const colors = pgTable("colors", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique(),
  hexCode: text("hex_code").notNull(),
  isActive: boolean("is_active").notNull().default(true),
});

// Fabrics
export const fabrics = pgTable("fabrics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique(),
  description: text("description"),
  isActive: boolean("is_active").notNull().default(true),
});

// Stores (physical outlets)
export const stores = pgTable("stores", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  address: text("address").notNull(),
  phone: text("phone"),
  managerId: varchar("manager_id"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Sarees (products)
export const sarees = pgTable("sarees", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  categoryId: varchar("category_id").references(() => categories.id),
  colorId: varchar("color_id").references(() => colors.id),
  fabricId: varchar("fabric_id").references(() => fabrics.id),
  imageUrl: text("image_url"),
  images: text("images").array(),
  videoUrl: text("video_url"),
  sku: text("sku").unique(),
  totalStock: integer("total_stock").notNull().default(0),
  onlineStock: integer("online_stock").notNull().default(0),
  distributionChannel: distributionChannelEnum("distribution_channel").notNull().default("both"),
  isActive: boolean("is_active").notNull().default(true),
  isFeatured: boolean("is_featured").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Store inventory (stock per store)
export const storeInventory = pgTable("store_inventory", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  storeId: varchar("store_id").references(() => stores.id).notNull(),
  sareeId: varchar("saree_id").references(() => sarees.id).notNull(),
  quantity: integer("quantity").notNull().default(0),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Wishlist
export const wishlist = pgTable("wishlist", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  sareeId: varchar("saree_id").references(() => sarees.id).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Cart
export const cart = pgTable("cart", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  sareeId: varchar("saree_id").references(() => sarees.id).notNull(),
  quantity: integer("quantity").notNull().default(1),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Online Orders
export const orders = pgTable("orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  status: orderStatusEnum("status").notNull().default("pending"),
  shippingAddress: text("shipping_address").notNull(),
  phone: text("phone").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Order items
export const orderItems = pgTable("order_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orderId: varchar("order_id").references(() => orders.id).notNull(),
  sareeId: varchar("saree_id").references(() => sarees.id).notNull(),
  quantity: integer("quantity").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
});

// Store sales (in-store transactions)
export const storeSales = pgTable("store_sales", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  storeId: varchar("store_id").references(() => stores.id).notNull(),
  soldBy: varchar("sold_by").references(() => users.id).notNull(),
  customerName: text("customer_name"),
  customerPhone: text("customer_phone"),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  saleType: storeSaleTypeEnum("sale_type").notNull().default("walk_in"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Store sale items
export const storeSaleItems = pgTable("store_sale_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  saleId: varchar("sale_id").references(() => storeSales.id).notNull(),
  sareeId: varchar("saree_id").references(() => sarees.id).notNull(),
  quantity: integer("quantity").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
});

// User addresses for delivery
export const userAddresses = pgTable("user_addresses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  locality: text("locality").notNull(),
  city: text("city").notNull(),
  pincode: text("pincode").notNull(),
  isDefault: boolean("is_default").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Serviceable pincodes for delivery availability check
export const serviceablePincodes = pgTable("serviceable_pincodes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  pincode: text("pincode").notNull().unique(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  deliveryDays: integer("delivery_days").notNull().default(5),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Stock requests from stores
export const stockRequests = pgTable("stock_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  storeId: varchar("store_id").references(() => stores.id).notNull(),
  requestedBy: varchar("requested_by").references(() => users.id).notNull(),
  sareeId: varchar("saree_id").references(() => sarees.id).notNull(),
  quantity: integer("quantity").notNull(),
  status: requestStatusEnum("status").notNull().default("pending"),
  approvedBy: varchar("approved_by"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  store: one(stores, { fields: [users.storeId], references: [stores.id] }),
  wishlistItems: many(wishlist),
  cartItems: many(cart),
  orders: many(orders),
  storeSales: many(storeSales),
  stockRequests: many(stockRequests),
  addresses: many(userAddresses),
}));

export const userAddressesRelations = relations(userAddresses, ({ one }) => ({
  user: one(users, { fields: [userAddresses.userId], references: [users.id] }),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  sarees: many(sarees),
}));

export const colorsRelations = relations(colors, ({ many }) => ({
  sarees: many(sarees),
}));

export const fabricsRelations = relations(fabrics, ({ many }) => ({
  sarees: many(sarees),
}));

export const storesRelations = relations(stores, ({ one, many }) => ({
  manager: one(users, { fields: [stores.managerId], references: [users.id] }),
  inventory: many(storeInventory),
  sales: many(storeSales),
  stockRequests: many(stockRequests),
}));

export const sareesRelations = relations(sarees, ({ one, many }) => ({
  category: one(categories, { fields: [sarees.categoryId], references: [categories.id] }),
  color: one(colors, { fields: [sarees.colorId], references: [colors.id] }),
  fabric: one(fabrics, { fields: [sarees.fabricId], references: [fabrics.id] }),
  wishlistItems: many(wishlist),
  cartItems: many(cart),
  orderItems: many(orderItems),
  storeInventory: many(storeInventory),
  storeSaleItems: many(storeSaleItems),
  stockRequests: many(stockRequests),
}));

export const storeInventoryRelations = relations(storeInventory, ({ one }) => ({
  store: one(stores, { fields: [storeInventory.storeId], references: [stores.id] }),
  saree: one(sarees, { fields: [storeInventory.sareeId], references: [sarees.id] }),
}));

export const wishlistRelations = relations(wishlist, ({ one }) => ({
  user: one(users, { fields: [wishlist.userId], references: [users.id] }),
  saree: one(sarees, { fields: [wishlist.sareeId], references: [sarees.id] }),
}));

export const cartRelations = relations(cart, ({ one }) => ({
  user: one(users, { fields: [cart.userId], references: [users.id] }),
  saree: one(sarees, { fields: [cart.sareeId], references: [sarees.id] }),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, { fields: [orders.userId], references: [users.id] }),
  items: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, { fields: [orderItems.orderId], references: [orders.id] }),
  saree: one(sarees, { fields: [orderItems.sareeId], references: [sarees.id] }),
}));

export const storeSalesRelations = relations(storeSales, ({ one, many }) => ({
  store: one(stores, { fields: [storeSales.storeId], references: [stores.id] }),
  seller: one(users, { fields: [storeSales.soldBy], references: [users.id] }),
  items: many(storeSaleItems),
}));

export const storeSaleItemsRelations = relations(storeSaleItems, ({ one }) => ({
  sale: one(storeSales, { fields: [storeSaleItems.saleId], references: [storeSales.id] }),
  saree: one(sarees, { fields: [storeSaleItems.sareeId], references: [sarees.id] }),
}));

export const stockRequestsRelations = relations(stockRequests, ({ one }) => ({
  store: one(stores, { fields: [stockRequests.storeId], references: [stores.id] }),
  requester: one(users, { fields: [stockRequests.requestedBy], references: [users.id] }),
  saree: one(sarees, { fields: [stockRequests.sareeId], references: [sarees.id] }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertCategorySchema = createInsertSchema(categories).omit({ id: true });
export const insertColorSchema = createInsertSchema(colors).omit({ id: true });
export const insertFabricSchema = createInsertSchema(fabrics).omit({ id: true });
export const insertStoreSchema = createInsertSchema(stores).omit({ id: true, createdAt: true });
export const insertSareeSchema = createInsertSchema(sarees).omit({ id: true, createdAt: true });
export const insertStoreInventorySchema = createInsertSchema(storeInventory).omit({ id: true, updatedAt: true });
export const insertWishlistSchema = createInsertSchema(wishlist).omit({ id: true, createdAt: true });
export const insertCartSchema = createInsertSchema(cart).omit({ id: true, createdAt: true });
export const insertOrderSchema = createInsertSchema(orders).omit({ id: true, createdAt: true, updatedAt: true });
export const insertOrderItemSchema = createInsertSchema(orderItems).omit({ id: true });
export const insertStoreSaleSchema = createInsertSchema(storeSales).omit({ id: true, createdAt: true });
export const insertStoreSaleItemSchema = createInsertSchema(storeSaleItems).omit({ id: true });
export const insertStockRequestSchema = createInsertSchema(stockRequests).omit({ id: true, createdAt: true, updatedAt: true });
export const insertUserAddressSchema = createInsertSchema(userAddresses).omit({ id: true, createdAt: true });
export const insertServiceablePincodeSchema = createInsertSchema(serviceablePincodes).omit({ id: true, createdAt: true });

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Color = typeof colors.$inferSelect;
export type InsertColor = z.infer<typeof insertColorSchema>;
export type Fabric = typeof fabrics.$inferSelect;
export type InsertFabric = z.infer<typeof insertFabricSchema>;
export type Store = typeof stores.$inferSelect;
export type InsertStore = z.infer<typeof insertStoreSchema>;
export type Saree = typeof sarees.$inferSelect;
export type InsertSaree = z.infer<typeof insertSareeSchema>;
export type StoreInventory = typeof storeInventory.$inferSelect;
export type InsertStoreInventory = z.infer<typeof insertStoreInventorySchema>;
export type WishlistItem = typeof wishlist.$inferSelect;
export type InsertWishlistItem = z.infer<typeof insertWishlistSchema>;
export type CartItem = typeof cart.$inferSelect;
export type InsertCartItem = z.infer<typeof insertCartSchema>;
export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;
export type StoreSale = typeof storeSales.$inferSelect;
export type InsertStoreSale = z.infer<typeof insertStoreSaleSchema>;
export type StoreSaleItem = typeof storeSaleItems.$inferSelect;
export type InsertStoreSaleItem = z.infer<typeof insertStoreSaleItemSchema>;
export type StockRequest = typeof stockRequests.$inferSelect;
export type InsertStockRequest = z.infer<typeof insertStockRequestSchema>;
export type UserAddress = typeof userAddresses.$inferSelect;
export type InsertUserAddress = z.infer<typeof insertUserAddressSchema>;
export type ServiceablePincode = typeof serviceablePincodes.$inferSelect;
export type InsertServiceablePincode = z.infer<typeof insertServiceablePincodeSchema>;

// Extended types for frontend use
export type SareeWithDetails = Saree & {
  category?: Category | null;
  color?: Color | null;
  fabric?: Fabric | null;
};

export type CartItemWithSaree = CartItem & {
  saree: SareeWithDetails;
};

export type WishlistItemWithSaree = WishlistItem & {
  saree: SareeWithDetails;
};

export type OrderWithItems = Order & {
  items: (OrderItem & { saree: SareeWithDetails })[];
};

export type StockRequestWithDetails = StockRequest & {
  saree: SareeWithDetails;
  store: Store;
};

export type StoreSaleWithItems = StoreSale & {
  items: (StoreSaleItem & { saree: SareeWithDetails })[];
  store: Store;
};
