import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import type { Order } from "@cartfolio/shared";
import { formatCurrency, formatDate } from "@cartfolio/shared/utils/formatters";
import { api } from "../services/api";
import VendorBadge from "../components/VendorBadge";
import StatusBadge from "../components/StatusBadge";

const SOURCE_LABELS = { MANUAL: "Manual entry", EMAIL: "Email forwarding", NOTIFICATION: "Android notification", TRACKING_API: "Tracking API" };

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    api.getOrderById(id).then((o) => {
      setOrder(o);
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return (
      <div style={{ maxWidth: 640, margin: "0 auto" }}>
        <div style={{ height: 300, background: "var(--bg-card)", borderRadius: "var(--radius)", border: "1px solid var(--border)" }} />
      </div>
    );
  }

  if (!order) {
    return (
      <div style={{ maxWidth: 640, margin: "0 auto", textAlign: "center", paddingTop: 80 }}>
        <p style={{ fontSize: 48 }}>🔍</p>
        <p style={{ color: "var(--text-secondary)", marginTop: 12 }}>Order not found.</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 640, margin: "0 auto" }}>
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        style={{
          background: "none",
          border: "none",
          color: "var(--text-secondary)",
          fontSize: 14,
          marginBottom: 20,
          padding: 0,
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        ← Back
      </button>

      {/* Card */}
      <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "24px" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <VendorBadge vendor={order.vendor} />
            <StatusBadge status={order.status} />
          </div>
          <span style={{ fontSize: 28, fontWeight: 700 }}>{formatCurrency(order.total_amount)}</span>
        </div>

        <div style={{ borderTop: "1px solid var(--border)", marginBottom: 20 }} />

        {/* Meta */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
          {[
            { label: "Order Date", value: formatDate(order.order_date) },
            { label: "Order ID", value: order.id },
            { label: "Source", value: SOURCE_LABELS[order.source] },
            { label: "Category", value: order.category },
          ].map(({ label, value }) => (
            <div key={label}>
              <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>
                {label}
              </div>
              <div style={{ fontSize: 14, color: "var(--text-primary)" }}>{value}</div>
            </div>
          ))}
        </div>

        <div style={{ borderTop: "1px solid var(--border)", marginBottom: 20 }} />

        {/* Items */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Items
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {order.items.map((item) => (
              <div key={item.id} style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
                <span style={{ color: "var(--text-primary)" }}>
                  {item.name} {item.quantity > 1 && <span style={{ color: "var(--text-muted)" }}>×{item.quantity}</span>}
                </span>
                <span style={{ color: "var(--text-secondary)", fontWeight: 500 }}>{formatCurrency(item.price)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tracking */}
        {order.tracking && (
          <>
            <div style={{ borderTop: "1px solid var(--border)", marginBottom: 20 }} />
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Tracking
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--text-muted)" }}>Carrier</span>
                  <span>{order.tracking.carrier}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--text-muted)" }}>Tracking No.</span>
                  <span style={{ fontFamily: "monospace", fontSize: 13 }}>{order.tracking.tracking_number}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--text-muted)" }}>Last Update</span>
                  <span style={{ color: "#8B5CF6", fontWeight: 500 }}>{order.tracking.last_status}</span>
                </div>
                {order.tracking.estimated_delivery && (
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--text-muted)" }}>Est. Delivery</span>
                    <span>{formatDate(order.tracking.estimated_delivery)}</span>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
