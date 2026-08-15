import { env } from "cloudflare:workers";

const PUBLIC_KEY_JWK: JsonWebKey = {
  kty: "EC",
  crv: "P-256",
  x: "xwI8Wba2oBBEB2zw8e-qVwyJmXH34XOd1n_Nnmm0Fu4",
  y: "Ety1MDzwqb6zbDa52Cj6Gp1YcJdCg_0p9SpvnCSFBR8",
  ext: true,
  key_ops: ["verify"],
};

const STATUS_ID = 1;
const MAX_BODY_BYTES = 16 * 1024;
const noStore = { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" };

type PublicBook = {
  title: string;
  type: string;
  started_at?: string | null;
  completed_at?: string | null;
  attempt?: number | null;
};

function database() {
  if (!env.DB) throw new Error("Public status storage is unavailable.");
  return env.DB;
}

async function ensureTable() {
  await database().prepare(`
    CREATE TABLE IF NOT EXISTS memory_public_status (
      id INTEGER PRIMARY KEY,
      payload_json TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `).run();
}

function integer(value: unknown, minimum = 0, maximum = 10_000_000) {
  const result = Number(value);
  if (!Number.isInteger(result) || result < minimum || result > maximum) throw new Error("invalid integer");
  return result;
}

function number(value: unknown, minimum = 0, maximum = 100) {
  const result = Number(value);
  if (!Number.isFinite(result) || result < minimum || result > maximum) throw new Error("invalid number");
  return result;
}

function text(value: unknown, maximum = 300) {
  const result = String(value ?? "").replace(/\s+/g, " ").trim();
  if (!result || result.length > maximum) throw new Error("invalid text");
  return result;
}

function optionalIso(value: unknown) {
  if (value == null) return null;
  const result = text(value, 50);
  if (Number.isNaN(Date.parse(result))) throw new Error("invalid date");
  return result;
}

function book(value: unknown, current = false): PublicBook | null {
  if (value == null && current) return null;
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("invalid book");
  const input = value as Record<string, unknown>;
  const result: PublicBook = { title: text(input.title), type: text(input.type || "document", 10).toLowerCase() };
  if (current) {
    result.started_at = optionalIso(input.started_at);
    result.attempt = input.attempt == null ? null : integer(input.attempt, 1, 20);
  } else {
    result.completed_at = optionalIso(input.completed_at);
  }
  return result;
}

function sanitize(input: unknown) {
  if (!input || typeof input !== "object" || Array.isArray(input)) throw new Error("invalid payload");
  const value = input as Record<string, any>;
  if (value.schema !== "leis_memory_public_status_v1") throw new Error("invalid schema");
  const total = integer(value.books?.total, 1);
  const fullyRead = integer(value.books?.fully_read, 0, total);
  const remaining = integer(value.books?.remaining, 0, total);
  if (fullyRead + remaining !== total) throw new Error("invalid totals");
  const recent = Array.isArray(value.last_books) ? value.last_books.slice(0, 5).map((item: unknown) => book(item)) : [];
  return {
    schema: "leis_memory_public_status_v1",
    published_at: optionalIso(value.published_at),
    reader_state: text(value.reader_state, 30).toUpperCase(),
    heartbeat_age_seconds: value.heartbeat_age_seconds == null ? null : integer(value.heartbeat_age_seconds, 0, 86_400),
    books: { total, fully_read: fullyRead, remaining, percent: number(value.books?.percent) },
    pdf: { total: integer(value.pdf?.total), fully_read: integer(value.pdf?.fully_read) },
    epub: { total: integer(value.epub?.total), fully_read: integer(value.epub?.fully_read) },
    current_book: book(value.current_book, true),
    last_books: recent,
    definition: "Fully read means complete local text extraction with locator-preserving chunks. It does not mean factual validation or human understanding.",
  };
}

function base64(value: string) {
  try {
    const binary = atob(value);
    return Uint8Array.from(binary, character => character.charCodeAt(0));
  } catch {
    return null;
  }
}

async function localDevelopmentStatus() {
  if (process.env.NODE_ENV === "production") return null;
  try {
    const response = await fetch("http://127.0.0.1:8765/progress", { cache: "no-store" });
    if (!response.ok) return null;
    const local = await response.json() as Record<string, any>;
    return sanitize({
      schema: "leis_memory_public_status_v1",
      published_at: local.generated_at,
      reader_state: local.reader_state,
      heartbeat_age_seconds: local.heartbeat_age_seconds,
      books: local.books,
      pdf: { total: local.pdf?.total, fully_read: local.pdf?.fully_read },
      epub: { total: local.epub?.total, fully_read: local.epub?.fully_read },
      current_book: local.current_book ? {
        title: local.current_book.title,
        type: String(local.current_book.extension || "document").replace(/^\./, ""),
        started_at: local.current_book.started_at,
        attempt: local.current_book.attempt,
      } : null,
      last_books: Array.isArray(local.last_books) ? local.last_books.slice(0, 5).map((item: Record<string, any>) => ({
        title: item.title,
        type: String(item.extension || "document").replace(/^\./, ""),
        completed_at: item.completed_at,
      })) : [],
    });
  } catch {
    return null;
  }
}

async function validSignature(timestamp: string, signature: string, body: string) {
  const epoch = Number(timestamp);
  if (!Number.isInteger(epoch) || Math.abs(Date.now() / 1000 - epoch) > 300) return false;
  const bytes = base64(signature);
  if (!bytes || bytes.byteLength !== 64) return false;
  const key = await crypto.subtle.importKey("jwk", PUBLIC_KEY_JWK, { name: "ECDSA", namedCurve: "P-256" }, false, ["verify"]);
  const message = new TextEncoder().encode(`${timestamp}.${body}`);
  return crypto.subtle.verify({ name: "ECDSA", hash: "SHA-256" }, key, bytes, message);
}

export async function GET() {
  try {
    const local = await localDevelopmentStatus();
    if (local) return Response.json(local, { headers: noStore });
    await ensureTable();
    const stored = await database().prepare("SELECT payload_json FROM memory_public_status WHERE id = ?").bind(STATUS_ID).first<{ payload_json: string }>();
    if (stored) return Response.json(JSON.parse(stored.payload_json), { headers: noStore });
    return Response.json({
      schema: "leis_memory_public_status_v1",
      published_at: null,
      reader_state: "WAITING_FOR_FIRST_UPDATE",
      heartbeat_age_seconds: null,
      books: { total: 1450, fully_read: 0, remaining: 1450, percent: 0 },
      pdf: { total: 1094, fully_read: 0 },
      epub: { total: 356, fully_read: 0 },
      current_book: null,
      last_books: [],
      definition: "Fully read means complete local text extraction with locator-preserving chunks. It does not mean factual validation or human understanding.",
    }, { headers: noStore });
  } catch {
    return Response.json({ status: "UNAVAILABLE" }, { status: 503, headers: noStore });
  }
}

export async function PUT(request: Request) {
  const length = Number(request.headers.get("content-length") || 0);
  if (length > MAX_BODY_BYTES) return Response.json({ status: "REJECTED", reason: "BODY_TOO_LARGE" }, { status: 413, headers: noStore });
  const body = await request.text();
  if (new TextEncoder().encode(body).byteLength > MAX_BODY_BYTES) return Response.json({ status: "REJECTED", reason: "BODY_TOO_LARGE" }, { status: 413, headers: noStore });
  const timestamp = request.headers.get("x-leis-timestamp") || "";
  const signature = request.headers.get("x-leis-signature") || "";
  if (!(await validSignature(timestamp, signature, body))) return Response.json({ status: "REJECTED", reason: "INVALID_SIGNATURE" }, { status: 401, headers: noStore });
  try {
    const status = sanitize(JSON.parse(body));
    await ensureTable();
    await database().prepare(`
      INSERT INTO memory_public_status (id, payload_json, updated_at)
      VALUES (?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET payload_json = excluded.payload_json, updated_at = excluded.updated_at
    `).bind(STATUS_ID, JSON.stringify(status), new Date().toISOString()).run();
    return Response.json({ status: "ACCEPTED", fully_read: status.books.fully_read }, { headers: noStore });
  } catch {
    return Response.json({ status: "REJECTED", reason: "INVALID_PAYLOAD" }, { status: 400, headers: noStore });
  }
}
