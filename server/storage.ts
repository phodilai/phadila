import { type Order, type InsertOrder, type UpdateOrder, type MenuItem, type InsertMenuItem, type UpdateMenuItem } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Orders
  getOrders(): Promise<Order[]>;
  getOrder(id: string): Promise<Order | undefined>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrder(id: string, order: UpdateOrder): Promise<Order | undefined>;
  deleteOrder(id: string): Promise<boolean>;
  getOrdersByStatus(status: string): Promise<Order[]>;
  
  // Menu Items
  getMenuItems(): Promise<MenuItem[]>;
  getMenuItem(id: string): Promise<MenuItem | undefined>;
  createMenuItem(item: InsertMenuItem): Promise<MenuItem>;
  updateMenuItem(id: string, item: UpdateMenuItem): Promise<MenuItem | undefined>;
  deleteMenuItem(id: string): Promise<boolean>;
  
  // Analytics
  getRevenue(days: number): Promise<{ total: number; orderCount: number; dailyRevenue: Array<{ date: string; revenue: number; orders: number }> }>;
}

export class MemStorage implements IStorage {
  private orders: Map<string, Order>;
  private menuItems: Map<string, MenuItem>;

  constructor() {
    this.orders = new Map();
    this.menuItems = new Map();
    this.initializeMenuItems();
  }

