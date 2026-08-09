CREATE TABLE `seed_deltas` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`seed_id` text NOT NULL,
	`topic` text NOT NULL,
	`delta` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`received_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `seed_registry` (
	`seed_id` text PRIMARY KEY NOT NULL,
	`seed_type` text NOT NULL,
	`seed_version` text NOT NULL,
	`home_url` text NOT NULL,
	`sync_generation` integer DEFAULT 1 NOT NULL,
	`topics_json` text DEFAULT '[]' NOT NULL,
	`city` text DEFAULT '' NOT NULL,
	`capabilities_json` text DEFAULT '{}' NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`received_at` text NOT NULL
);
