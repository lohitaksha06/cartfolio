import type { Order } from "@cartfolio/shared";

/**
 * Deduplication logic.
 *
 * When an order arrives from email AND a notification exists for the same
 * real-world order, we want to merge rather than duplicate.
 *
 * Strategy:
 * 1. If an order with the same `id` already exists → update it (keep newer status).
 * 2. If no exact id match, look for a candidate with same vendor + date range + similar amount.
 * 3. Otherwise treat as a new order.
 */
export function deduplicateOrder(incoming: Order, existing: Order[]): Order {
  // Exact ID match → merge
  const exactMatch = existing.find((o) => o.id === incoming.id);
  if (exactMatch) {
    return mergeOrders(exactMatch, incoming);
  }

  // Fuzzy match: same vendor, order_date within 2 hours, amount within 5%
  const incomingDate = new Date(incoming.order_date).getTime();
  const fuzzy = existing.find((o) => {
    if (o.vendor !== incoming.vendor) return false;
    const dateDiff = Math.abs(new Date(o.order_date).getTime() - incomingDate);
    if (dateDiff > 2 * 60 * 60 * 1000) return false; // >2 hours apart
    if (incoming.total_amount > 0 && o.total_amount > 0) {
      const pctDiff = Math.abs(o.total_amount - incoming.total_amount) / incoming.total_amount;
      if (pctDiff > 0.05) return false; // >5% price difference
    }
    return true;
  });

  if (fuzzy) {
    return mergeOrders(fuzzy, incoming);
  }

  return incoming;
}

/**
 * Merge two representations of the same order.
 * Prefer:
 * - the newer / more specific status
 * - tracking info from whichever has it
 * - items from whichever has more detail
 */
function mergeOrders(existing: Order, incoming: Order): Order {
  const STATUS_RANK = {
    PLACED: 0, CONFIRMED: 1, SHIPPED: 2,
    OUT_FOR_DELIVERY: 3, DELIVERED: 4, CANCELLED: 5, RETURNED: 6,
  };

  const betterStatus =
    STATUS_RANK[incoming.status] > STATUS_RANK[existing.status]
      ? incoming.status
      : existing.status;

  return {
    ...existing,
    status: betterStatus,
    tracking: incoming.tracking ?? existing.tracking,
    items: incoming.items.length > existing.items.length ? incoming.items : existing.items,
    total_amount: incoming.total_amount || existing.total_amount,
    updated_at: new Date().toISOString(),
  };
}
