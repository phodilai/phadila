import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertOrderSchema, updateOrderSchema, updateMenuItemSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Orders
  app.get("/api/orders", async (req, res) => {
    try {
      const orders = await storage.getOrders();
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.get("/api/orders/status/:status", async (req, res) => {
    try {
      const { status } = req.params;
      const orders = await storage.getOrdersByStatus(status);
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch orders by status" });
    }
  });

  app.post("/api/orders", async (req, res) => {
    try {
      const orderData = insertOrderSchema.parse(req.body);
      const order = await storage.createOrder(orderData);
      res.status(201).json(order);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid order data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create order" });
      }
    }
  });

  app.patch("/api/orders/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = updateOrderSchema.parse(req.body);
      const updatedOrder = await storage.updateOrder(id, updateData);
      
      if (!updatedOrder) {
        res.status(404).json({ message: "Order not found" });
        return;
      }
      
      res.json(updatedOrder);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid update data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update order" });
      }
    }
  });

  app.delete("/api/orders/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteOrder(id);
      
      if (!deleted) {
        res.status(404).json({ message: "Order not found" });
        return;
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete order" });
    }
  });

  // Menu Items
  app.get("/api/menu-items", async (req, res) => {
    try {
      const items = await storage.getMenuItems();
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch menu items" });
    }
  });

  app.patch("/api/menu-items/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = updateMenuItemSchema.parse(req.body);
      const updatedItem = await storage.updateMenuItem(id, updateData);
      
      if (!updatedItem) {
        res.status(404).json({ message: "Menu item not found" });
        return;
      }
      
      res.json(updatedItem);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid update data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update menu item" });
      }
    }
  });

  // Analytics
  app.get("/api/analytics/revenue", async (req, res) => {
    try {
      const days = parseInt(req.query.days as string) || 7;
      const revenue = await storage.getRevenue(days);
      res.json(revenue);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch revenue data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
