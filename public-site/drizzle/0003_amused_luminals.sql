CREATE TABLE `realsim_weather_snapshot` (
	`id` integer PRIMARY KEY NOT NULL,
	`payload_json` text NOT NULL,
	`fetched_at` text NOT NULL,
	`last_attempt_at` text NOT NULL,
	`provider` text NOT NULL
);
