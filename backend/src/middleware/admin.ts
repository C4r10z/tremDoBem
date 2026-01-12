import crypto from "crypto";

type AdminTokenPayload = {
  user: string;
  iat: number; // timestamp em ms
};

function b64urlEncode(input: Buffer | string) {
  const buf = Buffer.isBuffer(input) ? input : Buffer.from(input);
  return buf
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function b64urlDecode(input: string) {
  const pad = input.length % 4 === 0 ? "" : "=".repeat(4 - (input.length % 4));
  const b64 = input.replace(/-/g, "+").replace(/_/g, "/") + pad;
  return Buffer.from(b64, "base64").toString("utf8");
}

function sign(data: string, secret: string) {
  return b64urlEncode(crypto.createHmac("sha256", secret).update(data).digest());
}

export function createAdminToken(user: string) {
  const secret = process.env.ADMIN_TOKEN_SECRET || "dev_secret_change_me";
  const payload: AdminTokenPayload = { user, iat: Date.now() };
  const payloadB64 = b64urlEncode(JSON.stringify(payload));
  const sig = sign(payloadB64, secret);
  return `${payloadB64}.${sig}`;
}

export function verifyAdminToken(token: string) {
  const secret = process.env.ADMIN_TOKEN_SECRET || "dev_secret_change_me";
  const parts = token.split(".");
  if (parts.length !== 2) return null;

  const [payloadB64, sig] = parts;
  const expected = sign(payloadB64, secret);
  if (sig !== expected) return null;

  try {
    const payload = JSON.parse(b64urlDecode(payloadB64)) as AdminTokenPayload;

    // expiração (padrão 7 dias)
    const maxAgeMs = Number(
      process.env.ADMIN_TOKEN_MAXAGE_MS || 7 * 24 * 60 * 60 * 1000
    );
    if (Date.now() - payload.iat > maxAgeMs) return null;

    return payload;
  } catch {
    return null;
  }
}

export function requireAdmin(req: any, res: any, next: any) {
  const hdr = String(req.headers.authorization || "");
  const token = hdr.startsWith("Bearer ") ? hdr.slice(7) : "";
  const payload = token ? verifyAdminToken(token) : null;

  if (!payload) return res.status(401).json({ error: "unauthorized" });
  req.admin = payload;
  return next();
}
