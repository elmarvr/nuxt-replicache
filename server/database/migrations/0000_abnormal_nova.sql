CREATE TABLE `message` (
	`id` text PRIMARY KEY NOT NULL,
	`sender` text NOT NULL,
	`content` text NOT NULL,
	`ord` integer NOT NULL,
	`deleted` integer DEFAULT false NOT NULL,
	`version` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `replicache_client` (
	`id` text PRIMARY KEY NOT NULL,
	`client_group_id` text NOT NULL,
	`last_mutation_id` integer NOT NULL,
	`version` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `replicache_server` (
	`id` integer PRIMARY KEY NOT NULL,
	`version` integer DEFAULT 1 NOT NULL
);
