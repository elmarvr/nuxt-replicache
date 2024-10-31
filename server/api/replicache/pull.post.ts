import { gt } from "drizzle-orm";
import { PatchOperation } from "replicache";
import { z } from "zod";
import { DatabaseTransaction } from "~~/server/utils/drizzle";

export default defineEventHandler(async (event) => {
  const pull = await readValidatedBody(event, pullRequestV1Schema.parse);
  const fromVersion = pull.cookie ?? 0;

  const tx = useDrizzle();
  const server = await tx.query.replicacheServer.findFirst({
    where: eq(table.replicacheServer.id, 1),
    columns: {
      version: true,
    },
  });

  if (!server) {
    throw createError({
      status: 500,
      statusMessage: "Internal Server Error",
      message: "Server version not found",
    });
  }

  if (fromVersion > server.version) {
    throw createError({
      status: 409,
      statusMessage: "Conflict",
      message: `fromVersion ${fromVersion} is from the future - aborting`,
    });
  }

  const lastMutationIdChanges = await getLastMutationIdChanges(
    tx,
    pull.clientGroupID,
    fromVersion
  );

  const changed = await tx.query.message.findMany({
    where: gt(table.message.version, fromVersion),
  });

  const patch: PatchOperation[] = [];

  for (const row of changed) {
    if (row.deleted) {
      if (row.version > server.version) {
        patch.push({
          op: "del",
          key: row.id,
        });
      }
      return;
    }

    patch.push({
      op: "put",
      key: row.id,
      value: row,
    });
  }

  const payload = {
    lastMutationID: lastMutationIdChanges,
    cookie: server.version,
    patch,
  };

  console.log(payload);

  return payload;
});

async function getLastMutationIdChanges(
  tx: DatabaseTransaction,
  clientGroupId: string,
  fromVersion: number
) {
  const result = await tx.query.replicacheClient.findMany({
    where: and(
      eq(table.replicacheClient.clientGroupId, clientGroupId),
      gt(table.replicacheClient.version, fromVersion)
    ),
    columns: {
      id: true,
      lastMutationId: true,
    },
  });

  return Object.fromEntries(result.map((r) => [r.id, r.lastMutationId]));
}

const pullRequestV1Schema = z.object({
  pullVersion: z.literal(1),
  schemaVersion: z.string(),
  profileID: z.string(),
  cookie: z.number().nullable(),
  clientGroupID: z.string(),
});
