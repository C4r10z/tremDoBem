type NotifyPayload = { to: string; text: string };

function normalizeToE164DigitsBR(raw: string) {
  const digits = (raw || "").replace(/\D/g, "");
  if (!digits) return "";
  return digits.startsWith("55") ? digits : `55${digits}`;
}

function brl(n: number) {
  return Number(n || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export async function notifyWhatsApp(toPhone: string, text: string) {
  const enabled = String(process.env.WHATSAPP_ENABLED || "").toLowerCase() === "true";
  const url = process.env.WHATSAPP_WEBHOOK_URL || "";

  if (!enabled) return { ok: false, skipped: true, reason: "WHATSAPP_ENABLED=false" };
  if (!url) return { ok: false, skipped: true, reason: "WHATSAPP_WEBHOOK_URL not set" };

  const phone = normalizeToE164DigitsBR(toPhone);
  if (!phone) return { ok: false, skipped: true, reason: "invalid_phone" };

  const payload: NotifyPayload = { to: phone, text };

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "ngrok-skip-browser-warning": "1"
    },
    body: JSON.stringify(payload)
  });

  const raw = await res.text().catch(() => "");

  if (!res.ok) throw new Error(`WhatsApp notify failed: ${res.status} ${raw.slice(0, 300)}`);

  try {
    return raw ? JSON.parse(raw) : { ok: true };
  } catch {
    throw new Error(`WhatsApp notify returned non-JSON response: ${raw.slice(0, 200)}`);
  }
}

/** Export compatível com seu código antigo (se existir) */
export async function notifyWhatsappOrderUpdate(order: any) {
  const phone = order?.customer?.phone || order?.phone || "";
  const status = order?.status || "";
  const orderId = order?.id || "";
  const subtotal = order?.totals?.subtotal ?? 0;
  const address = order?.customer?.address || "";
  const reference = order?.customer?.reference || "";

  const msg =
    `🛒 Trem do Bem\n` +
    `Seu pedido #${orderId} foi atualizado.\n` +
    `Status: *${status}*\n` +
    `Total: ${brl(subtotal)}\n\n` +
    `Endereço: ${address}` +
    (reference ? `\nRef: ${reference}` : "") +
    `\n\nObrigado!`;

  return notifyWhatsApp(phone, msg);
}
