import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import type { Order, Vendor } from "@cartfolio/shared";
import { VENDOR_LABELS, VENDOR_COLORS } from "@cartfolio/shared";
import { formatCurrency } from "@cartfolio/shared/utils/formatters";
import { api } from "../services/api";
import OrderCard from "../components/OrderCard";
import EmptyState from "../components/EmptyState";

export default function VendorDetail() {
  const { vendor } = useParams<{ vendor: string }>();
  const navigate = useNavigate();
  const v = (vendor?.toUpperCase() || "OTHER") as Vendor;
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([api.getOrders({ vendor: v }), api.getVendorConnectionStatus(v)]).then(([data, connection]) => {
      setOrders(data);
      setConnected(connection.connected);
      setLoading(false);
    });
  }, [v]);

  const handleConnect = async () => {
    setConnecting(true);
    try {
      const status = await api.connectVendor(v);
      setConnected(status.connected);
    } finally {
      setConnecting(false);
    }
  };

  const totalSpent = orders.reduce((s, o) => s + o.total_amount, 0);
  const delivered = orders.filter((o) => o.status === "DELIVERED").length;
  const color = VENDOR_COLORS[v] || "#6B7280";
  const canConnect = v !== "OTHER";

  return (
    <div style={{ maxWidth: 780, margin: "0 auto" }}>
      {/* Back */}
      <button
        onClick={() => navigate("/orders")}
        style={{ background: "none", border: "none", color: "var(--text-secondary)", fontSize: 14, marginBottom: 20, padding: 0, cursor: "pointer" }}
      >
        ← Back to all orders
      </button>

      {/* Vendor header */}
      <div
        style={{
          background: `${color}10`,
          border: `1px solid ${color}30`,
          borderRadius: "var(--radius)",
          padding: "24px 28px",
          marginBottom: 24,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>{VENDOR_LABELS[v]}</h1>
            <p style={{ color: "var(--text-secondary)", fontSize: 13, margin: "4px 0 0" }}>
              {orders.length} order{orders.length !== 1 ? "s" : ""} · {delivered} delivered
            </p>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>
            Total Spent
          </div>
          <div style={{ fontSize: 26, fontWeight: 700, color }}>{formatCurrency(totalSpent)}</div>
        </div>
      </div>

      {canConnect && !connected && (
        <div
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius)",
            padding: "18px 20px",
            marginBottom: 20,
            display: "flex",
            justifyContent: "space-between",
            gap: 12,
            alignItems: "center",
          }}
        >
          <div>
            <div style={{ fontSize: 16, fontWeight: 600, color: "var(--text-primary)", marginBottom: 4 }}>
              Welcome. Do you want to connect your {VENDOR_LABELS[v]} account?
            </div>
            <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>
              Connect to auto-import new orders and delivery updates.
            </div>
          </div>
          <button
            onClick={handleConnect}
            disabled={connecting}
            style={{
              background: color,
              color: "#fff",
              border: "none",
              borderRadius: 8,
              padding: "10px 14px",
              fontSize: 13,
              fontWeight: 600,
              cursor: connecting ? "not-allowed" : "pointer",
              opacity: connecting ? 0.7 : 1,
              whiteSpace: "nowrap",
            }}
          >
            {connecting ? "Connecting..." : `Connect ${VENDOR_LABELS[v]}`}
          </button>
        </div>
      )}

      {canConnect && connected && (
        <div
          style={{
            marginBottom: 20,
            fontSize: 13,
            color: color,
            background: `${color}14`,
            border: `1px solid ${color}33`,
            borderRadius: 8,
            padding: "8px 12px",
            display: "inline-flex",
            fontWeight: 600,
          }}
        >
          {VENDOR_LABELS[v]} connected
        </div>
      )}

      {/* Status tabs */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
        {[
          { label: "All", count: orders.length },
          { label: "Delivered", count: delivered },
          { label: "In Transit", count: orders.filter((o) => ["SHIPPED", "OUT_FOR_DELIVERY"].includes(o.status)).length },
          { label: "Placed", count: orders.filter((o) => o.status === "PLACED").length },
        ].map((tab) => (
          <div
            key={tab.label}
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-sm)",
              padding: "10px 16px",
              fontSize: 13,
              flex: 1,
              textAlign: "center",
            }}
          >
            <div style={{ fontWeight: 700, fontSize: 20 }}>{tab.count}</div>
            <div style={{ color: "var(--text-muted)", marginTop: 2 }}>{tab.label}</div>
          </div>
        ))}
      </div>

      {/* Orders */}
      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {[1, 2, 3].map((i) => (
            <div key={i} style={{ height: 96, background: "var(--bg-card)", borderRadius: "var(--radius)", border: "1px solid var(--border)" }} />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <EmptyState message={`No orders from ${VENDOR_LABELS[v]} yet.`} />
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
