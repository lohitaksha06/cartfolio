// ─── Enums ───────────────────────────────────────────────

export type Vendor = "AMAZON" | "FLIPKART" | "ZOMATO" | "BLINKIT" | "SWIGGY" | "OTHER";

export type OrderStatus =
  | "PLACED"
  | "CONFIRMED"
  | "SHIPPED"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "CANCELLED"
  | "RETURNED";

export type DataSource = "MANUAL" | "EMAIL" | "NOTIFICATION" | "TRACKING_API";

export type OrderCategory = "SHOPPING" | "FOOD" | "GROCERY" | "OTHER";

// ─── Core Entities ───────────────────────────────────────

export interface User {
  id: string;
  email: string;
  name: string;
  created_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  name: string;
  quantity: number;
  price: number;
  image_url?: string;
}

export interface Tracking {
  id: string;
  order_id: string;
  carrier: string;
  tracking_number: string;
  last_status: string;
  estimated_delivery?: string;
  updated_at: string;
}

export interface Order {
  id: string;
  user_id: string;
  vendor: Vendor;
  category: OrderCategory;
  source: DataSource;
  order_date: string;
  status: OrderStatus;
  total_amount: number;
  currency: string;
  items: OrderItem[];
  tracking?: Tracking;
  created_at: string;
  updated_at: string;
}

// ─── Helpers ─────────────────────────────────────────────

export const VENDOR_LABELS: Record<Vendor, string> = {
  AMAZON: "Amazon",
  FLIPKART: "Flipkart",
  ZOMATO: "Zomato",
  BLINKIT: "Blinkit",
  SWIGGY: "Swiggy",
  OTHER: "Other",
};

export const STATUS_LABELS: Record<OrderStatus, string> = {
  PLACED: "Placed",
  CONFIRMED: "Confirmed",
  SHIPPED: "Shipped",
  OUT_FOR_DELIVERY: "Out for Delivery",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
  RETURNED: "Returned",
};

export const VENDOR_COLORS: Record<Vendor, string> = {
  AMAZON: "#FF9900",
  FLIPKART: "#2874F0",
  ZOMATO: "#E23744",
  BLINKIT: "#0C831F",
  SWIGGY: "#FC8019",
  OTHER: "#6B7280",
};

export const CATEGORY_FOR_VENDOR: Record<Vendor, OrderCategory> = {
  AMAZON: "SHOPPING",
  FLIPKART: "SHOPPING",
  ZOMATO: "FOOD",
  BLINKIT: "GROCERY",
  SWIGGY: "FOOD",
  OTHER: "OTHER",
};
