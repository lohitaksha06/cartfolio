export default function Settings() {
  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius)",
        marginBottom: 20,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: "14px 20px",
          borderBottom: "1px solid var(--border)",
          fontSize: 13,
          fontWeight: 600,
          color: "var(--text-secondary)",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
        }}
      >
        {title}
      </div>
      <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 16 }}>
        {children}
      </div>
    </div>
  );

  const Row = ({
    icon,
    title,
    description,
    badge,
    action,
  }: {
    icon: string;
    title: string;
    description: string;
    badge?: { label: string; color: string };
    action?: React.ReactNode;
  }) => (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
      <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
        <span style={{ fontSize: 20, lineHeight: 1 }}>{icon}</span>
        <div>
          <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 2, display: "flex", alignItems: "center", gap: 8 }}>
            {title}
            {badge && (
              <span
                style={{
                  fontSize: 10,
                  padding: "2px 7px",
                  borderRadius: 99,
                  background: `${badge.color}22`,
                  color: badge.color,
                  fontWeight: 600,
                  textTransform: "uppercase",
                }}
              >
                {badge.label}
              </span>
            )}
          </div>
          <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{description}</div>
        </div>
      </div>
      {action}
    </div>
  );

  const PillBtn = ({ label, color = "var(--accent)" }: { label: string; color?: string }) => (
    <button
      style={{
        padding: "6px 14px",
        borderRadius: 99,
        background: `${color}18`,
        color,
        border: `1px solid ${color}33`,
        fontSize: 12,
        fontWeight: 600,
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </button>
  );

  return (
    <div style={{ maxWidth: 600, margin: "0 auto" }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>Settings</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>
          Manage how Cartfolio collects your order data.
        </p>
      </div>

      <Section title="Data Sources">
        <Row
          icon="✉️"
          title="Email Forwarding"
          description="Forward order confirmation emails to orders@cartfolio.app"
          badge={{ label: "Active", color: "#10B981" }}
          action={
            <div style={{ textAlign: "right" }}>
              <div style={{ fontFamily: "monospace", fontSize: 12, color: "var(--accent)", marginBottom: 6 }}>
                orders@cartfolio.app
              </div>
              <PillBtn label="Copy address" />
            </div>
          }
        />
        <Row
          icon="🔔"
          title="Android Notifications"
          description="Let Cartfolio read order notifications in real-time (Android only)"
          badge={{ label: "Coming soon", color: "#F59E0B" }}
          action={<PillBtn label="Enable" color="#F59E0B" />}
        />
        <Row
          icon="📧"
          title="Gmail OAuth"
          description="Connect Gmail to auto-import order emails without forwarding"
          badge={{ label: "Coming soon", color: "#6B7280" }}
          action={<PillBtn label="Connect" color="#6B7280" />}
        />
      </Section>

      <Section title="Supported Vendors">
        {[
          { name: "Amazon", emoji: "📦", status: "Parsing active", color: "#FF9900" },
          { name: "Flipkart", emoji: "🛍️", status: "Parsing active", color: "#2874F0" },
          { name: "Zomato", emoji: "🍽️", status: "Parsing active", color: "#E23744" },
          { name: "Blinkit", emoji: "⚡", status: "Parsing active", color: "#0C831F" },
          { name: "Swiggy", emoji: "🧡", status: "Coming soon", color: "#6B7280" },
        ].map((v) => (
          <Row
            key={v.name}
            icon={v.emoji}
            title={v.name}
            description={v.status}
            badge={{ label: v.status === "Coming soon" ? "Soon" : "On", color: v.color }}
          />
        ))}
      </Section>

      <Section title="Privacy & Data">
        <Row
          icon="🔒"
          title="Your data stays yours"
          description="Cartfolio never connects to retailer APIs or reads your inbox without permission."
        />
        <Row
          icon="🗑️"
          title="Delete all data"
          description="Permanently remove all orders and account data."
          action={
            <button
              style={{
                padding: "6px 14px",
                borderRadius: 99,
                background: "#EF444418",
                color: "#EF4444",
                border: "1px solid #EF444433",
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              Delete
            </button>
          }
        />
      </Section>
    </div>
  );
}
