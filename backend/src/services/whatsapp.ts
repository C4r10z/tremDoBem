type NotifyPayload = { to: string; text: string };

function normalizeToE164DigitsBR(raw: string) {
  const digits = (raw || "").replace(/\D/g, "");
  if (!digits) return "";
  return digits.startsWith("55") ? digits : `55${digits}`;
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
      // ✅ evita a página de aviso do ngrok (free)
      "ngrok-skip-browser-warning": "1"
    },
    body: JSON.stringify(payload),
  });

  // se ngrok devolver HTML do warning, isso vai capturar no body
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`WhatsApp notify failed: ${res.status} ${body.slice(0, 300)}`);
  }

  // tenta parsear JSON; se vier HTML, falha com mensagem clara
  const txt = await res.text().catch(() => "");
  try {
    return txt ? JSON.parse(txt) : { ok: true };
  } catch {
    // ngrok warning costuma retornar HTML
    throw new Error(`WhatsApp notify returned non-JSON response: ${txt.slice(0, 200)}`);
  }
}
