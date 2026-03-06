import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  RefreshControl,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { Order, Vendor } from "@cartfolio/shared";
import { VENDOR_LABELS, VENDOR_COLORS } from "@cartfolio/shared";
import { formatCurrency } from "@cartfolio/shared/utils/formatters";
import { api } from "../services/api";
import OrderCard from "../components/OrderCard";
import type { RootStackParamList } from "../navigation";

type Nav = NativeStackNavigationProp<RootStackParamList>;

const VENDOR_FILTERS: (Vendor | "ALL")[] = ["ALL", "AMAZON", "FLIPKART", "ZOMATO", "BLINKIT"];

const VENDOR_EMOJI: Record<string, string> = {
  ALL: "🛒",
  AMAZON: "📦",
  FLIPKART: "🛍️",
  ZOMATO: "🍽️",
  BLINKIT: "⚡",
};

export default function HomeScreen() {
  const navigation = useNavigation<Nav>();
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState({ totalOrders: 0, totalSpend: 0, delivered: 0, inTransit: 0 });
  const [search, setSearch] = useState("");
  const [vendorFilter, setVendorFilter] = useState<Vendor | "ALL">("ALL");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const [fetchedOrders, fetchedStats] = await Promise.all([
      api.getOrders({
        vendor: vendorFilter === "ALL" ? undefined : vendorFilter,
        search: search || undefined,
      }),
      api.getStats(),
    ]);
    setOrders(fetchedOrders);
    setStats(fetchedStats);
    setLoading(false);
    setRefreshing(false);
  }, [vendorFilter, search]);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = () => {
    setRefreshing(true);
    load();
  };

  if (loading) {
    return (
      <View style={s.center}>
        <ActivityIndicator color="#6366f1" size="large" />
      </View>
    );
  }

  return (
    <View style={s.container}>
      {/* Stats row */}
      <View style={s.statsRow}>
        <StatCard label="Orders" value={String(stats.totalOrders)} color="#6366f1" />
        <StatCard label="Spent" value={formatCurrency(stats.totalSpend)} color="#10B981" />
        <StatCard label="Delivered" value={String(stats.delivered)} color="#3B82F6" />
        <StatCard label="In Transit" value={String(stats.inTransit)} color="#F59E0B" />
      </View>

      {/* Search bar */}
      <TextInput
        style={s.search}
        placeholder="Search orders…"
        placeholderTextColor="#52525b"
        value={search}
        onChangeText={setSearch}
      />

      {/* Vendor filter pills */}
      <FlatList
        data={VENDOR_FILTERS}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(v) => v}
        contentContainerStyle={s.filters}
        renderItem={({ item }) => {
          const active = vendorFilter === item;
          const color = item === "ALL" ? "#6366f1" : VENDOR_COLORS[item];
          return (
            <TouchableOpacity
              style={[
                s.filterPill,
                {
                  backgroundColor: active ? color + "22" : "#18181b",
                  borderColor: active ? color + "55" : "#27272a",
                },
              ]}
              onPress={() => setVendorFilter(item)}
            >
              <Text style={{ fontSize: 13 }}>{VENDOR_EMOJI[item]}</Text>
              <Text
                style={[
                  s.filterLabel,
                  { color: active ? color : "#71717a" },
                ]}
              >
                {item === "ALL" ? "All" : VENDOR_LABELS[item]}
              </Text>
            </TouchableOpacity>
          );
        }}
      />

      {/* Order list */}
      <FlatList
        data={orders}
        keyExtractor={(o) => o.id}
        contentContainerStyle={s.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6366f1" />
        }
        ListEmptyComponent={
          <View style={s.empty}>
            <Text style={{ fontSize: 36 }}>📭</Text>
            <Text style={s.emptyText}>No orders found</Text>
          </View>
        }
        renderItem={({ item }) => (
          <OrderCard
            order={item}
            onPress={() => navigation.navigate("OrderDetail", { orderId: item.id })}
          />
        )}
      />
    </View>
  );
}

function StatCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={[s.stat, { borderColor: color + "33" }]}>
      <Text style={[s.statValue, { color }]}>{value}</Text>
      <Text style={s.statLabel}>{label}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f0f11" },
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#0f0f11" },
  statsRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 8,
  },
  stat: {
    flex: 1,
    backgroundColor: "#18181b",
    borderRadius: 12,
    borderWidth: 1,
    padding: 10,
    alignItems: "center",
  },
  statValue: { fontSize: 16, fontWeight: "700" },
  statLabel: { fontSize: 10, color: "#71717a", marginTop: 2, fontWeight: "600" },
  search: {
    backgroundColor: "#18181b",
    borderWidth: 1,
    borderColor: "#27272a",
    borderRadius: 10,
    padding: 12,
    marginHorizontal: 16,
    marginTop: 14,
    fontSize: 14,
    color: "#fafafa",
  },
  filters: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  filterPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 99,
    borderWidth: 1,
  },
  filterLabel: { fontSize: 12, fontWeight: "600" },
  list: { paddingHorizontal: 16, paddingBottom: 24 },
  empty: { alignItems: "center", marginTop: 60, gap: 8 },
  emptyText: { color: "#52525b", fontSize: 14 },
});
