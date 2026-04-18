import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "../services/api";

export default function Settings() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [gmailConnected, setGmailConnected] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<{ imported: number } | null>(null);
  const [copied, setCopied] = useState(false);

  // Check Gmail status on mount & handle OAuth callback
  useEffect(() => {
    api.getGmailStatus().then((s) => setGmailConnected(s.connected));

    if (searchParams.get("gmail") === "connected") {
      api.connectGmail().then(() => {
        setGmailConnected(true);
        setSearchParams({}, { replace: true });
      });
    }
  }, [searchParams, setSearchParams]);

  const handleGmailConnect = useCallback(async () => {
    const url = await api.getGmailAuthUrl();
    window.location.href = url;
  }, []);

  const handleGmailDisconnect = useCallback(async () => {
    await api.disconnectGmail();
    setGmailConnected(false);
    setScanResult(null);
  }, []);

  const handleScan = useCallback(async () => {
    setScanning(true);
    setScanResult(null);
    try {
      const result = await api.scanGmail();
      setScanResult(result);
    } finally {
      setScanning(false);
    }
  }, []);

  const copyEmail = useCallback(() => {
    navigator.clipboard.writeText("orders@cartfolio.app");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, []);

  /* ── Sub-components ── */
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
    title,
    description,
    badge,
    action,
  }: {
    title: string;
    description: string;
    badge?: { label: string; color: string };
    action?: React.ReactNode;
  }) => (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
      <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
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

  const PillBtn = ({
    label,
    color = "var(--accent)",
    onClick,
    disabled,
  }: {
    label: string;
    color?: string;
    onClick?: () => void;
    disabled?: boolean;
  }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: "6px 14px",
        borderRadius: 99,
        background: `${color}18`,
        color,
        border: `1px solid ${color}33`,
        fontSize: 12,
        fontWeight: 600,
        whiteSpace: "nowrap",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
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
          title="Email Forwarding"
          description="Forward order confirmation emails to orders@cartfolio.app"
          badge={{ label: "Active", color: "#10B981" }}
          action={
            <div style={{ textAlign: "right" }}>
              <div style={{ fontFamily: "monospace", fontSize: 12, color: "var(--accent)", marginBottom: 6 }}>
                orders@cartfolio.app
              </div>
              <PillBtn label={copied ? "Copied!" : "Copy address"} onClick={copyEmail} />
            </div>
          }
        />

        {/* Gmail OAuth — fully interactive */}
        <Row
          title="Gmail Connect"
          description={
            gmailConnected
              ? "Gmail connected — your order emails are being imported automatically."
              : "Sign in with Google to auto-import order confirmations from your inbox."
          }
          badge={
            gmailConnected
              ? { label: "Connected", color: "#10B981" }
              : { label: "Not connected", color: "#6B7280" }
          }
          action={
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              {gmailConnected && (
                <>
                  <PillBtn
                    label={scanning ? "Scanning…" : "Scan now"}
                    color="#6366f1"
                    onClick={handleScan}
                    disabled={scanning}
                  />
                  <PillBtn label="Disconnect" color="#EF4444" onClick={handleGmailDisconnect} />
                </>
              )}
              {!gmailConnected && (
                <PillBtn label="Connect Gmail" color="#4285F4" onClick={handleGmailConnect} />
              )}
            </div>
          }
        />
        {scanResult && (
          <div
            style={{
              marginLeft: 32,
              padding: "8px 14px",
              borderRadius: 8,
              background: "#10B98120",
              color: "#10B981",
              fontSize: 13,
              fontWeight: 500,
            }}
          >
            Imported {scanResult.imported} new order{scanResult.imported !== 1 ? "s" : ""} from Gmail.
          </div>
        )}

        <Row
          title="Android Notifications"
          description="Let Cartfolio read order notifications in real-time (Android only)"
          badge={{ label: "Coming soon", color: "#F59E0B" }}
          action={<PillBtn label="Enable" color="#F59E0B" disabled />}
        />
      </Section>

      <Section title="Supported Vendors">
        {[
          { name: "Amazon", status: "Parsing active", color: "#FF9900" },
          { name: "Flipkart", status: "Parsing active", color: "#2874F0" },
          { name: "Zomato", status: "Parsing active", color: "#E23744" },
          { name: "Blinkit", status: "Parsing active", color: "#0C831F" },
          { name: "Swiggy", status: "Coming soon", color: "#6B7280" },
        ].map((v) => (
          <Row
            key={v.name}
            title={v.name}
            description={v.status}
            badge={{ label: v.status === "Coming soon" ? "Soon" : "On", color: v.color }}
          />
        ))}
      </Section>

      <Section title="Privacy & Data">
        <Row
          title="Your data stays yours"
          description="Cartfolio never connects to retailer APIs or reads your inbox without permission."
        />
        <Row
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
                cursor: "pointer",
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
