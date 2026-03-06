import React from "react";
import { View, Text, StyleSheet } from "react-native";
import type { Vendor } from "@cartfolio/shared";
import { VENDOR_LABELS, VENDOR_COLORS } from "@cartfolio/shared";

const VENDOR_EMOJI: Record<Vendor, string> = {
  AMAZON: "📦",
  FLIPKART: "🛍️",
  ZOMATO: "🍽️",
  BLINKIT: "⚡",
  SWIGGY: "🧡",
  OTHER: "📋",
};

interface Props {
  vendor: Vendor;
}

export default function VendorBadge({ vendor }: Props) {
  const color = VENDOR_COLORS[vendor];
  return (
    <View style={[s.pill, { backgroundColor: color + "22", borderColor: color + "44" }]}>
      <Text style={s.emoji}>{VENDOR_EMOJI[vendor]}</Text>
      <Text style={[s.label, { color }]}>{VENDOR_LABELS[vendor]}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 99,
    borderWidth: 1,
  },
  emoji: {
    fontSize: 12,
  },
  label: {
    fontSize: 11,
    fontWeight: "700",
  },
});
