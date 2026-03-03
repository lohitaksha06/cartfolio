import { NavLink } from "react-router-dom";

const links = [
  { to: "/orders", label: "Orders", icon: "📦" },
  { to: "/add", label: "Add Order", icon: "➕" },
  { to: "/settings", label: "Settings", icon: "⚙️" },
];

export default function Navbar() {
  return (
    <nav
      style={{
        width: 220,
        background: "var(--bg-card)",
        borderRight: "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        padding: "24px 16px",
        flexShrink: 0,
      }}
    >
      {/* Logo */}
      <div style={{ marginBottom: 32, paddingLeft: 8 }}>
        <span style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)" }}>
          🛒 Cartfolio
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
              fontSize: 14,
              fontWeight: 500,
              color: isActive ? "var(--text-primary)" : "var(--text-secondary)",
              background: isActive ? "var(--bg-card-hover)" : "transparent",
              transition: "all 0.15s",
            })}
          >
            <span>{l.icon}</span>
            {l.label}
          </NavLink>
        ))}
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
