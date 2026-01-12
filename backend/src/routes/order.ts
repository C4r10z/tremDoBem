import { Router } from "express";
import { requireAdmin } from "../middleware/admin";
import { store } from "../store/store";
import { notifyWhatsappOrderUpdate } from "../services/whatsapp";

export type OrderStatus = "PENDING" | "IN_DELIVERY" | "DELIVERED" | "CANCELED";

type OrderItem = {
  productId: string;
  name: string;
  pricePer100g: number;
  grams: number;
  lineTotal: number;
  image: string;
};

type Order = {
  id: string;
  createdAt: string;
  status: OrderStatus;
  customer: {
    name: string;
    phone: string;
    address: string;
    reference?: string;
  };
  items: OrderItem[];
  totals: { subtotal: number };
  notes?: string;
};

function clamp100g(grams: number) {
  const g = Math.round((Number(grams) || 0) / 100) * 100;
  return Math.max(100, g);
}

export const orderRouter = Router();

/** PUBLIC: criar pedido */
orderRouter.post("/", (req, res) => {
  const body = req.body as {
    customer: { name: string; phone: string; address: string; reference?: string };
    items: Array<{ productId: string; grams: number }>;
    notes?: string;
  };

  if (!body?.customer?.name || !body?.customer?.phone || !body?.customer?.address) {
    return res.status(400).json({ error: "missing_customer_fields" });
  }
  if (!Array.isArray(body.items) || body.items.length === 0) {
    return res.status(400).json({ error: "missing_items" });
  }

  const items: OrderItem[] = [];
  for (const it of body.items) {
    const p = store.products.find((x: any) => x.id === it.productId);
    if (!p) return res.status(400).json({ error: "invalid_product", productId: it.productId });

    const grams = clamp100g(it.grams);
    const lineTotal =
      Math.round((p.pricePer100g * (grams / 100) + Number.EPSILON) * 100) / 100;

    items.push({
      productId: p.id,
      name: p.name,
      pricePer100g: p.pricePer100g,
      grams,
      lineTotal,
      image: p.image,
    });
  }

  const subtotal =
    Math.round((items.reduce((a, i) => a + i.lineTotal, 0) + Number.EPSILON) * 100) / 100;

  const order: Order = {
    id: `o_${Date.now().toString(16)}`,
    createdAt: new Date().toISOString(),
    status: "PENDING",
    customer: {
      name: body.customer.name.trim(),
      phone: body.customer.phone.trim(),
      address: body.customer.address.trim(),
      reference: body.customer.reference?.trim() || undefined,
    },
    items,
    totals: { subtotal },
    notes: body.notes?.trim() || undefined,
  };

  store.orders.unshift(order);
  return res.json({ order });
});

/** ADMIN: listar pedidos */
orderRouter.get("/", requireAdmin, (_req, res) => {
  return res.json({ orders: store.orders });
});

/** ADMIN: atualizar status + notificar WhatsApp */
orderRouter.patch("/:id/status", requireAdmin, async (req, res) => {
  const { id } = req.params as { id: string };
  const { status } = req.body as { status?: OrderStatus };

  if (!status || !["PENDING", "IN_DELIVERY", "DELIVERED", "CANCELED"].includes(status)) {
    return res.status(400).json({ error: "invalid_status" });
  }

  const order = store.orders.find((o: any) => o.id === id);
  if (!order) return res.status(404).json({ error: "order_not_found" });

  order.status = status;

  try {
    await notifyWhatsappOrderUpdate(order);
  } catch (e: any) {
    console.log("[whatsapp] notify failed:", e?.message || e);
  }

  return res.json({ order });
});
