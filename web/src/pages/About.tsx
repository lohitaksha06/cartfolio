export default function About() {
  return (
    <div style={{ maxWidth: 860, margin: "0 auto" }}>
      <div style={{ marginBottom: 22 }}>
        <h1 style={{ fontSize: 30, fontWeight: 800, marginBottom: 4 }}>About Cartfolio</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>
          A personal purchase timeline for shopping, food, and grocery orders.
        </p>
      </div>

      <section
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius)",
          padding: 18,
          marginBottom: 14,
        }}
      >
        <h2 style={{ fontSize: 18, marginBottom: 10 }}>What It Does</h2>
        <p style={{ color: "var(--text-secondary)", lineHeight: 1.65, marginBottom: 10 }}>
          Cartfolio gives you one place to track all your orders from apps like Amazon, Flipkart,
          Zomato, and Blinkit. Instead of checking every app separately, you get a single timeline,
          delivery status, and vendor-wise insights.
        </p>
        <p style={{ color: "var(--text-secondary)", lineHeight: 1.65 }}>
          You can add orders manually today, and connect Gmail to auto-import order confirmations.
          The backend parsing layer is already prepared for email ingestion and normalization.
        </p>
      </section>

      <section
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius)",
          padding: 18,
          marginBottom: 14,
        }}
      >
        <h2 style={{ fontSize: 18, marginBottom: 10 }}>Current Stack</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 10 }}>
          {[
            "Web: React + Vite + React Router",
            "Backend: Express + TypeScript",
            "Mobile: Expo + React Native",
            "Shared: Central types + formatters",
            "Data: Mock API today, Supabase-ready schema",
            "Email: Gmail OAuth + vendor parsers",
          ].map((item) => (
            <div
              key={item}
              style={{
                background: "#1d1d24",
                border: "1px solid var(--border)",
                borderRadius: 10,
                padding: "10px 12px",
                color: "var(--text-secondary)",
                fontSize: 14,
              }}
            >
              {item}
            </div>
          ))}
        </div>
      </section>

      <section
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius)",
          padding: 18,
        }}
      >
        <h2 style={{ fontSize: 18, marginBottom: 10 }}>Roadmap</h2>
        <ul style={{ color: "var(--text-secondary)", lineHeight: 1.8, paddingLeft: 18 }}>
          <li>Connect Supabase for persistent multi-user data</li>
          <li>Enable secure Gmail token storage and scheduled scans</li>
          <li>Add push notifications for shipped/out-for-delivery updates</li>
          <li>Introduce monthly spend trends and category analytics</li>
        </ul>
      </section>
    </div>
  );
}
