import { useEffect, useState } from "react";
import type { Order, Vendor } from "../../../../shared/types/index";
import { VENDOR_LABELS } from "../../../../shared/types/index";
import { formatCurrency } from "../../../../shared/utils/formatters";
import { api } from "../services/api";
import OrderCard from "../components/OrderCard";
import EmptyState from "../components/EmptyState";

const VENDORS: Vendor[] = ["AMAZON", "FLIPKART", "ZOMATO", "BLINKIT", "SWIGGY"];

export default function Home() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeVendor, setActiveVendor] = useState<Vendor | undefined>(undefined);
  const [search, setSearch] = useState("");
  const [stats, setStats] = useState({ totalOrders: 0, totalSpend: 0, delivered: 0, inTransit: 0 });

  useEffect(() => {
    api.getStats().then(setStats);
  }, []);

  useEffect(() => {
    setLoading(true);
    api
      .getOrders({ vendor: activeVendor, search: search || undefined })
      .then((data) => {
        setOrders(data);
        setLoading(false);
      });
  }, [activeVendor, search]);

  return (
    <div style={{ maxWidth: 780, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 4 }}>Your Orders</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>
          Everything you've ordered, in one place.
        </p>
      </div>

      {/* Stats */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 12,
          marginBottom: 28,
        }}
      >
        {[
          { label: "Total Orders", value: stats.totalOrders },
          { label: "Total Spend", value: formatCurrency(stats.totalSpend) },
          { label: "Delivered", value: stats.delivered },
          { label: "In Transit", value: stats.inTransit },
        ].map((s) => (
          <div
            key={s.label}
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius)",
              padding: "14px 16px",
            }}
          >
            <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              {s.label}
            </div>
            <div style={{ fontSize: 22, fontWeight: 700 }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="Search orders..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          width: "100%",
          padding: "10px 14px",
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-sm)",
          color: "var(--text-primary)",
          fontSize: 14,
          outline: "none",
          marginBottom: 16,
        }}
      />

      {/* Vendor filters */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        <button
          onClick={() => setActiveVendor(undefined)}
          style={{
            padding: "6px 14px",
            borderRadius: 99,
            border: "1px solid",
            fontSize: 13,
            fontWeight: 500,
            borderColor: !activeVendor ? "var(--accent)" : "var(--border)",
            background: !activeVendor ? "#6366f118" : "transparent",
            color: !activeVendor ? "var(--accent)" : "var(--text-secondary)",
          }}
        >
          All
        </button>
        {VENDORS.map((v) => (
          <button
            key={v}
            onClick={() => setActiveVendor(activeVendor === v ? undefined : v)}
            style={{
              padding: "6px 14px",
              borderRadius: 99,
              border: "1px solid",
              fontSize: 13,
              fontWeight: 500,
              borderColor: activeVendor === v ? "var(--accent)" : "var(--border)",
              background: activeVendor === v ? "#6366f118" : "transparent",
              color: activeVendor === v ? "var(--accent)" : "var(--text-secondary)",
            }}
          >
            {VENDOR_LABELS[v]}
          </button>
        ))}
      </div>

      {/* Order list */}
      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              style={{
                height: 96,
                background: "var(--bg-card)",
                borderRadius: "var(--radius)",
                border: "1px solid var(--border)",
                animation: "pulse 1.5s infinite",
              }}
            />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <EmptyState message="No orders match your filters." />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
}
