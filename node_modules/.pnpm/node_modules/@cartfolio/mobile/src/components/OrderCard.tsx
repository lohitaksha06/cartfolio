import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import type { Order } from "@cartfolio/shared";
import { formatCurrency, formatRelativeDate } from "@cartfolio/shared/utils/formatters";
import VendorBadge from "./VendorBadge";
import StatusBadge from "./StatusBadge";

interface Props {
  order: Order;
  onPress: () => void;
}

const VENDOR_EMOJI: Record<string, string> = {
  AMAZON: "📦",
  FLIPKART: "🛍️",
  ZOMATO: "🍽️",
  BLINKIT: "⚡",
  SWIGGY: "🧡",
  OTHER: "📋",
};

export default function OrderCard({ order, onPress }: Props) {
  const itemNames = order.items
    .filter((i) => !["Delivery fee", "Delivery & taxes"].includes(i.name))
    .slice(0, 2)
    .map((i) => i.name)
    .join(", ");

  const extra = order.items.length > 2 ? ` +${order.items.length - 2} more` : "";

  return (
    <TouchableOpacity style={s.card} onPress={onPress} activeOpacity={0.7}>
      {/* Header row */}
      <View style={s.header}>
        <View style={s.badges}>
          <VendorBadge vendor={order.vendor} />
          <StatusBadge status={order.status} />
        </View>
        <Text style={s.amount}>{formatCurrency(order.total_amount)}</Text>
      </View>

      {/* Item names */}
      <Text style={s.items} numberOfLines={1}>
        {itemNames}
        {extra ? <Text style={s.muted}>{extra}</Text> : null}
      </Text>

      {/* Footer */}
      <View style={s.footer}>
        <Text style={s.date}>{formatRelativeDate(order.order_date)}</Text>
        {order.tracking && (
          <Text style={s.tracking} numberOfLines={1}>
            {order.tracking.last_status}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: "#18181b",
    borderWidth: 1,
    borderColor: "#27272a",
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    gap: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  badges: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    flexWrap: "wrap",
  },
  amount: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fafafa",
  },
  items: {
    fontSize: 14,
    fontWeight: "500",
    color: "#fafafa",
  },
  muted: {
    color: "#52525b",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  date: {
    fontSize: 12,
    color: "#71717a",
  },
  tracking: {
    fontSize: 12,
    color: "#a1a1aa",
    flex: 1,
    textAlign: "right",
    marginLeft: 8,
  },
});
