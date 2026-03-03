import type { OrderStatus } from "../types";

export function formatCurrency(amount: number, currency = "INR"): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatRelativeDate(iso: string): string {
  const now = new Date();
  const date = new Date(iso);
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return formatDate(iso);
}

export function getStatusColor(status: OrderStatus): string {
  const map: Record<OrderStatus, string> = {
    PLACED: "#F59E0B",
    CONFIRMED: "#3B82F6",
    SHIPPED: "#8B5CF6",
    OUT_FOR_DELIVERY: "#F97316",
    DELIVERED: "#10B981",
    CANCELLED: "#EF4444",
    RETURNED: "#6B7280",
  };
  return map[status];
}
