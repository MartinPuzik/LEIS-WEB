CREATE TABLE `sync_challenges` (
	`nonce` text PRIMARY KEY NOT NULL,
	`purpose` text NOT NULL,
	`expires_at` text NOT NULL,
	`used_at` text DEFAULT '' NOT NULL
);
--> statement-breakpoint
ALTER TABLE `seed_registry` ADD `manifest_hash` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `seed_registry` ADD `public_key` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `seed_registry` ADD `last_sync` text DEFAULT '' NOT NULL;