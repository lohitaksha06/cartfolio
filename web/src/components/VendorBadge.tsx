import type { Vendor } from "@cartfolio/shared";
import { VENDOR_LABELS, VENDOR_COLORS } from "@cartfolio/shared";

const VENDOR_EMOJIS: Record<Vendor, string> = {
  AMAZON: "📦",
  FLIPKART: "🛍️",
  ZOMATO: "🍽️",
  BLINKIT: "⚡",
  SWIGGY: "🧡",
  OTHER: "🏪",
};

interface Props {
  vendor: Vendor;
  size?: "sm" | "md";
}

export default function VendorBadge({ vendor, size = "md" }: Props) {
  const color = VENDOR_COLORS[vendor];
  const fontSize = size === "sm" ? 11 : 12;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: size === "sm" ? "2px 8px" : "4px 10px",
        borderRadius: 99,
        fontSize,
        fontWeight: 600,
        background: `${color}18`,
        color,
        border: `1px solid ${color}33`,
      }}
    >
      {VENDOR_EMOJIS[vendor]} {VENDOR_LABELS[vendor]}
    </span>
  );
}
