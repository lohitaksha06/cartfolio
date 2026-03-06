import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { api } from "../services/api";

const ACCENT = "#6366f1";
const GREEN = "#10B981";
const RED = "#EF4444";
const YELLOW = "#F59E0B";
const GRAY = "#6B7280";

export default function SettingsScreen() {
  const [gmailConnected, setGmailConnected] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<number | null>(null);

  useEffect(() => {
    api.getGmailStatus().then((s) => setGmailConnected(s.connected));
  }, []);

  const handleGmailConnect = async () => {
    // In real impl: open auth URL with Linking or expo-auth-session
    Alert.alert(
      "Gmail Connect",
      "This will open Google sign-in. (Mock — marking as connected)",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Connect",
          onPress: () => setGmailConnected(true),
        },
      ]
    );
  };

  const handleGmailDisconnect = async () => {
    Alert.alert("Disconnect Gmail?", "You can reconnect any time.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Disconnect",
        style: "destructive",
        onPress: () => {
          setGmailConnected(false);
          setScanResult(null);
        },
      },
    ]);
  };

  const handleScan = async () => {
    setScanning(true);
    setScanResult(null);
    try {
      const res = await api.scanGmail();
      setScanResult(res.imported);
    } finally {
      setScanning(false);
    }
  };

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>
      <Text style={s.heading}>Settings</Text>
      <Text style={s.sub}>Manage how Cartfolio collects your order data.</Text>

      {/* ── Data Sources ── */}
      <SectionHeader title="DATA SOURCES" />

      <Card>
        <Row
          emoji="✉️"
          title="Email Forwarding"
          subtitle="Forward order emails to orders@cartfolio.app"
          badge="Active"
          badgeColor={GREEN}
        />
        <Divider />
        <Row
          emoji="📧"
          title="Gmail Connect"
          subtitle={
            gmailConnected
              ? "Connected — order emails auto-imported."
              : "Sign in with Google to auto-import orders."
          }
          badge={gmailConnected ? "Connected" : "Not connected"}
          badgeColor={gmailConnected ? GREEN : GRAY}
          action={
            <View style={{ flexDirection: "row", gap: 8 }}>
              {gmailConnected ? (
                <>
                  <Pill
                    label={scanning ? "Scanning…" : "Scan now"}
                    color={ACCENT}
                    onPress={handleScan}
                    disabled={scanning}
                  />
                  <Pill label="Disconnect" color={RED} onPress={handleGmailDisconnect} />
                </>
              ) : (
                <Pill label="Connect Gmail" color="#4285F4" onPress={handleGmailConnect} />
              )}
            </View>
          }
        />
        {scanResult !== null && (
          <View style={s.scanBanner}>
            <Text style={s.scanText}>
              Imported {scanResult} new order{scanResult !== 1 ? "s" : ""} from Gmail.
            </Text>
          </View>
        )}
        <Divider />
        <Row
          emoji="🔔"
          title="Android Notifications"
          subtitle="Read order notifications in real-time"
          badge="Coming soon"
          badgeColor={YELLOW}
        />
      </Card>

      {/* ── Supported Vendors ── */}
      <SectionHeader title="SUPPORTED VENDORS" />
      <Card>
        {[
          { name: "Amazon", emoji: "📦", active: true, color: "#FF9900" },
          { name: "Flipkart", emoji: "🛍️", active: true, color: "#2874F0" },
          { name: "Zomato", emoji: "🍽️", active: true, color: "#E23744" },
          { name: "Blinkit", emoji: "⚡", active: true, color: "#0C831F" },
          { name: "Swiggy", emoji: "🧡", active: false, color: GRAY },
        ].map((v, i, arr) => (
          <React.Fragment key={v.name}>
            <Row
              emoji={v.emoji}
              title={v.name}
              subtitle={v.active ? "Parsing active" : "Coming soon"}
              badge={v.active ? "On" : "Soon"}
              badgeColor={v.color}
            />
            {i < arr.length - 1 && <Divider />}
          </React.Fragment>
        ))}
      </Card>

      {/* ── Privacy ── */}
      <SectionHeader title="PRIVACY & DATA" />
      <Card>
        <Row
          emoji="🔒"
          title="Your data stays yours"
          subtitle="Cartfolio never reads your inbox without explicit permission."
        />
        <Divider />
        <Row
          emoji="🗑️"
          title="Delete all data"
          subtitle="Permanently remove all orders and account data."
          action={
            <Pill
              label="Delete"
              color={RED}
              onPress={() =>
                Alert.alert("Delete all data?", "This cannot be undone.", [
                  { text: "Cancel", style: "cancel" },
                  { text: "Delete", style: "destructive" },
                ])
              }
            />
          }
        />
      </Card>
    </ScrollView>
  );
}

