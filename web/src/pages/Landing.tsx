import { useState } from "react";
import { Link } from "react-router-dom";
import { isSupabaseConfigured, supabase } from "../lib/supabase";

export default function Landing() {
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [googleError, setGoogleError] = useState<string | null>(null);

  const signInWithGoogle = async () => {
    if (!supabase) {
      setGoogleError("Supabase is not configured in this app yet.");
      return;
    }

    setGoogleError(null);
    setLoadingGoogle(true);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });

    if (error) {
      setGoogleError(error.message);
      setLoadingGoogle(false);
    }
  };

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

      <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", justifyContent: "center" }}>
        <button
          onClick={signInWithGoogle}
          disabled={loadingGoogle || !isSupabaseConfigured}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "12px 24px",
            fontSize: "1rem",
            cursor: "pointer",
            background: "white",
            color: "#757575",
            border: "1px solid #ddd",
            borderRadius: "6px",
            fontWeight: "500",
            opacity: loadingGoogle || !isSupabaseConfigured ? 0.7 : 1,
          }}
        >
          <svg width="18" height="18" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.14 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          </svg>
          {loadingGoogle
            ? "Redirecting..."
            : isSupabaseConfigured
              ? "Sign in with Google"
              : "Google sign-in not configured"}
        </button>
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

      {googleError ? (
        <p style={{ marginTop: "18px", color: "#d32f2f", maxWidth: "520px" }}>{googleError}</p>
      ) : null}

      {!isSupabaseConfigured ? (
        <p style={{ marginTop: "18px", color: "var(--text-secondary)", maxWidth: "520px" }}>
          Add <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> to your
          environment file, then restart the dev server.
        </p>
      ) : null}
    </div>
  );
}
