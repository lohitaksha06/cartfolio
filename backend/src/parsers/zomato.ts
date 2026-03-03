import type { Order, OrderStatus } from "../../../../shared/types/index.js";
import type { RawEmail } from "./types.js";

export function isZomatoEmail(email: RawEmail): boolean {
  return (
    email.from.toLowerCase().includes("zomato") ||
    email.subject.toLowerCase().includes("zomato")
  );
}

export function parseZomatoEmail(email: RawEmail): Order | null {
  const text = email.text + " " + email.subject;
  const lower = text.toLowerCase();

  const orderIdMatch = text.match(/#?([A-Z0-9]{8,12})/);
  const orderId = orderIdMatch ? `zomato_${orderIdMatch[1]}` : `zomato_${Date.now()}`;

  let status: OrderStatus = "PLACED";
  if (lower.includes("delivered")) status = "DELIVERED";
  else if (lower.includes("out for delivery") || lower.includes("on the way")) status = "OUT_FOR_DELIVERY";
  else if (lower.includes("picked up") || lower.includes("restaurant")) status = "CONFIRMED";
  else if (lower.includes("confirmed") || lower.includes("accepted")) status = "CONFIRMED";
  else if (lower.includes("cancelled") || lower.includes("canceled")) status = "CANCELLED";

  const amountMatch = text.match(/(?:₹|Rs\.?)\s*([\d,]+)/);
  const totalAmount = amountMatch ? parseFloat(amountMatch[1].replace(/,/g, "")) : 0;

  const now = new Date().toISOString();

  return {
    id: orderId,
    user_id: "usr_1",
    vendor: "ZOMATO",
    category: "FOOD",
    source: "EMAIL",
    order_date: now,
    status,
    total_amount: totalAmount,
    currency: "INR",
    items: [{ id: `${orderId}_item_1`, order_id: orderId, name: "Zomato food order", quantity: 1, price: totalAmount }],
    created_at: now,
    updated_at: now,
  };
}
