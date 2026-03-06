import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet,
} from "react-native";
import type { Vendor, OrderStatus, DataSource, OrderCategory } from "@cartfolio/shared";
import { VENDOR_LABELS, VENDOR_COLORS, CATEGORY_FOR_VENDOR } from "@cartfolio/shared";
import { api } from "../services/api";

const VENDORS: Vendor[] = ["AMAZON", "FLIPKART", "ZOMATO", "BLINKIT"];

const VENDOR_EMOJI: Record<string, string> = {
  AMAZON: "📦",
  FLIPKART: "🛍️",
  ZOMATO: "🍽️",
  BLINKIT: "⚡",
};

export default function AddOrderScreen() {
  const [vendor, setVendor] = useState<Vendor>("AMAZON");
  const [itemName, setItemName] = useState("");
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!itemName.trim() || !amount.trim()) {
      Alert.alert("Missing info", "Please fill in item name and amount.");
      return;
    }
    const num = parseFloat(amount);
    if (isNaN(num) || num <= 0) {
      Alert.alert("Invalid amount", "Please enter a valid amount.");
      return;
    }
    setSubmitting(true);
    try {
      await api.addOrder({
        user_id: "usr_1",
        vendor,
        category: CATEGORY_FOR_VENDOR[vendor],
        source: "MANUAL" as DataSource,
        order_date: new Date().toISOString(),
        status: "PLACED" as OrderStatus,
        total_amount: num,
        currency: "INR",
        items: [
          { id: `itm_${Date.now()}`, order_id: "", name: itemName.trim(), quantity: 1, price: num },
        ],
      });
      Alert.alert("Done", "Order added!");
      setItemName("");
      setAmount("");
    } catch {
      Alert.alert("Error", "Could not save order.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>
      <Text style={s.heading}>Add Order</Text>
      <Text style={s.sub}>Manually log an order to your timeline.</Text>

      {/* Vendor picker */}
      <Text style={s.label}>Vendor</Text>
      <View style={s.vendorRow}>
        {VENDORS.map((v) => {
          const active = vendor === v;
          const color = VENDOR_COLORS[v];
          return (
            <TouchableOpacity
              key={v}
              style={[
                s.vendorPill,
                {
                  backgroundColor: active ? color + "22" : "#18181b",
                  borderColor: active ? color + "55" : "#27272a",
                },
              ]}
              onPress={() => setVendor(v)}
            >
              <Text style={{ fontSize: 16 }}>{VENDOR_EMOJI[v]}</Text>
              <Text style={[s.vendorLabel, { color: active ? color : "#71717a" }]}>
                {VENDOR_LABELS[v]}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Item name */}
      <Text style={s.label}>Item Name</Text>
      <TextInput
        style={s.input}
        placeholder="e.g. Wireless Earbuds"
        placeholderTextColor="#52525b"
        value={itemName}
        onChangeText={setItemName}
      />

      {/* Amount */}
      <Text style={s.label}>Amount (₹)</Text>
      <TextInput
        style={s.input}
        placeholder="e.g. 1499"
        placeholderTextColor="#52525b"
        keyboardType="numeric"
        value={amount}
        onChangeText={setAmount}
      />

      {/* Submit */}
      <TouchableOpacity
        style={[s.btn, submitting && { opacity: 0.5 }]}
        onPress={handleSubmit}
        disabled={submitting}
        activeOpacity={0.8}
      >
        <Text style={s.btnText}>{submitting ? "Saving…" : "Add Order"}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f0f11" },
  content: { padding: 20, paddingBottom: 60 },
  heading: { fontSize: 22, fontWeight: "700", color: "#fafafa", marginBottom: 4 },
  sub: { fontSize: 14, color: "#71717a", marginBottom: 24 },
  label: {
    fontSize: 12,
    fontWeight: "600",
    color: "#a1a1aa",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
    marginTop: 16,
  },
  vendorRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  vendorPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  vendorLabel: { fontSize: 13, fontWeight: "600" },
  input: {
    backgroundColor: "#18181b",
    borderWidth: 1,
    borderColor: "#27272a",
    borderRadius: 10,
    padding: 14,
    fontSize: 15,
    color: "#fafafa",
  },
  btn: {
    backgroundColor: "#6366f1",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 28,
  },
  btnText: { color: "#fff", fontSize: 15, fontWeight: "700" },
});
