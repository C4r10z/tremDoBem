import "dotenv/config";
import express from "express";
import cors from "cors";

import { authRouter } from "./routes/auth";
import { productsRouter } from "./routes/products";
import { ordersRouter } from "./routes/order";

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use("/auth", authRouter);
app.use("/products", productsRouter);
app.use("/orders", ordersRouter);

const PORT = Number(process.env.PORT || 3334);
app.listen(PORT, () => console.log(`[api] running on http://localhost:${PORT}`));