/* ── Sub-components ── */

function SectionHeader({ title }: { title: string }) {
  return <Text style={s.sectionTitle}>{title}</Text>;
}

function Card({ children }: { children: React.ReactNode }) {
  return <View style={s.card}>{children}</View>;
}

function Divider() {
  return <View style={s.divider} />;
}

function Row({
  emoji,
  title,
  subtitle,
  badge,
  badgeColor,
  action,
}: {
  emoji: string;
  title: string;
  subtitle: string;
  badge?: string;
  badgeColor?: string;
  action?: React.ReactNode;
}) {
  return (
    <View style={s.row}>
      <View style={{ flex: 1 }}>
        <View style={s.rowTitleRow}>
          <Text style={{ fontSize: 17 }}>{emoji}</Text>
          <Text style={s.rowTitle}>{title}</Text>
          {badge && badgeColor && (
            <View style={[s.badge, { backgroundColor: badgeColor + "22" }]}>
              <Text style={[s.badgeText, { color: badgeColor }]}>{badge}</Text>
            </View>
          )}
        </View>
        <Text style={s.rowSub}>{subtitle}</Text>
      </View>
      {action && <View style={{ marginTop: 4 }}>{action}</View>}
    </View>
  );
}

function Pill({
  label,
  color,
  onPress,
  disabled,
}: {
  label: string;
  color: string;
  onPress?: () => void;
  disabled?: boolean;
}) {
  return (
    <TouchableOpacity
      style={[s.pill, { backgroundColor: color + "18", borderColor: color + "33", opacity: disabled ? 0.5 : 1 }]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <Text style={[s.pillText, { color }]}>{label}</Text>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f0f11" },
  content: { padding: 20, paddingBottom: 60 },
  heading: { fontSize: 22, fontWeight: "700", color: "#fafafa", marginBottom: 4 },
  sub: { fontSize: 14, color: "#71717a", marginBottom: 24 },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#52525b",
    letterSpacing: 0.8,
    marginBottom: 10,
    marginTop: 20,
  },
  card: {
    backgroundColor: "#18181b",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#27272a",
    padding: 14,
    marginBottom: 6,
  },
  divider: { height: 1, backgroundColor: "#27272a", marginVertical: 10 },
  row: {
    flexDirection: "column",
    paddingVertical: 4,
  },
  rowTitleRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 3 },
  rowTitle: { fontSize: 15, fontWeight: "600", color: "#fafafa" },
  rowSub: { fontSize: 12, color: "#71717a", marginLeft: 25 },
  badge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 99 },
  badgeText: { fontSize: 10, fontWeight: "700", textTransform: "uppercase" },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 99,
    borderWidth: 1,
    marginLeft: 25,
    marginTop: 6,
    alignSelf: "flex-start",
  },
  pillText: { fontSize: 12, fontWeight: "600" },
  scanBanner: {
    marginLeft: 25,
    marginTop: 6,
    backgroundColor: "#10B98120",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  scanText: { color: "#10B981", fontSize: 13, fontWeight: "500" },
});
