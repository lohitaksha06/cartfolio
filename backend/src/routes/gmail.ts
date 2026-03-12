import { Router } from "express";
import type { Request, Response } from "express";
import {
  exchangeCodeForTokens,
  scanGmailForOrders,
} from "../services/gmail";
import { deduplicateOrder } from "../services/normalizer";
import { store } from "../db/store";

const router = Router();

// In-memory token store — replace with Supabase user row later
const tokenStore = new Map<string, { access_token: string; refresh_token?: string }>();

/**
 * GET /api/gmail/auth-url
 * Returns the Google OAuth consent URL for the frontend to redirect to.
 */
router.get("/auth-url", (_req: Request, res: Response) => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || "http://localhost:3000/api/gmail/callback";

  if (!clientId) {
    return res.status(500).json({ error: "GOOGLE_CLIENT_ID not set" });
  }

  const scopes = ["https://www.googleapis.com/auth/gmail.readonly"];
  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", scopes.join(" "));
  url.searchParams.set("access_type", "offline");
  url.searchParams.set("prompt", "consent");

  res.json({ url: url.toString() });
});

/**
 * GET /api/gmail/callback
 * Google redirects here with ?code=...
 * Exchange code for tokens, then redirect user back to app.
 */
router.get("/callback", async (req: Request, res: Response) => {
  const code = req.query.code as string;
  if (!code) return res.status(400).json({ error: "No code provided" });

  try {
    const tokens = await exchangeCodeForTokens(code);
    const userId = "usr_1"; // TODO: get from session/auth
    tokenStore.set(userId, {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
    });

    // Auto-scan on first connect
    const orders = await scanGmailForOrders(tokens.access_token, { maxResults: 30 });
    const existing = store.getOrders(userId);
    for (const order of orders) {
      const deduped = deduplicateOrder(order, existing);
      store.upsertOrder(deduped);
    }

    // Redirect to frontend with success
    const webUrl = process.env.WEB_URL || "http://localhost:5173";
    res.redirect(`${webUrl}/settings?gmail=connected&imported=${orders.length}`);
  } catch (err: any) {
    console.error("Gmail callback error:", err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/gmail/scan
 * Manually trigger a re-scan of the user's Gmail.
 * Body: { afterDate?: "2026-01-01" }
 */
router.post("/scan", async (req: Request, res: Response) => {
  const userId = "usr_1"; // TODO: real auth
  const tokens = tokenStore.get(userId);

  if (!tokens) {
    return res.status(401).json({ error: "Gmail not connected. Connect via /api/gmail/auth-url first." });
  }

  try {
    const orders = await scanGmailForOrders(tokens.access_token, {
      maxResults: req.body.maxResults || 50,
      afterDate: req.body.afterDate,
    });

    const existing = store.getOrders(userId);
    const saved = [];
    for (const order of orders) {
      const deduped = deduplicateOrder(order, existing);
      store.upsertOrder(deduped);
      saved.push(deduped);
    }

    res.json({ status: "ok", scanned: orders.length, imported: saved.length, data: saved });
  } catch (err: any) {
    console.error("Gmail scan error:", err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/gmail/status
 * Check if Gmail is connected for the current user.
 */
router.get("/status", (_req: Request, res: Response) => {
  const userId = "usr_1";
  const connected = tokenStore.has(userId);
  res.json({ connected });
});

/**
 * POST /api/gmail/disconnect
 * Remove Gmail tokens for the user.
 */
router.post("/disconnect", (_req: Request, res: Response) => {
  const userId = "usr_1";
  tokenStore.delete(userId);
  res.json({ status: "disconnected" });
});

export default router;
