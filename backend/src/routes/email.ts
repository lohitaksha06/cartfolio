import { Router } from "express";
import type { Request, Response } from "express";
import { parseEmail } from "../parsers/index.js";
import { deduplicateOrder } from "../services/normalizer.js";
import { store } from "../db/store.js";

const router = Router();

/**
 * POST /api/email/ingest
 *
 * Receives a webhook from AWS SES / Postmark / SendGrid Inbound.
 * Expected body shape (normalized before sending, or adapt parsers to raw formats):
 * {
 *   from: "ship-confirm@amazon.in",
 *   subject: "Your Amazon.in order has been shipped",
 *   text: "... full email plain text ...",
 *   html: "... full email html ...",
 *   to: "orders@cartfolio.app"
 * }
 */
router.post("/ingest", (req: Request, res: Response) => {
  const { from, subject, text, html } = req.body;

  if (!from || !subject) {
    return res.status(400).json({ error: "from and subject are required" });
  }

  // Parse email into a structured order (or null if unrecognised)
  const parsed = parseEmail({ from, subject, text: text || "", html: html || "" });

  if (!parsed) {
    return res.status(200).json({ status: "unrecognised", message: "Email vendor not supported yet" });
  }

  // Deduplicate: if same order ID already exists, update; else insert
  const existing = store.getOrders(parsed.user_id);
  const order = deduplicateOrder(parsed, existing);
  store.upsertOrder(order);

  res.status(200).json({ status: "ok", data: order });
});

export default router;
