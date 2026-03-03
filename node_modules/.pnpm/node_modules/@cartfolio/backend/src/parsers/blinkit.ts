import type { Order, OrderStatus } from "../../../../shared/types/index.js";
import type { RawEmail } from "./types.js";

export function isBlinkitEmail(email: RawEmail): boolean {
  return (
    email.from.toLowerCase().includes("blinkit") ||
    email.from.toLowerCase().includes("grofers") ||
    email.subject.toLowerCase().includes("blinkit")
  );
}

export function parseBlinkitEmail(email: RawEmail): Order | null {
  const text = email.text + " " + email.subject;
  const lower = text.toLowerCase();

  const orderId = `blinkit_${Date.now()}`;

  let status: OrderStatus = "PLACED";
  if (lower.includes("delivered")) status = "DELIVERED";
  else if (lower.includes("out for delivery") || lower.includes("on the way")) status = "OUT_FOR_DELIVERY";
  else if (lower.includes("order placed") || lower.includes("confirmed")) status = "CONFIRMED";
  else if (lower.includes("cancelled")) status = "CANCELLED";

  const amountMatch = text.match(/(?:₹|Rs\.?)\s*([\d,]+)/);
  const totalAmount = amountMatch ? parseFloat(amountMatch[1].replace(/,/g, "")) : 0;

  const now = new Date().toISOString();

  return {
    id: orderId,
    user_id: "usr_1",
    vendor: "BLINKIT",
    category: "GROCERY",
    source: "EMAIL",
    order_date: now,
    status,
    total_amount: totalAmount,
    currency: "INR",
    items: [{ id: `${orderId}_item_1`, order_id: orderId, name: "Blinkit grocery order", quantity: 1, price: totalAmount }],
    created_at: now,
    updated_at: now,
  };
}
