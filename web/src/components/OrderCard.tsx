import { useNavigate } from "react-router-dom";
import type { Order } from "@cartfolio/shared";
import { formatCurrency, formatRelativeDate } from "@cartfolio/shared/utils/formatters";
import VendorBadge from "./VendorBadge";
import StatusBadge from "./StatusBadge";

const SOURCE_LABELS = { MANUAL: "Manual", EMAIL: "Email", NOTIFICATION: "Notification", TRACKING_API: "Tracking" };

interface Props {
  order: Order;
}

export default function OrderCard({ order }: Props) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/orders/${order.id}`)}
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius)",
        padding: "16px 20px",
        cursor: "pointer",
        transition: "border-color 0.15s, background 0.15s",
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = "#3f3f46";
        (e.currentTarget as HTMLDivElement).style.background = "var(--bg-card-hover)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border)";
        (e.currentTarget as HTMLDivElement).style.background = "var(--bg-card)";
      }}
    >
      {/* Top row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <VendorBadge vendor={order.vendor} size="sm" />
          <StatusBadge status={order.status} />
        </div>
        <span style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)" }}>
          {formatCurrency(order.total_amount)}
        </span>
      </div>

      {/* Items */}
      <div style={{ fontSize: 14, color: "var(--text-primary)", fontWeight: 500 }}>
        {order.items
          .filter((i) => !["Delivery fee", "Delivery & taxes"].includes(i.name))
          .slice(0, 2)
          .map((i) => i.name)
          .join(", ")}
        {order.items.length > 2 && (
          <span style={{ color: "var(--text-muted)" }}> +{order.items.length - 2} more</span>
        )}
      </div>

      {/* Bottom row */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: 12,
          color: "var(--text-muted)",
        }}
      >
        <span>{formatRelativeDate(order.order_date)}</span>
        <span>via {SOURCE_LABELS[order.source]}</span>
      </div>

      {/* Tracking info */}
      {order.tracking && order.status !== "DELIVERED" && (
        <div
          style={{
            borderTop: "1px solid var(--border)",
            paddingTop: 8,
            fontSize: 12,
            color: "#8B5CF6",
            fontWeight: 500,
          }}
        >
          {order.tracking.last_status}
          {order.tracking.estimated_delivery && (
            <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>
              {" "}· ETA {new Date(order.tracking.estimated_delivery).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