  private initializeMenuItems() {
    const defaultItems: MenuItem[] = [
      { id: "tra-da", name: "Trà Đá", price: 5000, type: "drink", hasTopping: false, isVisible: true, image: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300" },
      { id: "tra-chanh", name: "Trà Chanh", price: 10000, type: "drink", hasTopping: true, isVisible: true, image: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300" },
      { id: "tra-quat", name: "Trà Quất", price: 10000, type: "drink", hasTopping: true, isVisible: true, image: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300" },
      { id: "cafe-nau", name: "Cafe Nâu", price: 20000, type: "drink", hasTopping: false, isVisible: true, image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300" },
      { id: "cafe-den", name: "Cafe Đen", price: 20000, type: "drink", hasTopping: false, isVisible: true, image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300" },
      { id: "bac-xiu", name: "Bạc Xỉu", price: 25000, type: "drink", hasTopping: false, isVisible: true, image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300" },
      { id: "cafe-muoi", name: "Cafe Muối", price: 25000, type: "drink", hasTopping: false, isVisible: true, image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300" },
      { id: "sua-chua-lac", name: "Sữa Chua Lắc", price: 25000, type: "drink", hasTopping: false, isVisible: true, image: "https://images.unsplash.com/photo-1563636619-e9143da7973b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300" },
      { id: "sc-lac-dau", name: "SC Lắc Dâu", price: 30000, type: "drink", hasTopping: false, isVisible: true, image: "https://images.unsplash.com/photo-1563636619-e9143da7973b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300" },
      { id: "sc-lac-viet-quat", name: "SC Lắc Việt Quất", price: 30000, type: "drink", hasTopping: false, isVisible: true, image: "https://images.unsplash.com/photo-1563636619-e9143da7973b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300" },
      { id: "bim-bim", name: "Bim Bim", price: 6000, type: "snack", hasTopping: false, isVisible: true, image: "https://images.unsplash.com/photo-1621939514649-280e2ee25f60?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300" },
      { id: "huong-duong", name: "Hướng Dương", price: 10000, type: "snack", hasTopping: false, isVisible: true, image: "https://images.unsplash.com/photo-1621939514649-280e2ee25f60?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300" },
      { id: "thang-long-cung", name: "Thăng Long Cứng", price: 15000, type: "snack", hasTopping: false, isVisible: true, image: "https://images.unsplash.com/photo-1621939514649-280e2ee25f60?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300" },
      { id: "cay-cay", name: "Cay Cay", price: 2000, type: "snack", hasTopping: false, isVisible: true, image: "https://images.unsplash.com/photo-1621939514649-280e2ee25f60?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300" },
    ];

    defaultItems.forEach(item => {
      this.menuItems.set(item.id, item);
    });
  }

  // Orders
  async getOrders(): Promise<Order[]> {
    return Array.from(this.orders.values()).sort((a, b) => 
      new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    );
  }

  async getOrder(id: string): Promise<Order | undefined> {
    return this.orders.get(id);
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const id = randomUUID();
    const now = new Date();
    const order: Order = { 
      ...insertOrder, 
      id, 
      createdAt: now,
      updatedAt: now,
      tableNumber: insertOrder.tableNumber || null,
      customerName: insertOrder.customerName || null,
      customerPhone: insertOrder.customerPhone || null,
      customerAddress: insertOrder.customerAddress || null,
      customerNote: insertOrder.customerNote || null,
    };
    this.orders.set(id, order);
    return order;
  }

  async updateOrder(id: string, updateOrder: UpdateOrder): Promise<Order | undefined> {
    const existingOrder = this.orders.get(id);
    if (!existingOrder) return undefined;

    const updatedOrder: Order = {
      ...existingOrder,
      ...updateOrder,
      updatedAt: new Date(),
    };
    this.orders.set(id, updatedOrder);
    return updatedOrder;
  }

  async deleteOrder(id: string): Promise<boolean> {
    return this.orders.delete(id);
  }

  async getOrdersByStatus(status: string): Promise<Order[]> {
    return Array.from(this.orders.values())
      .filter(order => order.status === status)
      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  }

  // Menu Items
  async getMenuItems(): Promise<MenuItem[]> {
    return Array.from(this.menuItems.values());
  }

  async getMenuItem(id: string): Promise<MenuItem | undefined> {
    return this.menuItems.get(id);
  }

  async createMenuItem(item: InsertMenuItem): Promise<MenuItem> {
    this.menuItems.set(item.id, item);
    return item;
  }

  async updateMenuItem(id: string, item: UpdateMenuItem): Promise<MenuItem | undefined> {
    const existingItem = this.menuItems.get(id);
    if (!existingItem) return undefined;

    const updatedItem: MenuItem = { 
      ...existingItem, 
      ...item,
      image: item.image !== undefined ? item.image : existingItem.image || null,
      hasTopping: item.hasTopping !== undefined ? item.hasTopping : existingItem.hasTopping || null,
      isVisible: item.isVisible !== undefined ? item.isVisible : existingItem.isVisible || null,
    };
    this.menuItems.set(id, updatedItem);
    return updatedItem;
  }

  async deleteMenuItem(id: string): Promise<boolean> {
    return this.menuItems.delete(id);
  }

  // Analytics
  async getRevenue(days: number): Promise<{ total: number; orderCount: number; dailyRevenue: Array<{ date: string; revenue: number; orders: number }> }> {
    const orders = Array.from(this.orders.values());
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const recentOrders = orders.filter(order => {
      const orderDate = new Date(order.createdAt || 0);
      return orderDate >= cutoffDate && (order.status === 'paid' || order.status === 'completed' || order.status === 'history');
    });

    const total = recentOrders.reduce((sum, order) => sum + order.total, 0);
    const orderCount = recentOrders.length;

    // Group by date
    const dailyRevenue: { [key: string]: { revenue: number; orders: number } } = {};
    
    recentOrders.forEach(order => {
      const date = new Date(order.createdAt || 0).toISOString().split('T')[0];
      if (!dailyRevenue[date]) {
        dailyRevenue[date] = { revenue: 0, orders: 0 };
      }
      dailyRevenue[date].revenue += order.total;
      dailyRevenue[date].orders += 1;
    });

    const dailyRevenueArray = Object.entries(dailyRevenue).map(([date, data]) => ({
      date,
      revenue: data.revenue,
      orders: data.orders,
    })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return { total, orderCount, dailyRevenue: dailyRevenueArray };
  }
}

export const storage = new MemStorage();
