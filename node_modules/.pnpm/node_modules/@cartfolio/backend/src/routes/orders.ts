import { Router } from "express";
import type { Request, Response } from "express";
import { store } from "../db/store.js";
import type { Order, Vendor, OrderStatus } from "../../../shared/types/index.js";
import { CATEGORY_FOR_VENDOR } from "../../../shared/types/index.js";

const router = Router();

// GET /api/orders — list orders for a user
router.get("/", (req: Request, res: Response) => {
  const userId = (req.query.userId as string) || "usr_1"; // TODO: real auth
  const vendor = req.query.vendor as Vendor | undefined;
  const status = req.query.status as OrderStatus | undefined;

  let orders = store.getOrders(userId);
  if (vendor) orders = orders.filter((o) => o.vendor === vendor);
  if (status) orders = orders.filter((o) => o.status === status);

  res.json({ data: orders, count: orders.length });
});

// GET /api/orders/:id — single order
router.get("/:id", (req: Request, res: Response) => {
  const order = store.getOrderById(req.params.id);
  if (!order) return res.status(404).json({ error: "Order not found" });
  res.json({ data: order });
});

// POST /api/orders — manual add
router.post("/", (req: Request, res: Response) => {
  const body = req.body;
  if (!body.vendor || !body.items || !body.total_amount) {
    return res.status(400).json({ error: "vendor, items, and total_amount are required" });
  }

  const now = new Date().toISOString();
  const order: Order = {
    id: `ord_${Date.now()}`,
    user_id: body.user_id || "usr_1",
    vendor: body.vendor,
    category: CATEGORY_FOR_VENDOR[body.vendor as Vendor],
    source: "MANUAL",
    order_date: body.order_date || now,
    status: body.status || "PLACED",
    total_amount: body.total_amount,
    currency: body.currency || "INR",
    items: body.items,
    tracking: body.tracking,
    created_at: now,
    updated_at: now,
  };

  store.upsertOrder(order);
  res.status(201).json({ data: order });
});

// PATCH /api/orders/:id — update status
router.patch("/:id", (req: Request, res: Response) => {
  const existing = store.getOrderById(req.params.id);
  if (!existing) return res.status(404).json({ error: "Order not found" });

  const updated: Order = {
    ...existing,
    ...req.body,
    id: existing.id,
    updated_at: new Date().toISOString(),
  };
  store.upsertOrder(updated);
  res.json({ data: updated });
});

// DELETE /api/orders/:id
router.delete("/:id", (req: Request, res: Response) => {
  const ok = store.deleteOrder(req.params.id);
  if (!ok) return res.status(404).json({ error: "Order not found" });
  res.json({ success: true });
});

export default router;
