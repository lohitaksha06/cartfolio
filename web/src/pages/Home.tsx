import { useEffect, useMemo, useState } from "react";
import type { Order, Vendor } from "@cartfolio/shared";
import { VENDOR_COLORS, VENDOR_LABELS } from "@cartfolio/shared";
import { formatCurrency } from "@cartfolio/shared/utils/formatters";
import { api } from "../services/api";
import OrderCard from "../components/OrderCard";
import EmptyState from "../components/EmptyState";

const VENDORS: Vendor[] = ["AMAZON", "FLIPKART", "ZOMATO", "BLINKIT", "SWIGGY"];

const RECOMMENDATION_CATALOG: Array<{ id: string; name: string; vendor: Vendor; price: number }> = [
  { id: "rec_1", name: "Wireless Gaming Mouse", vendor: "FLIPKART", price: 1599 },
  { id: "rec_2", name: "Mechanical Keyboard Wrist Rest", vendor: "AMAZON", price: 799 },
  { id: "rec_3", name: "USB-C Multiport Hub", vendor: "AMAZON", price: 2399 },
  { id: "rec_4", name: "Noise Cancelling Earbuds", vendor: "FLIPKART", price: 3499 },
  { id: "rec_5", name: "Protein Brownie Box", vendor: "BLINKIT", price: 299 },
  { id: "rec_6", name: "Chicken Meal Combo", vendor: "ZOMATO", price: 399 },
  { id: "rec_7", name: "4K HDMI Cable", vendor: "AMAZON", price: 549 },
  { id: "rec_8", name: "Smartwatch Silicone Strap", vendor: "FLIPKART", price: 699 },
  { id: "rec_9", name: "Cold Brew Coffee Pack", vendor: "BLINKIT", price: 249 },
  { id: "rec_10", name: "Paneer Tikka Bowl", vendor: "ZOMATO", price: 329 },
];

const VENDOR_SEARCH_URL: Record<Vendor, (query: string) => string> = {
  AMAZON: (q) => `https://www.amazon.in/s?k=${encodeURIComponent(q)}`,
  FLIPKART: (q) => `https://www.flipkart.com/search?q=${encodeURIComponent(q)}`,
  ZOMATO: (q) => `https://www.zomato.com/search?q=${encodeURIComponent(q)}`,
  BLINKIT: (q) => `https://blinkit.com/s/?q=${encodeURIComponent(q)}`,
  SWIGGY: (q) => `https://www.swiggy.com/search?query=${encodeURIComponent(q)}`,
  OTHER: (q) => `https://www.google.com/search?q=${encodeURIComponent(q)}`,
};

function tokenize(input: string): string[] {
  return input
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((x) => x.length > 2);
}

export default function Home() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeVendor, setActiveVendor] = useState<Vendor | undefined>(undefined);
  const [search, setSearch] = useState("");
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [stats, setStats] = useState({ totalOrders: 0, totalSpend: 0, delivered: 0, inTransit: 0 });

  useEffect(() => {
    Promise.all([api.getStats(), api.getOrders()]).then(([nextStats, initialOrders]) => {
      setStats(nextStats);
      setAllOrders(initialOrders);
    });

    const persisted = localStorage.getItem("cartfolio_recent_searches");
    if (persisted) {
      try {
        const parsed = JSON.parse(persisted) as string[];
        setRecentSearches(parsed.slice(0, 5));
      } catch {
        setRecentSearches([]);
      }
    }
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

  useEffect(() => {
    const q = search.trim().toLowerCase();
    if (q.length < 3) return;

    const handle = setTimeout(() => {
      setRecentSearches((prev) => {
        const next = [q, ...prev.filter((x) => x !== q)].slice(0, 5);
        localStorage.setItem("cartfolio_recent_searches", JSON.stringify(next));
        return next;
      });
    }, 500);

    return () => clearTimeout(handle);
  }, [search]);

  const recommendations = useMemo(() => {
    const terms = tokenize([search, ...recentSearches].join(" "));
    const recentVendors = [...allOrders]
      .sort((a, b) => new Date(b.order_date).getTime() - new Date(a.order_date).getTime())
      .slice(0, 6)
      .map((o) => o.vendor);

    const vendorBoost = (vendor: Vendor) => {
      const idx = recentVendors.indexOf(vendor);
      return idx === -1 ? 0 : Math.max(0, 6 - idx);
    };

    const scored = RECOMMENDATION_CATALOG.map((item) => {
      const itemWords = tokenize(item.name);
      const keywordScore = terms.reduce((acc, t) => (itemWords.some((w) => w.includes(t)) ? acc + 3 : acc), 0);
      const filterScore = activeVendor && item.vendor === activeVendor ? 2 : 0;
      const score = keywordScore + vendorBoost(item.vendor) + filterScore;

      return {
        ...item,
        score,
        reason:
          keywordScore > 0
            ? `Based on your recent search: "${terms[0]}"`
            : `Popular among your recent ${VENDOR_LABELS[item.vendor]} orders`,
      };
    })
      .sort((a, b) => b.score - a.score || a.price - b.price)
      .slice(0, 6);

    return scored;
  }, [search, recentSearches, allOrders, activeVendor]);

  const openRecommendation = (vendor: Vendor, itemName: string) => {
    const vendorLabel = VENDOR_LABELS[vendor];
    const confirmed = window.confirm(
      `Do you want to open ${vendorLabel} app/website for \"${itemName}\"?`
    );

    if (!confirmed) return;

    const urlBuilder = VENDOR_SEARCH_URL[vendor] ?? VENDOR_SEARCH_URL.OTHER;
    window.open(urlBuilder(itemName), "_blank", "noopener,noreferrer");
  };

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "minmax(0, 1fr) 320px",
        gap: 22,
        alignItems: "start",
      }}
    >
      <div style={{ minWidth: 0 }}>
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

      <aside style={{ position: "sticky", top: 24 }}>
        <div
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius)",
            padding: 14,
          }}
        >
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>Recommended For You</h3>
          <p style={{ color: "var(--text-muted)", fontSize: 12, marginBottom: 12 }}>
            Personalized using your recent searches and order history.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {recommendations.map((item) => (
              <div
                key={item.id}
                onClick={() => openRecommendation(item.vendor, item.name)}
                style={{
                  background: "#1c1c22",
                  border: "1px solid var(--border)",
                  borderRadius: 10,
                  padding: "10px 11px",
                  cursor: "pointer",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{item.name}</div>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>{formatCurrency(item.price)}</div>
                </div>

                <div style={{ marginTop: 7, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      borderRadius: 99,
                      padding: "3px 8px",
                      color: VENDOR_COLORS[item.vendor],
                      background: `${VENDOR_COLORS[item.vendor]}22`,
                    }}
                  >
                    Recommended by {VENDOR_LABELS[item.vendor]}
                  </span>
                </div>

                <div style={{ marginTop: 6, fontSize: 11, color: "var(--text-muted)" }}>{item.reason}</div>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}
