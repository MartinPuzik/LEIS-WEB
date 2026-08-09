import { base64, clean, cors, db, protocol, reply, signatureMessage, useChallenge, verify } from "../sync";

export async function OPTIONS() { return new Response(null, { status: 204, headers: cors }); }

export async function GET(_: Request, { params }: { params: Promise<{ action: string }> }) {
  const { action } = await params;
  if (action !== "topic-fabric") return reply({ error: "Not found." }, 404);
  const results = await db().prepare("SELECT topic, delta, seed_id, received_at FROM seed_deltas WHERE status = 'verified' ORDER BY id DESC LIMIT 200").all();
  return reply({ protocol, deltas: results.results });
}

export async function POST(request: Request, { params }: { params: Promise<{ action: string }> }) {
  try {
    const { action } = await params;
    const body = await request.json() as Record<string, unknown>;
    if (body.protocol !== protocol) return reply({ error: `protocol must be ${protocol}` }, 400);
    if (action === "challenge") {
      const purpose = clean(body.purpose, 16);
      if (purpose !== "register" && purpose !== "delta") return reply({ error: "purpose must be register or delta." }, 400);
      const nonce = base64(crypto.getRandomValues(new Uint8Array(32)));
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();
      await db().prepare("INSERT INTO sync_challenges (nonce, purpose, expires_at, used_at) VALUES (?, ?, ?, '')").bind(nonce, purpose, expiresAt).run();
      return reply({ protocol, nonce, expires_at: expiresAt });
    }
    const seedId = clean(body.seed_id, 96), manifestHash = clean(body.manifest_hash, 128), publicKey = clean(body.public_key, 256), nonce = clean(body.nonce, 128), signature = clean(body.signature, 256);
    const generation = Number(body.generation);
    if (!/^[-a-zA-Z0-9]{8,96}$/.test(seedId) || !/^[a-f0-9]{64}$/i.test(manifestHash) || !Number.isInteger(generation) || generation < 1 || !publicKey || !nonce || !signature) return reply({ error: "Invalid public Seed identity." }, 400);
    if (action === "seeds") {
      const homeUrl = clean(body.home_url, 500);
      if (!homeUrl.startsWith("https://")) return reply({ error: "A HTTPS home_url is required." }, 400);
      if (!await useChallenge(nonce, "register") || !await verify(publicKey, signature, signatureMessage("register", seedId, generation, manifestHash, publicKey, nonce))) return reply({ error: "Registration signature or challenge is invalid." }, 401);
      const existing = await db().prepare("SELECT public_key FROM seed_registry WHERE seed_id = ?").bind(seedId).first<{ public_key: string }>();
      if (existing && existing.public_key !== publicKey) return reply({ error: "This Seed identity belongs to a different key." }, 409);
      const topics = Array.isArray(body.topics) ? body.topics.filter(v => typeof v === "string").map(v => clean(v, 80)).filter(Boolean).slice(0, 24) : [];
      const now = new Date().toISOString();
      if (existing) await db().prepare("UPDATE seed_registry SET manifest_hash=?, sync_generation=?, topics_json=?, last_sync=?, status='verified' WHERE seed_id=?").bind(manifestHash, generation, JSON.stringify(topics), now, seedId).run();
      else await db().prepare("INSERT INTO seed_registry (seed_id, seed_type, seed_version, home_url, sync_generation, topics_json, city, capabilities_json, manifest_hash, public_key, status, received_at, last_sync) VALUES (?, 'LEAF', 'v1', ?, ?, ?, '', '{}', ?, ?, 'verified', ?, ?)").bind(seedId, homeUrl, generation, JSON.stringify(topics), manifestHash, publicKey, now, now).run();
      return reply({ protocol, seed_id: seedId, status: "verified", last_sync: now }, 201);
    }
    if (action === "deltas") {
      const topic = clean(body.topic, 120), delta = clean(body.delta, 2400), type = clean(body.type, 40) || "question";
      if (!topic || !delta) return reply({ error: "topic and delta are required." }, 400);
      if (!await useChallenge(nonce, "delta") || !await verify(publicKey, signature, signatureMessage("delta", seedId, generation, manifestHash, publicKey, nonce, `${type}|${topic}|${delta}`))) return reply({ error: "Delta signature or challenge is invalid." }, 401);
      const seed = await db().prepare("SELECT public_key, status FROM seed_registry WHERE seed_id=?").bind(seedId).first<{ public_key: string; status: string }>();
      if (!seed || seed.public_key !== publicKey || seed.status !== "verified") return reply({ error: "Only a verified Seed may submit deltas." }, 403);
      const now = new Date().toISOString();
      await db().prepare("INSERT INTO seed_deltas (seed_id, topic, delta, status, received_at) VALUES (?, ?, ?, 'verified', ?)").bind(seedId, topic, JSON.stringify({ type, delta }), now).run();
      await db().prepare("UPDATE seed_registry SET last_sync=? WHERE seed_id=?").bind(now, seedId).run();
      return reply({ protocol, seed_id: seedId, status: "verified", delta_status: "verified" }, 201);
    }
    return reply({ error: "Not found." }, 404);
  } catch (error) { return reply({ error: error instanceof Error ? error.message : "Sync failed." }, 500); }
}
