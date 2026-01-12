import type { Order } from "../types";

type OrderStatus = Order["status"];

function statusLabel(s: OrderStatus) {
  if (s === "PENDING") return "Pendente";
  if (s === "IN_DELIVERY") return "Em entrega";
  if (s === "DELIVERED") return "Entregue";
  return "Cancelado";
}

function normalizePhoneBR(raw: string) {
  const digits = (raw || "").replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("55")) return `+${digits}`;
  if (digits.length >= 10 && digits.length <= 11) return `+55${digits}`;
  return `+55${digits}`;
}

function buildMessage(order: Order) {
  const items = order.items
    .map(it => `• ${it.name} — ${it.grams}g (R$ ${it.lineTotal.toFixed(2).replace(".", ",")})`)
    .join("\n");

  const total = `R$ ${order.totals.subtotal.toFixed(2).replace(".", ",")}`;

  return [
    `🛒 *Trem do Bem*`,
    `Pedido: *${order.id}*`,
    `Status: *${statusLabel(order.status)}*`,
    ``,
    `📦 *Itens:*`,
    items || "—",
    ``,
    `💰 *Subtotal:* ${total}`,
    ``,
    `📍 *Entrega:* ${order.customer.address}`,
    order.customer.reference ? `🧭 *Ref:* ${order.customer.reference}` : null
  ].filter(Boolean).join("\n");
}

export async function notifyWhatsappOrderUpdate(order: Order) {
  const enabled = (process.env.WHATSAPP_ENABLED || "false").toLowerCase() === "true";
  const url = process.env.WHATSAPP_WEBHOOK_URL || "";

  const to = normalizePhoneBR(order.customer.phone);
  const text = buildMessage(order);

  console.log("[whatsapp] enabled:", enabled, "url:", url, "to:", to);

  if (!enabled || !url) {
    console.log("[whatsapp] skipped (disabled or missing url)");
    return;
  }
  if (!to) {
    console.log("[whatsapp] skipped (invalid phone)");
    return;
  }

  try {
    const resp = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to, text, orderId: order.id, status: order.status })
    });

    const body = await resp.text().catch(() => "");
    console.log("[whatsapp] webhook status:", resp.status, body);

  } catch (e: any) {
    console.warn("[whatsapp] notify failed:", e?.message || e);
  }
}
