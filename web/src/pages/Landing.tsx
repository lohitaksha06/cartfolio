import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        textAlign: "center",
      }}
    >
      <h1 style={{ fontSize: "3rem", marginBottom: "16px" }}>Cartfolio</h1>
      <p style={{ fontSize: "1.2rem", color: "var(--text-secondary)", marginBottom: "32px" }}>
        Your personal purchase history & delivery tracker — all in one place.
      </p>

      <div style={{ display: "flex", gap: "16px" }}>
        <button
          style={{
            padding: "12px 24px",
            fontSize: "1rem",
            cursor: "pointer",
            background: "var(--primary)",
            color: "white",
            border: "none",
            borderRadius: "6px",
          }}
        >
          Login
        </button>
        <button
          style={{
            padding: "12px 24px",
            fontSize: "1rem",
            cursor: "pointer",
            background: "var(--surface)",
            color: "var(--text)",
            border: "1px solid var(--border)",
            borderRadius: "6px",
          }}
        >
          Signup
        </button>
        <Link to="/dashboard" style={{ textDecoration: "none" }}>
          <button
            style={{
              padding: "12px 24px",
              fontSize: "1rem",
              cursor: "pointer",
              background: "var(--primary)",
              color: "white",
              border: "none",
              borderRadius: "6px",
            }}
          >
            Dashboard
          </button>
        </Link>
      </div>
    </div>
  );
}
