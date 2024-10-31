import { drizzle } from "drizzle-orm/d1";
export { sql, eq, and, or } from "drizzle-orm";

import * as schema from "../database/schema";
import { ExtractTablesWithRelations, getTableColumns, SQL } from "drizzle-orm";
import {
  BaseSQLiteDatabase,
  SQLiteTable,
  SQLiteTransaction,
} from "drizzle-orm/sqlite-core";

export const table = {
  replicacheServer: schema.replicacheServer,
  message: schema.message,
  replicacheClient: schema.replicacheClient,
};

export function useDrizzle() {
  return drizzle(hubDatabase(), { schema, casing: "snake_case" });
}

export type Database = ReturnType<typeof useDrizzle>;
export type DatabaseTransaction = BaseSQLiteDatabase<
  "async",
  D1Result,
  typeof schema
>;

export const buildConflictUpdateColumns = <
  T extends SQLiteTable,
  Q extends keyof T["_"]["columns"]
>(
  table: T,
  columns: Q[]
) => {
  const cls = getTableColumns(table);
  return columns.reduce((acc, column) => {
    const colName = cls[column].name;
    acc[column] = sql.raw(`excluded.${colName}`);
    return acc;
  }, {} as Record<Q, SQL>);
};
