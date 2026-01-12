import "dotenv/config";
import express from "express";
import cors from "cors";
import qrcode from "qrcode-terminal";

// Import correto para ESM
import pkg from "whatsapp-web.js";
const { Client, LocalAuth } = pkg as any;

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

const PORT = Number(process.env.PORT || 3340);

/**
 * Retorna somente dígitos, com DDI 55.
 * Aceita: "+55...", "55...", "(32) 9...."
 * Retorna: "5532991137334"
 */
function normalizeToE164DigitsBR(raw: string) {
  const digits = (raw || "").replace(/\D/g, "");
  if (!digits) return "";
  return digits.startsWith("55") ? digits : `55${digits}`;
}

const client = new Client({
  authStrategy: new LocalAuth({ clientId: "trem-do-bem" })
});

let isReady = false;

client.on("qr", (qr: string) => {
  console.log("[whatsapp] QR recebido. Escaneie com o WhatsApp:");
  qrcode.generate(qr, { small: true });
});

client.on("ready", () => {
  isReady = true;
  console.log("[whatsapp] Cliente pronto ✅");
});

client.on("auth_failure", (msg: string) => {
  isReady = false;
  console.log("[whatsapp] Falha de auth:", msg);
});

client.on("disconnected", (reason: string) => {
  isReady = false;
  console.log("[whatsapp] Desconectado:", reason);
});

client.initialize();

app.get("/health", (_req, res) => {
  res.json({ ok: true, whatsappReady: isReady });
});

/**
 * Endpoint chamado pelo backend
 * body: { to: "+5532...", text: "..." }
 */
app.post("/notify", async (req, res) => {
  try {
    const { to, text } = req.body as { to?: string; text?: string };

    if (!to || !text) return res.status(400).json({ error: "missing_to_or_text" });
    if (!isReady) return res.status(503).json({ error: "whatsapp_not_ready" });

    const number = normalizeToE164DigitsBR(to);
    if (!number) return res.status(400).json({ error: "invalid_to" });

    console.log("[notify] resolving number:", number);

    const numberId = await client.getNumberId(number);
    if (!numberId?._serialized) {
      console.log("[notify] number NOT registered on WhatsApp:", number);
      return res.status(404).json({ error: "number_not_on_whatsapp" });
    }

    console.log("[notify] sending to:", numberId._serialized);
    await client.sendMessage(numberId._serialized, text);

    return res.json({ ok: true });
  } catch (e: any) {
    console.error("[notify] erro:", e?.message || e);
    return res.status(500).json({ error: "send_failed", message: e?.message || String(e) });
  }
});

app.listen(PORT, () => {
  console.log(`[bot] rodando em http://localhost:${PORT}`);
});
