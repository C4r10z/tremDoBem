import { Router } from "express";
import { requireAdmin } from "../middleware/auth";
import { createOrder, listOrders, updateOrderStatus, getPublicProducts } from "../db";
import { Order } from "../types";
import { clampTo100g, id, nowIso, round2 } from "../utils";
import { notifyWhatsappOrderUpdate } from "../services/whatsapp";

export const ordersRouter = Router();

/**
 * Cliente cria pedido
 */
ordersRouter.post("/", async (req, res) => {
  const { customer, items, notes } = req.body as {
    customer?: { name?: string; phone?: string; address?: string; reference?: string };
    items?: Array<{ productId: string; grams: number }>;
    notes?: string;
  };

  if (!customer?.name || !customer?.phone || !customer?.address) {
    return res.status(400).json({ error: "missing_customer_fields" });
  }

  if (!items?.length) return res.status(400).json({ error: "empty_cart" });

  const products = getPublicProducts();
  const byId = new Map(products.map(p => [p.id, p]));

  const normalized = items
    .map(i => {
      const p = byId.get(i.productId);
      if (!p) return null;

      const grams = clampTo100g(i.grams);
      const factor = grams / 100;
      const lineTotal = round2(p.pricePer100g * factor);

      return {
        productId: p.id,
        name: p.name,
        pricePer100g: p.pricePer100g,
        grams,
        lineTotal,
        image: p.image
      };
    })
    .filter(Boolean) as Order["items"];

  if (!normalized.length) return res.status(400).json({ error: "invalid_items" });

  const subtotal = round2(normalized.reduce((acc, it) => acc + it.lineTotal, 0));

  const order: Order = {
    id: id("o_"),
    createdAt: nowIso(),
    status: "PENDING",
    customer: {
      name: customer.name,
      phone: customer.phone,
      address: customer.address,
      reference: customer.reference
    },
    items: normalized,
    totals: { subtotal },
    notes
  };

  const saved = createOrder(order);

  // (Opcional) já manda confirmação ao criar
  // await notifyWhatsappOrderUpdate(saved);

  return res.json({ order: saved });
});

/**
 * Admin lista pedidos
 */
ordersRouter.get("/", requireAdmin, (_req, res) => {
  return res.json({ orders: listOrders() });
});

/**
 * Admin atualiza status (e notifica WhatsApp)
 */
ordersRouter.patch("/:id/status", requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body as { status?: Order["status"] };

  const allowed: Order["status"][] = ["PENDING", "IN_DELIVERY", "DELIVERED", "CANCELED"];
  if (!status || !allowed.includes(status)) {
    return res.status(400).json({ error: "invalid_status" });
  }

  const updated = updateOrderStatus(id, status);
  if (!updated) return res.status(404).json({ error: "not_found" });

  // ✅ envia WhatsApp pro cliente
  await notifyWhatsappOrderUpdate(updated);

  return res.json({ order: updated });
});
