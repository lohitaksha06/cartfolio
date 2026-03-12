import type { Order, OrderStatus } from "@cartfolio/shared";
import type { RawEmail } from "./types";

export function isFlipkartEmail(email: RawEmail): boolean {
  return (
    email.from.toLowerCase().includes("flipkart") ||
    email.subject.toLowerCase().includes("flipkart")
  );
}

export function parseFlipkartEmail(email: RawEmail): Order | null {
  const text = email.text + " " + email.subject;
  const lower = text.toLowerCase();

  // OD1234567890123456 format
  const orderIdMatch = text.match(/\b(OD\d{15,18})\b/i);
  const orderId = orderIdMatch ? `flipkart_${orderIdMatch[1]}` : `flipkart_${Date.now()}`;

  let status: OrderStatus = "PLACED";
  if (lower.includes("delivered")) status = "DELIVERED";
  else if (lower.includes("out for delivery")) status = "OUT_FOR_DELIVERY";
  else if (lower.includes("shipped") || lower.includes("on its way")) status = "SHIPPED";
  else if (lower.includes("confirmed")) status = "CONFIRMED";
  else if (lower.includes("cancelled")) status = "CANCELLED";

  const amountMatch = text.match(/(?:₹|Rs\.?)\s*([\d,]+)/);
  const totalAmount = amountMatch ? parseFloat(amountMatch[1].replace(/,/g, "")) : 0;

  const trackingMatch = text.match(/tracking\s(?:id|number|no\.?)[\s:]+([A-Z0-9]+)/i);
  const etaMatch = text.match(/(?:arriving|delivery by|expected by).*?(\w+ \d{1,2})/i);

  const now = new Date().toISOString();

  return {
    id: orderId,
    user_id: "usr_1",
    vendor: "FLIPKART",
    category: "SHOPPING",
    source: "EMAIL",
    order_date: now,
    status,
    total_amount: totalAmount,
    currency: "INR",
    items: [{ id: `${orderId}_item_1`, order_id: orderId, name: "Flipkart order item", quantity: 1, price: totalAmount }],
    tracking: trackingMatch
      ? {
          id: `trk_${orderId}`,
          order_id: orderId,
          carrier: "Ekart Logistics",
          tracking_number: trackingMatch[1],
          last_status: status,
          estimated_delivery: etaMatch ? etaMatch[1] : undefined,
          updated_at: now,
        }
      : undefined,
    created_at: now,
    updated_at: now,
  };
}
