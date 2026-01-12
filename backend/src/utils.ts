export function nowIso() {
  return new Date().toISOString();
}

export function id(prefix = "") {
  const rand = Math.random().toString(16).slice(2);
  const t = Date.now().toString(16);
  return `${prefix}${t}${rand}`.slice(0, 18);
}

export function clampTo100g(grams: number) {
  if (!Number.isFinite(grams)) return 100;
  return Math.max(100, Math.round(grams / 100) * 100);
}

export function round2(n: number) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}
