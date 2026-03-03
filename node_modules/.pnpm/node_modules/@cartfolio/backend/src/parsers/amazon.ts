import type { Order, OrderStatus } from "../../../../shared/types/index.js";
import type { RawEmail } from "./types.js";

/** Recognises emails from Amazon — amazon.in / amazon.com */
export function isAmazonEmail(email: RawEmail): boolean {
  return (
    email.from.toLowerCase().includes("amazon.in") ||
    email.from.toLowerCase().includes("amazon.com") ||
    email.subject.toLowerCase().includes("amazon")
  );
}

export function parseAmazonEmail(email: RawEmail): Order | null {
  const text = email.text + " " + email.subject;

  // Extract order ID  e.g. 408-1234567-8901234
  const orderIdMatch = text.match(/\b(\d{3}-\d{7}-\d{7})\b/);
  const orderId = orderIdMatch ? `amazon_${orderIdMatch[1]}` : `amazon_${Date.now()}`;

  // Determine status from subject / body keywords
  let status: OrderStatus = "PLACED";
  const lower = text.toLowerCase();
  if (lower.includes("delivered")) status = "DELIVERED";
  else if (lower.includes("out for delivery")) status = "OUT_FOR_DELIVERY";
  else if (lower.includes("shipped") || lower.includes("dispatch")) status = "SHIPPED";
  else if (lower.includes("confirmed") || lower.includes("confirmed")) status = "CONFIRMED";
  else if (lower.includes("cancelled") || lower.includes("canceled")) status = "CANCELLED";

  // Extract total amount  e.g. ₹1,299 or Rs. 1299
  const amountMatch = text.match(/(?:₹|Rs\.?)\s*([\d,]+)/);
  const totalAmount = amountMatch ? parseFloat(amountMatch[1].replace(/,/g, "")) : 0;

  // Extract tracking number
  const trackingMatch = text.match(/tracking\s(?:id|number|no\.?)[\s:]+([A-Z0-9]+)/i);

  // Extract estimated delivery date
  const etaMatch = text.match(/(?:arriving|delivery|deliver).*?(\w+ \d{1,2},?\s*\d{4}|\d{1,2}\s+\w+)/i);

  const now = new Date().toISOString();

  return {
    id: orderId,
    user_id: "usr_1",
    vendor: "AMAZON",
    category: "SHOPPING",
    source: "EMAIL",
    order_date: now,
    status,
    total_amount: totalAmount,
    currency: "INR",
    items: [{ id: `${orderId}_item_1`, order_id: orderId, name: "Amazon order item", quantity: 1, price: totalAmount }],
    tracking: trackingMatch
      ? {
          id: `trk_${orderId}`,
          order_id: orderId,
          carrier: "Amazon Logistics",
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
