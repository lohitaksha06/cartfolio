/**
 * Gmail Integration Service
 *
 * Flow:
 * 1. User clicks "Connect Gmail" → frontend redirects to Google OAuth
 * 2. Google calls back with auth code → backend exchanges for tokens
 * 3. Backend uses tokens to scan Gmail for order emails
 * 4. Parsed orders are stored and surfaced in the app
 *
 * This module handles steps 3+4 — the actual Gmail reading + parsing.
 * For now it also includes helpers for OAuth token exchange.
 *
 * Required Google OAuth scopes:
 *   https://www.googleapis.com/auth/gmail.readonly
 *
 * Environment variables (set these in .env):
 *   GOOGLE_CLIENT_ID
 *   GOOGLE_CLIENT_SECRET
 *   GOOGLE_REDIRECT_URI   (e.g. http://localhost:3000/api/gmail/callback)
 */

import type { Order } from "../../../../shared/types/index.js";
import { parseEmail } from "../parsers/index.js";
import type { RawEmail } from "../parsers/types.js";

// ─── Types ───────────────────────────────────────────────

export interface GmailTokens {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
}

export interface GmailMessage {
  id: string;
  threadId: string;
  snippet: string;
  payload: {
    headers: { name: string; value: string }[];
    parts?: { mimeType: string; body: { data?: string } }[];
    body?: { data?: string };
    mimeType?: string;
  };
}

// ─── Token Exchange ──────────────────────────────────────

export async function exchangeCodeForTokens(code: string): Promise<GmailTokens> {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID || "",
      client_secret: process.env.GOOGLE_CLIENT_SECRET || "",
      redirect_uri: process.env.GOOGLE_REDIRECT_URI || "http://localhost:3000/api/gmail/callback",
      grant_type: "authorization_code",
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Token exchange failed: ${err}`);
  }
  return res.json();
}

export async function refreshAccessToken(refreshToken: string): Promise<GmailTokens> {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: process.env.GOOGLE_CLIENT_ID || "",
      client_secret: process.env.GOOGLE_CLIENT_SECRET || "",
      grant_type: "refresh_token",
    }),
  });
  if (!res.ok) throw new Error("Failed to refresh token");
  return res.json();
}

// ─── Gmail API helpers ───────────────────────────────────

const GMAIL_API = "https://www.googleapis.com/gmail/v1/users/me";

/** Search Gmail for order-related emails from supported vendors */
export async function fetchOrderEmails(
  accessToken: string,
  options: { maxResults?: number; afterDate?: string } = {}
): Promise<GmailMessage[]> {
  const { maxResults = 50, afterDate } = options;

  // Build search query for vendor emails
  const vendors = [
    "from:amazon.in OR from:amazon.com",
    "from:flipkart.com",
    "from:zomato.com",
    "from:blinkit.in OR from:grofers.com",
    "from:swiggy.in",
  ];
  let q = `(${vendors.join(" OR ")}) subject:(order OR delivered OR shipped OR confirmed OR placed)`;
  if (afterDate) q += ` after:${afterDate}`;

  // Step 1: Get message IDs
  const listRes = await fetch(
    `${GMAIL_API}/messages?q=${encodeURIComponent(q)}&maxResults=${maxResults}`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  if (!listRes.ok) throw new Error(`Gmail list failed: ${listRes.status}`);
  const listData = await listRes.json();

  if (!listData.messages || listData.messages.length === 0) return [];

  // Step 2: Fetch full message for each
  const messages: GmailMessage[] = await Promise.all(
    listData.messages.map(async (m: { id: string }) => {
      const msgRes = await fetch(`${GMAIL_API}/messages/${m.id}?format=full`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      return msgRes.json();
    })
  );

  return messages;
}

// ─── Parse Gmail message → RawEmail ──────────────────────

function getHeader(msg: GmailMessage, name: string): string {
  const h = msg.payload.headers.find((h) => h.name.toLowerCase() === name.toLowerCase());
  return h?.value || "";
}

function decodeBase64Url(data: string): string {
  // Gmail encodes body as base64url
  const base64 = data.replace(/-/g, "+").replace(/_/g, "/");
  return Buffer.from(base64, "base64").toString("utf-8");
}

function extractBody(msg: GmailMessage): { text: string; html: string } {
  let text = "";
  let html = "";

  if (msg.payload.parts) {
    for (const part of msg.payload.parts) {
      if (part.mimeType === "text/plain" && part.body?.data) {
        text = decodeBase64Url(part.body.data);
      }
      if (part.mimeType === "text/html" && part.body?.data) {
        html = decodeBase64Url(part.body.data);
      }
    }
  } else if (msg.payload.body?.data) {
    // Single-part message
    const decoded = decodeBase64Url(msg.payload.body.data);
    if (msg.payload.mimeType === "text/html") html = decoded;
    else text = decoded;
  }

  return { text, html };
}

export function gmailMessageToRawEmail(msg: GmailMessage): RawEmail {
  const { text, html } = extractBody(msg);
  return {
    from: getHeader(msg, "From"),
    subject: getHeader(msg, "Subject"),
    text,
    html,
  };
}

// ─── Main: Scan Gmail → parsed orders ────────────────────

export async function scanGmailForOrders(
  accessToken: string,
  options: { maxResults?: number; afterDate?: string } = {}
): Promise<Order[]> {
  const messages = await fetchOrderEmails(accessToken, options);
  const orders: Order[] = [];

  for (const msg of messages) {
    const raw = gmailMessageToRawEmail(msg);
    const parsed = parseEmail(raw);
    if (parsed) {
      orders.push(parsed);
    }
  }

  return orders;
}
