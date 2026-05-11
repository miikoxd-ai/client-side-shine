import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

function randomCode(len: number) {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = new Uint8Array(len);
  crypto.getRandomValues(bytes);
  let out = "";
  for (let i = 0; i < len; i++) out += alphabet[bytes[i] % alphabet.length];
  return out;
}

function formatKey() {
  // 12 chars in groups of 4: XXXX-XXXX-XXXX
  const raw = randomCode(12);
  return `${raw.slice(0, 4)}-${raw.slice(4, 8)}-${raw.slice(8, 12)}`;
}

function randomToken() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

// ---------- USER ----------

export const redeemKey = createServerFn({ method: "POST" })
  .inputValidator((d: { key: string }) => ({ key: String(d.key || "").trim().toUpperCase() }))
  .handler(async ({ data }) => {
    if (!data.key || data.key.length < 6) {
      return { ok: false as const, error: "Invalid key" };
    }
    const token = randomToken();
    // Atomic: only update rows that are not yet consumed
    const { data: rows, error } = await supabaseAdmin
      .from("access_keys")
      .update({ consumed_at: new Date().toISOString(), device_token: token })
      .eq("key", data.key)
      .is("consumed_at", null)
      .select("id");
    if (error) return { ok: false as const, error: "Server error" };
    if (!rows || rows.length === 0) {
      // Either doesn't exist or already used
      return { ok: false as const, error: "Key is invalid or already used" };
    }
    return { ok: true as const, token };
  });

export const verifyToken = createServerFn({ method: "POST" })
  .inputValidator((d: { token: string }) => ({ token: String(d.token || "") }))
  .handler(async ({ data }) => {
    if (!data.token) return { valid: false as const };
    const { data: row } = await supabaseAdmin
      .from("access_keys")
      .select("id")
      .eq("device_token", data.token)
      .maybeSingle();
    return { valid: Boolean(row) };
  });

// ---------- ADMIN ----------

function checkAdmin(token: string) {
  const pw = process.env.ADMIN_PASSWORD;
  if (!pw) throw new Error("ADMIN_PASSWORD not set");
  // Simple scheme: admin token IS the password (sent over HTTPS, kept in sessionStorage).
  return token === pw;
}

export const adminLogin = createServerFn({ method: "POST" })
  .inputValidator((d: { password: string }) => ({ password: String(d.password || "") }))
  .handler(async ({ data }) => {
    const pw = process.env.ADMIN_PASSWORD;
    if (!pw) return { ok: false as const, error: "Admin not configured" };
    if (data.password !== pw) return { ok: false as const, error: "Wrong password" };
    return { ok: true as const, token: pw };
  });

export const adminListKeys = createServerFn({ method: "POST" })
  .inputValidator((d: { adminToken: string }) => ({ adminToken: String(d.adminToken || "") }))
  .handler(async ({ data }) => {
    if (!checkAdmin(data.adminToken)) return { ok: false as const, error: "Unauthorized" };
    const { data: rows, error } = await supabaseAdmin
      .from("access_keys")
      .select("id, key, note, consumed_at, created_at")
      .order("created_at", { ascending: false });
    if (error) return { ok: false as const, error: error.message };
    return { ok: true as const, keys: rows ?? [] };
  });

export const adminCreateKeys = createServerFn({ method: "POST" })
  .inputValidator((d: { adminToken: string; count: number; note?: string }) => ({
    adminToken: String(d.adminToken || ""),
    count: Math.max(1, Math.min(50, Number(d.count) || 1)),
    note: d.note ? String(d.note).slice(0, 200) : null,
  }))
  .handler(async ({ data }) => {
    if (!checkAdmin(data.adminToken)) return { ok: false as const, error: "Unauthorized" };
    const rows = Array.from({ length: data.count }, () => ({
      key: formatKey(),
      note: data.note,
    }));
    const { data: inserted, error } = await supabaseAdmin
      .from("access_keys")
      .insert(rows)
      .select("id, key, note, consumed_at, created_at");
    if (error) return { ok: false as const, error: error.message };
    return { ok: true as const, keys: inserted ?? [] };
  });
