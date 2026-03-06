import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import type { RouteProp } from "@react-navigation/native";
import type { Order } from "@cartfolio/shared";
import { VENDOR_LABELS, STATUS_LABELS } from "@cartfolio/shared";
import { formatCurrency, formatDate, getStatusColor } from "@cartfolio/shared/utils/formatters";
import { api } from "../services/api";
import VendorBadge from "../components/VendorBadge";
import StatusBadge from "../components/StatusBadge";
import type { RootStackParamList } from "../navigation";

type Props = {
  route: RouteProp<RootStackParamList, "OrderDetail">;
};

export default function OrderDetailScreen({ route }: Props) {
  const { orderId } = route.params;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getOrderById(orderId).then((o) => {
      setOrder(o ?? null);
      setLoading(false);
    });
  }, [orderId]);

  if (loading) {
    return (
      <View style={s.center}>
        <ActivityIndicator color="#6366f1" size="large" />
      </View>
    );
  }

  if (!order) {
    return (
      <View style={s.center}>
        <Text style={{ fontSize: 36 }}>🤷</Text>
        <Text style={s.notFound}>Order not found</Text>
      </View>
    );
  }

  const statusColor = getStatusColor(order.status);

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>
      {/* Badges */}
      <View style={s.badgeRow}>
        <VendorBadge vendor={order.vendor} />
        <StatusBadge status={order.status} />
      </View>

      {/* Meta grid */}
      <View style={s.metaGrid}>
        <MetaItem label="Order Date" value={formatDate(order.order_date)} />
        <MetaItem label="Total" value={formatCurrency(order.total_amount)} />
        <MetaItem label="Source" value={order.source} />
        <MetaItem label="Category" value={order.category} />
      </View>

      {/* Items */}
      <Text style={s.sectionTitle}>Items</Text>
      <View style={s.card}>
        {order.items.map((item, i) => (
          <View
            key={item.id}
            style={[s.itemRow, i < order.items.length - 1 && s.itemBorder]}
          >
            <View style={{ flex: 1 }}>
              <Text style={s.itemName}>{item.name}</Text>
              <Text style={s.itemQty}>Qty: {item.quantity}</Text>
            </View>
            <Text style={s.itemPrice}>{formatCurrency(item.price)}</Text>
          </View>
        ))}
      </View>

      {/* Tracking */}
      {order.tracking && (
        <>
          <Text style={s.sectionTitle}>Tracking</Text>
          <View style={s.card}>
            <MetaRow label="Carrier" value={order.tracking.carrier} />
            <MetaRow label="Tracking #" value={order.tracking.tracking_number} mono />
            <MetaRow label="Status" value={order.tracking.last_status} />
            {order.tracking.estimated_delivery && (
              <MetaRow label="ETA" value={formatDate(order.tracking.estimated_delivery)} />
            )}
          </View>
        </>
      )}

      {/* Order ID */}
      <View style={[s.card, { marginTop: 16 }]}>
        <MetaRow label="Order ID" value={order.id} mono />
      </View>
    </ScrollView>
  );
}

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <View style={s.metaItem}>
      <Text style={s.metaLabel}>{label}</Text>
      <Text style={s.metaValue}>{value}</Text>
    </View>
  );
}

function MetaRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <View style={s.metaRow}>
      <Text style={s.metaLabel}>{label}</Text>
      <Text style={[s.metaRowValue, mono && { fontFamily: "monospace" }]}>{value}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f0f11" },
  content: { padding: 16, paddingBottom: 40 },
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#0f0f11" },
  notFound: { color: "#71717a", fontSize: 14, marginTop: 8 },
  badgeRow: { flexDirection: "row", gap: 8, marginBottom: 20 },
  metaGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 24,
  },
  metaItem: {
    backgroundColor: "#18181b",
    borderRadius: 10,
    padding: 12,
    minWidth: "46%",
    flex: 1,
  },
  metaLabel: { fontSize: 11, color: "#71717a", fontWeight: "600", marginBottom: 4 },
  metaValue: { fontSize: 14, color: "#fafafa", fontWeight: "600" },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#a1a1aa",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  card: {
    backgroundColor: "#18181b",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#27272a",
    padding: 14,
    marginBottom: 20,
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
  },
  itemBorder: { borderBottomWidth: 1, borderBottomColor: "#27272a" },
  itemName: { fontSize: 14, color: "#fafafa", fontWeight: "500" },
  itemQty: { fontSize: 12, color: "#71717a", marginTop: 2 },
  itemPrice: { fontSize: 14, color: "#fafafa", fontWeight: "600" },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
  },
  metaRowValue: { fontSize: 13, color: "#fafafa", fontWeight: "500" },
});
