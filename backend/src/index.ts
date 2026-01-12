import "dotenv/config";
import express from "express";
import cors from "cors";

import { authRouter } from "./routes/auth";
import { productsRouter } from "./routes/products";
import { orderRouter } from "./routes/order";

const app = express();

const allowed = (process.env.CORS_ORIGIN || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: allowed.length ? allowed : true,
    credentials: true,
  })
);

app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/auth", authRouter);
app.use("/products", productsRouter);
app.use("/orders", orderRouter);

const PORT = Number(process.env.PORT || 3334);
app.listen(PORT, "0.0.0.0", () => {
  console.log(`[api] running on :${PORT}`);
});
