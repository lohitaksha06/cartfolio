import { useEffect, useMemo, useState } from "react";
import type { Order, Vendor } from "@cartfolio/shared";
import { VENDOR_COLORS, VENDOR_LABELS } from "@cartfolio/shared";
import { formatCurrency } from "@cartfolio/shared/utils/formatters";
import { api } from "../services/api";

interface VendorBreakdown {
  vendor: Vendor;
  count: number;
  total: number;
}

export default function Dashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getOrders().then((data) => {
      setOrders(data);
      setLoading(false);
    });
  }, []);

  const stats = useMemo(() => {
    const totalSpend = orders.reduce((sum, order) => sum + order.total_amount, 0);
    const delivered = orders.filter((order) => order.status === "DELIVERED").length;
    const inTransit = orders.filter((order) =>
      ["PLACED", "CONFIRMED", "SHIPPED", "OUT_FOR_DELIVERY"].includes(order.status)
    ).length;

    return {
      totalOrders: orders.length,
      totalSpend,
      delivered,
      inTransit,
    };
  }, [orders]);

  const vendorBreakdown = useMemo(() => {
    const map = new Map<Vendor, VendorBreakdown>();

    for (const order of orders) {
      const existing = map.get(order.vendor);
      if (!existing) {
        map.set(order.vendor, {
          vendor: order.vendor,
          count: 1,
          total: order.total_amount,
        });
      } else {
        existing.count += 1;
        existing.total += order.total_amount;
      }
    }

    return [...map.values()].sort((a, b) => b.total - a.total);
  }, [orders]);

  const recentOrders = useMemo(() => {
    return [...orders]
      .sort((a, b) => new Date(b.order_date).getTime() - new Date(a.order_date).getTime())
      .slice(0, 5);
  }, [orders]);

  if (loading) {
    return <div style={{ maxWidth: 980, margin: "0 auto", color: "var(--text-secondary)" }}>Loading dashboard...</div>;
  }

  return (
    <div style={{ maxWidth: 980, margin: "0 auto" }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 30, fontWeight: 800, marginBottom: 4 }}>Dashboard</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>
          Quick overview of your order activity across apps.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
          gap: 12,
          marginBottom: 22,
        }}
      >
        {[
          { label: "Total Orders", value: stats.totalOrders },
          { label: "Total Spend", value: formatCurrency(stats.totalSpend) },
          { label: "Delivered", value: stats.delivered },
          { label: "In Transit", value: stats.inTransit },
        ].map((item) => (
          <div
            key={item.label}
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius)",
              padding: "16px 18px",
            }}
          >
            <div
              style={{
                fontSize: 11,
                color: "var(--text-muted)",
                marginBottom: 5,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              {item.label}
            </div>
            <div style={{ fontSize: 28, fontWeight: 800 }}>{item.value}</div>
          </div>
        ))}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.1fr 1fr",
          gap: 14,
        }}
      >
        <section
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius)",
            padding: 16,
          }}
        >
          <h2 style={{ fontSize: 15, marginBottom: 12, color: "var(--text-secondary)", fontWeight: 700 }}>
            Recent Orders
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {recentOrders.map((order) => (
              <div
                key={order.id}
                style={{
                  border: "1px solid var(--border)",
                  borderRadius: 10,
                  padding: "11px 12px",
                  background: "#1c1c22",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ color: VENDOR_COLORS[order.vendor], fontWeight: 700 }}>
                    {VENDOR_LABELS[order.vendor]}
                  </span>
                  <span style={{ fontWeight: 700 }}>{formatCurrency(order.total_amount)}</span>
                </div>
                <div style={{ color: "var(--text-secondary)", fontSize: 13 }}>
                  {order.items[0]?.name ?? "Order item"}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius)",
            padding: 16,
          }}
        >
          <h2 style={{ fontSize: 15, marginBottom: 12, color: "var(--text-secondary)", fontWeight: 700 }}>
            Spend by Vendor
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {vendorBreakdown.map((row) => (
              <div key={row.vendor}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ color: VENDOR_COLORS[row.vendor], fontWeight: 700 }}>
                    {VENDOR_LABELS[row.vendor]}
                  </span>
                  <span style={{ color: "var(--text-secondary)", fontSize: 13 }}>
                    {formatCurrency(row.total)} · {row.count} orders
                  </span>
                </div>
                <div
                  style={{
                    height: 8,
                    borderRadius: 99,
                    background: "#202028",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${stats.totalSpend > 0 ? (row.total / stats.totalSpend) * 100 : 0}%`,
                      height: "100%",
                      background: VENDOR_COLORS[row.vendor],
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
