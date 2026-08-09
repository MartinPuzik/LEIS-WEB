import { count, eq } from "drizzle-orm";
import { getDb } from "../../../../db";
import { seedDeltas, seedRegistry } from "../../../../db/schema";

const protocol = "leis-seed-sync/v1";
const maxBodyBytes = 64 * 1024;
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Cache-Control": "no-store",
};

type SyncPayload = {
  protocol?: string;
  manifest?: {
    seed_id?: string;
    seed_type?: string;
    seed_version?: string;
    home?: { url?: string; sync_enabled?: boolean };
    sync_generation?: number;
    topics?: unknown;
    city?: string;
    capabilities?: unknown;
  };
  delta?: { topic?: string; statement?: string };
};

function json(body: unknown, status = 200) {
  return Response.json(body, { status, headers: corsHeaders });
}

function text(value: unknown, limit: number) {
  return typeof value === "string" ? value.trim().slice(0, limit) : "";
}

function list(value: unknown, limit: number) {
  if (!Array.isArray(value)) return [];
  return value.map((item) => text(item, 80)).filter(Boolean).slice(0, limit);
}

function record(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return Object.fromEntries(
    Object.entries(value).slice(0, 20).map(([key, item]) => [text(key, 80), text(item, 200)])
  );
}

function validHome(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:";
  } catch {
    return false;
  }
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders });
}

export async function GET() {
  try {
    const db = getDb();
    const [{ seeds }] = await db.select({ seeds: count() }).from(seedRegistry);
    const [{ pendingSeeds }] = await db.select({ pendingSeeds: count() }).from(seedRegistry).where(eq(seedRegistry.status, "pending"));
    const [{ activeSeeds }] = await db.select({ activeSeeds: count() }).from(seedRegistry).where(eq(seedRegistry.status, "active"));
    const [{ pendingDeltas }] = await db.select({ pendingDeltas: count() }).from(seedDeltas).where(eq(seedDeltas.status, "pending"));
    return json({
      protocol,
      status: "active",
      registration: "quarantine",
      accepts: ["public_seed_manifest", "public_delta"],
      privacy: "No private files, chat content, names, emails or credentials are accepted.",
      network: { seeds, pending_seeds: pendingSeeds, active_seeds: activeSeeds, pending_deltas: pendingDeltas },
    });
  } catch (error) {
    return json({ protocol, status: "unavailable", error: error instanceof Error ? error.message : "Storage is unavailable." }, 503);
  }
}

export async function POST(request: Request) {
  try {
    const contentLength = Number(request.headers.get("content-length") ?? "0");
    if (contentLength > maxBodyBytes) return json({ error: "Payload is too large." }, 413);
    const raw = await request.text();
    if (raw.length > maxBodyBytes) return json({ error: "Payload is too large." }, 413);
    const payload = JSON.parse(raw) as SyncPayload;
    if (payload.protocol !== protocol) return json({ error: `protocol must be ${protocol}.` }, 400);

    const manifest = payload.manifest;
    const seedId = text(manifest?.seed_id, 96);
    const seedType = text(manifest?.seed_type, 32);
    const seedVersion = text(manifest?.seed_version, 64);
    const homeUrl = text(manifest?.home?.url, 500);
    if (!/^LEIS-[A-Z0-9-]{2,90}$/i.test(seedId) || !seedType || !seedVersion || !validHome(homeUrl)) {
      return json({ error: "A public LEIS seed_id, seed_type, seed_version and HTTPS home.url are required." }, 400);
    }
    if (manifest?.home?.sync_enabled !== true) return json({ error: "home.sync_enabled must be true." }, 400);

    const db = getDb();
    const now = new Date().toISOString();
    const existing = await db.select({ seedId: seedRegistry.seedId }).from(seedRegistry).where(eq(seedRegistry.seedId, seedId)).limit(1);
    if (existing.length) return json({ error: "This seed_id is already registered. A registered Seed cannot be changed through the public gateway." }, 409);

    await db.insert(seedRegistry).values({
      seedId,
      seedType,
      seedVersion,
      homeUrl,
      syncGeneration: Number.isInteger(manifest?.sync_generation) && (manifest?.sync_generation ?? 0) > 0 ? manifest!.sync_generation! : 1,
      topicsJson: JSON.stringify(list(manifest?.topics, 24)),
      city: text(manifest?.city, 120),
      capabilitiesJson: JSON.stringify(record(manifest?.capabilities)),
      status: "pending",
      receivedAt: now,
    });

    const topic = text(payload.delta?.topic, 120);
    const statement = text(payload.delta?.statement, 2400);
    if (topic && statement) await db.insert(seedDeltas).values({ seedId, topic, delta: statement, status: "pending", receivedAt: now });

    return json({ protocol, seed_id: seedId, status: "pending_review", message: "The public Seed was received into quarantine. It is not active and does not change the LEIS network until review." }, 202);
  } catch (error) {
    if (error instanceof SyntaxError) return json({ error: "Invalid JSON." }, 400);
    return json({ error: error instanceof Error ? error.message : "Unable to receive the Seed." }, 500);
  }
}
