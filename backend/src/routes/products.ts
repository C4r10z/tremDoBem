import { Router } from "express";
import { requireAdmin } from "../middleware/auth";
import { getPublicProducts, getAllProducts, upsertProduct, setProductActive } from "../db";
import { Product } from "../types";

export const productsRouter = Router();

// público
productsRouter.get("/public", (_req, res) => {
  return res.json({ products: getPublicProducts() });
});

// admin
productsRouter.get("/", requireAdmin, (_req, res) => {
  return res.json({ products: getAllProducts() });
});

productsRouter.post("/", requireAdmin, (req, res) => {
  const p = req.body as Product;

  if (!p?.id || !p?.name || typeof p?.pricePer100g !== "number" || !p?.image) {
    return res.status(400).json({ error: "invalid_payload" });
  }

  p.active = !!p.active;
  const saved = upsertProduct(p);
  return res.json({ product: saved });
});

productsRouter.patch("/:id/active", requireAdmin, (req, res) => {
  const { id } = req.params;
  const { active } = req.body as { active?: boolean };
  const updated = setProductActive(id, !!active);
  if (!updated) return res.status(404).json({ error: "not_found" });
  return res.json({ product: updated });
});
