/* ===========================================================
   TGK: session-cache.js (safe baseline)
   - sessionStorage based (dies on tab close)
   - TTL per key
   - Never throws, never blocks, never touches Firebase
   =========================================================== */

const PREFIX = "tgk:";
const DEFAULT_TTL_MS = 5 * 60 * 1000; // 5 minutes

function now() {
  return Date.now();
}

function safeParse(json) {
  try {
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function safeStringify(value) {
  try {
    return JSON.stringify(value);
  } catch {
    return null;
  }
}

function makeKey(key) {
  const k = String(key || "").trim();
  if (!k) return null;
  return k.startsWith(PREFIX) ? k : `${PREFIX}${k}`;
}

export function getCached(key) {
  const storageKey = makeKey(key);
  if (!storageKey) return null;

  try {
    const raw = sessionStorage.getItem(storageKey);
    if (!raw) return null;

    const obj = safeParse(raw);
    if (!obj || typeof obj !== "object") return null;

    const { v, e } = obj;
    if (typeof e === "number" && e > 0 && now() > e) {
      sessionStorage.removeItem(storageKey);
      return null;
    }
    return v ?? null;
  } catch {
    return null;
  }
}

export function setCached(key, value, ttlMs = DEFAULT_TTL_MS) {
  const storageKey = makeKey(key);
  if (!storageKey) return false;

  try {
    const expiresAt =
      typeof ttlMs === "number" && ttlMs > 0 ? now() + ttlMs : 0;

    const payload = safeStringify({ v: value, e: expiresAt });
    if (!payload) return false;

    sessionStorage.setItem(storageKey, payload);
    return true;
  } catch {
    return false;
  }
}

export function clearCache(prefix = "") {
  try {
    const p = `${PREFIX}${String(prefix || "")}`;
    const keysToRemove = [];

    for (let i = 0; i < sessionStorage.length; i++) {
      const k = sessionStorage.key(i);
      if (k && k.startsWith(p)) keysToRemove.push(k);
    }

    keysToRemove.forEach((k) => sessionStorage.removeItem(k));
    return true;
  } catch {
    return false;
  }
}

/* Convenience: clear everything TGK cached */
export function clearAllTgkCache() {
  return clearCache("");
}
