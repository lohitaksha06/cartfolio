import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Vendor, OrderStatus } from "../../../../shared/types/index";
import { VENDOR_LABELS, CATEGORY_FOR_VENDOR } from "../../../../shared/types/index";
import { api } from "../services/api";

const VENDORS: Vendor[] = ["AMAZON", "FLIPKART", "ZOMATO", "BLINKIT", "SWIGGY", "OTHER"];

export default function AddOrder() {
  const navigate = useNavigate();
  const [vendor, setVendor] = useState<Vendor>("AMAZON");
  const [status, setStatus] = useState<OrderStatus>("PLACED");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [amount, setAmount] = useState("");
  const [itemName, setItemName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName.trim() || !amount) {
      setError("Item name and amount are required.");
      return;
    }
    setSaving(true);
    await api.addOrder({
      user_id: "usr_1",
      vendor,
      category: CATEGORY_FOR_VENDOR[vendor],
      source: "MANUAL",
      order_date: new Date(date).toISOString(),
      status,
      total_amount: parseFloat(amount),
      currency: "INR",
      items: [
        {
          id: `itm_${Date.now()}`,
          order_id: "",
          name: itemName.trim(),
          quantity: 1,
          price: parseFloat(amount),
        },
      ],
    });
    setSaving(false);
    navigate("/orders");
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px 14px",
    background: "#0f0f11",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-sm)",
    color: "var(--text-primary)",
    fontSize: 14,
    outline: "none",
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 13,
    fontWeight: 500,
    color: "var(--text-secondary)",
    marginBottom: 6,
    display: "block",
  };

  return (
    <div style={{ maxWidth: 520, margin: "0 auto" }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>Add Order</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>
          Manually track a purchase not yet in your timeline.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius)",
          padding: 24,
          display: "flex",
          flexDirection: "column",
          gap: 18,
        }}
      >
        {/* Vendor */}
        <div>
          <label style={labelStyle}>Vendor</label>
          <select
            value={vendor}
            onChange={(e) => setVendor(e.target.value as Vendor)}
            style={inputStyle}
          >
            {VENDORS.map((v) => (
              <option key={v} value={v}>
                {VENDOR_LABELS[v]}
              </option>
            ))}
          </select>
        </div>

        {/* Item name */}
        <div>
          <label style={labelStyle}>Item / Order Description</label>
          <input
            type="text"
            placeholder="e.g. iPhone 15, Chicken Biryani"
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            style={inputStyle}
          />
        </div>

        {/* Amount */}
        <div>
          <label style={labelStyle}>Total Amount (₹)</label>
          <input
            type="number"
            placeholder="e.g. 12999"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min={0}
            style={inputStyle}
          />
        </div>

        {/* Date */}
        <div>
          <label style={labelStyle}>Order Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            style={inputStyle}
          />
        </div>

        {/* Status */}
        <div>
          <label style={labelStyle}>Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as OrderStatus)}
            style={inputStyle}
          >
            {(["PLACED", "CONFIRMED", "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED"] as OrderStatus[]).map((s) => (
              <option key={s} value={s}>
                {s.replace(/_/g, " ")}
              </option>
            ))}
          </select>
        </div>

        {error && (
          <p style={{ color: "#EF4444", fontSize: 13 }}>{error}</p>
        )}

        <button
          type="submit"
          disabled={saving}
          style={{
            padding: "12px",
            background: saving ? "#4f46e5" : "var(--accent)",
            border: "none",
            borderRadius: "var(--radius-sm)",
            color: "#fff",
            fontSize: 15,
            fontWeight: 600,
            opacity: saving ? 0.7 : 1,
          }}
        >
          {saving ? "Saving…" : "Add Order"}
        </button>
      </form>
    </div>
  );
}
