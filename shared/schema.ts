import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const menuItems = pgTable("menu_items", {
  id: varchar("id").primaryKey(),
  name: text("name").notNull(),
  price: integer("price").notNull(),
  type: text("type").notNull(), // 'drink' | 'snack'
  hasTopping: boolean("has_topping").default(false),
  isVisible: boolean("is_visible").default(true),
  image: text("image"),
});

export const orders = pgTable("orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orderType: text("order_type").notNull(), // 'takeout' | 'dinein'
  tableNumber: integer("table_number"),
  customerName: text("customer_name"),
  customerPhone: text("customer_phone"),
  customerAddress: text("customer_address"),
  customerNote: text("customer_note"),
  items: jsonb("items").notNull(),
  total: integer("total").notNull(),
  status: text("status").notNull().default("new"), // 'new' | 'paid' | 'completed' | 'history'
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateOrderSchema = createInsertSchema(orders).partial().omit({
  id: true,
  createdAt: true,
});

export const insertMenuItemSchema = createInsertSchema(menuItems);

export const updateMenuItemSchema = createInsertSchema(menuItems).partial();

export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type UpdateOrder = z.infer<typeof updateOrderSchema>;
export type Order = typeof orders.$inferSelect;
export type MenuItem = typeof menuItems.$inferSelect;
export type InsertMenuItem = z.infer<typeof insertMenuItemSchema>;
export type UpdateMenuItem = z.infer<typeof updateMenuItemSchema>;

// Cart item type for frontend
export const cartItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  price: z.number(),
  quantity: z.number(),
  type: z.enum(["drink", "snack"]),
  customization: z.object({
    sugar: z.string().optional(),
    ice: z.string().optional(),
    topping: z.string().optional(),
  }).optional(),
});

export type CartItem = z.infer<typeof cartItemSchema>;
