import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const replicacheServer = sqliteTable("replicache_server", {
  id: integer().primaryKey().notNull(),
  version: integer().notNull().default(1),
});

export const message = sqliteTable("message", {
  id: text().primaryKey().notNull(),
  sender: text().notNull(),
  content: text().notNull(),
  ord: integer().notNull(),
  deleted: integer({ mode: "boolean" }).notNull().default(false),
  version: integer().notNull(),
});

export const messageSelectSchema = createSelectSchema(message);
export const messageInsertSchema = createInsertSchema(message);

export type Message = typeof message.$inferSelect;
export type MessageInsert = typeof message.$inferInsert;

export const replicacheClient = sqliteTable("replicache_client", {
  id: text().primaryKey().notNull(),
  clientGroupId: text("client_group_id").notNull(),
  lastMutationId: integer("last_mutation_id").notNull(),
  version: integer().notNull(),
});

export type ReplicacheClient = typeof replicacheClient.$inferSelect;
export type ReplicacheClientInsert = typeof replicacheClient.$inferInsert;
