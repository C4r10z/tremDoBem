type NotifyPayload = { to: string; text: string };

function normalizeToE164DigitsBR(raw: string) {
  const digits = (raw || "").replace(/\D/g, "");
  if (!digits) return "";
  return digits.startsWith("55") ? digits : `55${digits}`;
}

function brl(n: number) {
  return Number(n || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

/**
 * Envio genérico pro bot (endpoint /notify)
 * Usa WHATSAPP_WEBHOOK_URL e WHATSAPP_ENABLED
 */
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
      // ✅ evita a página de warning do ngrok free
      "ngrok-skip-browser-warning": "1",
    },
    body: JSON.stringify(payload),
  });

  const raw = await res.text().catch(() => "");

  if (!res.ok) {
    throw new Error(`WhatsApp notify failed: ${res.status} ${raw.slice(0, 300)}`);
  }

  // pode vir JSON, mas se vier vazio ok também
  try {
    return raw ? JSON.parse(raw) : { ok: true };
  } catch {
    // se vier HTML (warning), aqui vai acusar claramente
    throw new Error(`WhatsApp notify returned non-JSON response: ${raw.slice(0, 200)}`);
  }
}

/**
 * ✅ COMPAT com seu routes/order.ts
 * Ele está importando: notifyWhatsappOrderUpdate
 *
 * Como não sabemos exatamente a assinatura que você usa aí,
 * este helper aceita qualquer formato:
 *
 * - notifyWhatsappOrderUpdate(orderObject)
 * - notifyWhatsappOrderUpdate(phone, message)
 * - notifyWhatsappOrderUpdate(phone, orderId, status, subtotal, address?)
 * - notifyWhatsappOrderUpdate({ to, text })
 *
 * e converte em mensagem + chama notifyWhatsApp.
 */
export async function notifyWhatsappOrderUpdate(...args: any[]) {
  // 1) se veio (phone, text)
  if (args.length >= 2 && typeof args[0] === "string" && typeof args[1] === "string") {
    return notifyWhatsApp(args[0], args[1]);
  }

  // 2) se veio um objeto { to, text }
  if (args.length === 1 && args[0] && typeof args[0] === "object") {
    const obj = args[0];

    // { to, text }
    if (typeof obj.to === "string" && typeof obj.text === "string") {
      return notifyWhatsApp(obj.to, obj.text);
    }

    // order-like: { customer: { phone }, id, status, totals: { subtotal }, customer: { address, reference } }
    const phone =
      obj?.customer?.phone ||
      obj?.phone ||
      obj?.to ||
      "";

    const orderId = obj?.id || obj?.orderId || "";
    const status = obj?.status || obj?.newStatus || obj?.orderStatus || "";
    const subtotal = obj?.totals?.subtotal ?? obj?.subtotal ?? obj?.total ?? 0;
    const address = obj?.customer?.address || obj?.address || "";
    const reference = obj?.customer?.reference || obj?.reference || "";
    const notes = obj?.notes || "";

    const msg =
      `🛒 Trem do Bem\n` +
      `Atualização do pedido${orderId ? ` #${orderId}` : ""}.\n` +
      (status ? `Status: *${String(status)}*\n` : "") +
      (subtotal ? `Total: ${brl(subtotal)}\n` : "") +
      (address ? `Endereço: ${address}${reference ? `\nRef: ${reference}` : ""}\n` : "") +
      (notes ? `Obs: ${notes}\n` : "") +
      `\nObrigado!`;

    return notifyWhatsApp(String(phone), msg);
  }

  // 3) formatos variáveis: (phone, orderId, status, subtotal, address?)
  if (args.length >= 3 && typeof args[0] === "string") {
    const phone = args[0];
    const orderId = args[1] ?? "";
    const status = args[2] ?? "";
    const subtotal = args[3] ?? 0;
    const address = args[4] ?? "";

    const msg =
      `🛒 Trem do Bem\n` +
      `Pedido #${String(orderId)} atualizado.\n` +
      `Status: *${String(status)}*\n` +
      `Total: ${brl(subtotal)}\n` +
      (address ? `Endereço: ${String(address)}\n` : "") +
      `\nObrigado!`;

    return notifyWhatsApp(phone, msg);
  }

  // se cair aqui, não tem dados suficientes
  return { ok: false, skipped: true, reason: "invalid_args" };
}
