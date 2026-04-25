import { NavLink } from "react-router-dom";

const links = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/orders", label: "Orders" },
  { to: "/add", label: "Add Order" },
  { to: "/about", label: "About" },
  { to: "/settings", label: "Settings" },
];

const vendors = [
  { to: "/vendor/amazon", label: "Amazon", color: "#FF9900" },
  { to: "/vendor/flipkart", label: "Flipkart", color: "#2874F0" },
  { to: "/vendor/zomato", label: "Zomato", color: "#E23744" },
  { to: "/vendor/blinkit", label: "Blinkit", color: "#0C831F" },
];

export default function Navbar() {
  return (
    <nav
      style={{
        width: 290,
        background: "linear-gradient(180deg, #18181b 0%, #15151a 100%)",
        borderRight: "1px solid #2f2f36",
        boxShadow: "inset -1px 0 0 #2f2f36, 8px 0 24px rgba(0,0,0,0.28)",
        display: "flex",
        flexDirection: "column",
        padding: "28px 18px",
        flexShrink: 0,
      }}
    >
      {/* Logo */}
      <div style={{ marginBottom: 34, paddingLeft: 8 }}>
        <span style={{ fontSize: 32, fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
          Cartfolio
        </span>
      </div>

      {/* Nav links */}
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            style={({ isActive }) => ({
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 12px",
              borderRadius: "var(--radius-sm)",
              fontSize: 16,
              fontWeight: 600,
              color: isActive ? "var(--text-primary)" : "var(--text-secondary)",
              background: isActive ? "#22222b" : "transparent",
              border: isActive ? "1px solid #343441" : "1px solid transparent",
              transition: "all 0.15s",
            })}
          >
            {l.label}
          </NavLink>
        ))}
      </div>

      {/* Vendor shortcuts */}
      <div style={{ marginTop: 28 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", paddingLeft: 12, marginBottom: 8 }}>
          Apps
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {vendors.map((v) => (
            <NavLink
              key={v.to}
              to={v.to}
              style={({ isActive }) => ({
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "8px 12px",
                borderRadius: "var(--radius-sm)",
                fontSize: 14,
                fontWeight: 500,
                color: isActive ? v.color : "var(--text-secondary)",
                background: isActive ? `${v.color}12` : "transparent",
                border: isActive ? `1px solid ${v.color}44` : "1px solid transparent",
                transition: "all 0.15s",
              })}
            >
              {v.label}
            </NavLink>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          marginTop: "auto",
          paddingLeft: 8,
          fontSize: 11,
          color: "var(--text-muted)",
        }}
      >
        v0.1 · MVP
      </div>
    </nav>
  );
}
