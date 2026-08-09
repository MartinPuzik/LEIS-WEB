import { cors, db, protocol, reply } from "../../../sync";
export async function OPTIONS() { return new Response(null, { status: 204, headers: cors }); }
export async function GET(_: Request, { params }: { params: Promise<{ seedId: string }> }) {
  const { seedId } = await params;
  const seed = await db().prepare("SELECT seed_id, manifest_hash, status, topics_json, last_sync, sync_generation FROM seed_registry WHERE seed_id=?").bind(seedId).first();
  return seed ? reply({ protocol, seed }) : reply({ error: "Seed not found." }, 404);
}
