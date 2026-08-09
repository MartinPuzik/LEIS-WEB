import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

// Public Seed Network V1 stores only declared public metadata. Incoming Seeds
// remain quarantined until a future owner-controlled review flow activates them.
export const seedRegistry = sqliteTable("seed_registry", {
  seedId: text("seed_id").primaryKey(),
  seedType: text("seed_type").notNull(),
  seedVersion: text("seed_version").notNull(),
  homeUrl: text("home_url").notNull(),
  syncGeneration: integer("sync_generation").notNull().default(1),
  topicsJson: text("topics_json").notNull().default("[]"),
  city: text("city").notNull().default(""),
  capabilitiesJson: text("capabilities_json").notNull().default("{}"),
  status: text("status").notNull().default("pending"),
  receivedAt: text("received_at").notNull(),
});

export const seedDeltas = sqliteTable("seed_deltas", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  seedId: text("seed_id").notNull(),
  topic: text("topic").notNull(),
  delta: text("delta").notNull(),
  status: text("status").notNull().default("pending"),
  receivedAt: text("received_at").notNull(),
});
