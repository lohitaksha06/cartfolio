/**
 * In-memory store — placeholder until Supabase is wired up.
 * Replace the arrays + functions here with Supabase client calls.
 */

import type { Order } from "@cartfolio/shared";

const orders: Order[] = [];

export const store = {
  // Orders
  getOrders(userId: string): Order[] {
    return orders
      .filter((o) => o.user_id === userId)
      .sort((a, b) => new Date(b.order_date).getTime() - new Date(a.order_date).getTime());
  },

  getOrderById(id: string): Order | undefined {
    return orders.find((o) => o.id === id);
  },

  upsertOrder(order: Order): Order {
    const idx = orders.findIndex((o) => o.id === order.id);
    if (idx !== -1) {
      orders[idx] = order;
    } else {
      orders.unshift(order);
    }
    return order;
  },

  deleteOrder(id: string): boolean {
    const idx = orders.findIndex((o) => o.id === id);
    if (idx === -1) return false;
    orders.splice(idx, 1);
    return true;
  },
};
