import type { Order, Vendor, OrderStatus } from "@cartfolio/shared";
import { MOCK_ORDERS } from "../data/mockData";

export interface OrderFilters {
  vendor?: Vendor;
  status?: OrderStatus;
  search?: string;
}

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const api = {
  async getOrders(filters?: OrderFilters): Promise<Order[]> {
    await delay(300);
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

  // ─── Gmail Integration ─────────────────────────────────

  async getGmailAuthUrl(): Promise<string> {
    // When backend is live, do: fetch("/api/gmail/auth-url").then(r => r.json()).then(d => d.url)
    // For now, mock it
    return "https://accounts.google.com/o/oauth2/v2/auth?mock=true";
  },

  async getGmailStatus(): Promise<{ connected: boolean }> {
    await delay(200);
    // Check localStorage for mock connection state
    const connected = localStorage.getItem("cartfolio_gmail_connected") === "true";
    return { connected };
  },

  async connectGmail(): Promise<void> {
    localStorage.setItem("cartfolio_gmail_connected", "true");
  },

  async disconnectGmail(): Promise<void> {
    localStorage.removeItem("cartfolio_gmail_connected");
  },

  async scanGmail(): Promise<{ imported: number }> {
    await delay(1500);
    // When backend is live: fetch("/api/gmail/scan", { method: "POST" })
    // For now, simulate importing 3 new orders from Gmail
    const gmailOrders: Order[] = [
      {
        id: `ord_gmail_${Date.now()}_1`,
        user_id: "usr_1",
        vendor: "AMAZON",
        category: "SHOPPING",
        source: "EMAIL",
        order_date: new Date(Date.now() - 86400000 * 3).toISOString(),
        status: "DELIVERED",
        total_amount: 1499,
        currency: "INR",
        items: [{ id: `itm_g1`, order_id: "", name: "Kindle Case Cover", quantity: 1, price: 1499 }],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: `ord_gmail_${Date.now()}_2`,
        user_id: "usr_1",
        vendor: "FLIPKART",
        category: "SHOPPING",
        source: "EMAIL",
        order_date: new Date(Date.now() - 86400000 * 5).toISOString(),
        status: "DELIVERED",
        total_amount: 899,
        currency: "INR",
        items: [{ id: `itm_g2`, order_id: "", name: "Noise Smartwatch", quantity: 1, price: 899 }],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: `ord_gmail_${Date.now()}_3`,
        user_id: "usr_1",
        vendor: "ZOMATO",
        category: "FOOD",
        source: "EMAIL",
        order_date: new Date(Date.now() - 86400000).toISOString(),
        status: "DELIVERED",
        total_amount: 380,
        currency: "INR",
        items: [
          { id: `itm_g3`, order_id: "", name: "Butter Chicken + Naan", quantity: 1, price: 380 },
        ],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];

    // Add to mock data (no duplicates)
    for (const o of gmailOrders) {
      if (!MOCK_ORDERS.find((m) => m.id === o.id)) {
        MOCK_ORDERS.unshift(o);
      }
    }
    return { imported: gmailOrders.length };
  },

  // ─── Vendor stats ──────────────────────────────────────

  async getVendorStats(vendor: Vendor) {
    await delay(200);
    const vendorOrders = MOCK_ORDERS.filter((o) => o.vendor === vendor);
    const total = vendorOrders.reduce((s, o) => s + o.total_amount, 0);
    return {
      orderCount: vendorOrders.length,
      totalSpend: total,
      delivered: vendorOrders.filter((o) => o.status === "DELIVERED").length,
    };
  },
};
