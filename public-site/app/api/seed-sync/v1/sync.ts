import { env } from "cloudflare:workers";

export const protocol = "leis-seed-sync/v1";
export const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "GET, POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type", "Cache-Control": "no-store" };
export const reply = (body: unknown, status = 200) => Response.json(body, { status, headers: cors });
export const bytes = (value: string) => Uint8Array.from(atob(value.replace(/-/g, "+").replace(/_/g, "/")), c => c.charCodeAt(0));
export const base64 = (value: Uint8Array) => btoa(String.fromCharCode(...value)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
export const clean = (value: unknown, limit: number) => typeof value === "string" ? value.trim().slice(0, limit) : "";
export const signatureMessage = (kind: string, seedId: string, generation: number, manifestHash: string, publicKey: string, nonce: string, body = "") => `${protocol}|${kind}|${seedId}|${generation}|${manifestHash}|${publicKey}|${nonce}|${body}`;

export async function verify(publicKey: string, signature: string, message: string) {
  try {
    const key = await crypto.subtle.importKey("raw", bytes(publicKey), { name: "Ed25519" }, false, ["verify"]);
    return crypto.subtle.verify({ name: "Ed25519" }, key, bytes(signature), new TextEncoder().encode(message));
  } catch { return false; }
}

export function db() {
  if (!env.DB) throw new Error("Seed Farm storage is unavailable.");
  return env.DB;
}

export async function useChallenge(nonce: string, purpose: string) {
  const result = await db().prepare("UPDATE sync_challenges SET used_at = ? WHERE nonce = ? AND purpose = ? AND used_at = '' AND expires_at > ?").bind(new Date().toISOString(), nonce, purpose, new Date().toISOString()).run();
  return (result.meta.changes ?? 0) === 1;
}
