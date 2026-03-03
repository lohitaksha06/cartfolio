import express from "express";
import cors from "cors";
import ordersRouter from "./routes/orders.js";
import emailRouter from "./routes/email.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: "5mb" }));

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "cartfolio-backend", time: new Date().toISOString() });
});

// Routes
app.use("/api/orders", ordersRouter);
app.use("/api/email", emailRouter);

// 404
app.use((_req, res) => {
  res.status(404).json({ error: "Not found" });
});

app.listen(PORT, () => {
  console.log(`🛒 Cartfolio backend running on http://localhost:${PORT}`);
});

export default app;
