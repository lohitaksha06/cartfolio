import React from "react";
import { View, Text, StyleSheet } from "react-native";
import type { OrderStatus } from "@cartfolio/shared";
import { STATUS_LABELS } from "@cartfolio/shared";
import { getStatusColor } from "@cartfolio/shared/utils/formatters";

interface Props {
  status: OrderStatus;
}

export default function StatusBadge({ status }: Props) {
  const color = getStatusColor(status);
  return (
    <View style={[s.pill, { backgroundColor: color + "22" }]}>
      <View style={[s.dot, { backgroundColor: color }]} />
      <Text style={[s.label, { color }]}>{STATUS_LABELS[status]}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 99,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  label: {
    fontSize: 11,
    fontWeight: "600",
  },
});
