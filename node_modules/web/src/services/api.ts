import type { Order, Vendor, OrderStatus } from "../../../shared/types/index";
import { MOCK_ORDERS } from "../data/mockData";

export interface OrderFilters {
  vendor?: Vendor;
  status?: OrderStatus;
  search?: string;
}

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const api = {
  async getOrders(filters?: OrderFilters): Promise<Order[]> {
    await delay(300); // simulate network
    let orders = [...MOCK_ORDERS].sort(
      (a, b) => new Date(b.order_date).getTime() - new Date(a.order_date).getTime()
    );

    if (filters?.vendor) {
      orders = orders.filter((o) => o.vendor === filters.vendor);
    }
    if (filters?.status) {
      orders = orders.filter((o) => o.status === filters.status);
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      orders = orders.filter(
        (o) =>
          o.vendor.toLowerCase().includes(q) ||
          o.items.some((i) => i.name.toLowerCase().includes(q))
      );
    }
    return orders;
  },

  async getOrderById(id: string): Promise<Order | undefined> {
    await delay(200);
    return MOCK_ORDERS.find((o) => o.id === id);
  },

  async addOrder(order: Omit<Order, "id" | "created_at" | "updated_at">): Promise<Order> {
    await delay(400);
    const newOrder: Order = {
      ...order,
      id: `ord_${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    MOCK_ORDERS.unshift(newOrder);
    return newOrder;
  },

  async getStats() {
    await delay(200);
    const total = MOCK_ORDERS.reduce((sum, o) => sum + o.total_amount, 0);
    const delivered = MOCK_ORDERS.filter((o) => o.status === "DELIVERED").length;
    const inTransit = MOCK_ORDERS.filter((o) =>
      ["PLACED", "CONFIRMED", "SHIPPED", "OUT_FOR_DELIVERY"].includes(o.status)
    ).length;
    return { totalOrders: MOCK_ORDERS.length, totalSpend: total, delivered, inTransit };
  },
};
