import { cors, db, protocol, reply } from "./sync";

export async function OPTIONS() { return new Response(null, { status: 204, headers: cors }); }

export async function GET() {
  try {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const [seeds, active, newSeeds, deltas, newDeltas] = await db().batch([
      db().prepare("SELECT COUNT(*) AS value FROM seed_registry"),
      db().prepare("SELECT COUNT(*) AS value FROM seed_registry WHERE status='verified'"),
      db().prepare("SELECT COUNT(*) AS value FROM seed_registry WHERE received_at >= ?").bind(since),
      db().prepare("SELECT COUNT(*) AS value FROM seed_deltas WHERE status='verified'"),
      db().prepare("SELECT COUNT(*) AS value FROM seed_deltas WHERE status='verified' AND received_at >= ?").bind(since),
    ]);
    const value = (result: D1Result<unknown>) => Number((result.results[0] as { value: number }).value);
    return reply({ protocol, status: "active", seed_farm: { total_seeds: value(seeds), active_seeds: value(active), new_seeds_24h: value(newSeeds), delta_growth: { total: value(deltas), last_24h: value(newDeltas) } } });
  } catch (error) { return reply({ protocol, status: "unavailable", error: error instanceof Error ? error.message : "Storage is unavailable." }, 503); }
}
