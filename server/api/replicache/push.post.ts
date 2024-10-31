import { consola } from "consola";
import { z } from "zod";
import {
  messageInsertSchema,
  type ReplicacheClientInsert,
} from "~~/server/database/schema";
import {
  buildConflictUpdateColumns,
  DatabaseTransaction,
} from "~~/server/utils/drizzle";

export default defineEventHandler(async (event) => {
  const push = await readValidatedBody(event, pushRequestV1Schema.parse);

  for (const mutation of push.mutations) {
    await applyMutation(useDrizzle(), push.clientGroupID, mutation);
  }
});

async function applyMutation(
  tx: DatabaseTransaction,
  clientGroupId: string,
  mutation: z.infer<typeof mutationV1Schema>
) {
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

  const nextVersion = server.version + 1;
  const lastMutationId = await getLastMutationId(tx, mutation.clientID);
  const nextMutationId = lastMutationId + 1;

  if (mutation.id < nextMutationId) {
    consola.info(`Mutation ${mutation.id} already applied - skipping`);
    return;
  }

  if (mutation.id > nextMutationId) {
    throw createError({
      status: 409,
      statusMessage: "Conflict",
      message: `Mutation ${mutation.id} is from the future - aborting`,
    });
  }

  switch (mutation.name) {
    case "createMessage": {
      await tx.insert(table.message).values({
        id: mutation.args.id,
        ord: mutation.args.order,
        sender: mutation.args.from,
        content: mutation.args.content,
        version: nextVersion,
      });
    }
  }

  await upsertReplicacheClient(tx, {
    id: mutation.clientID,
    clientGroupId,
    lastMutationId: nextMutationId,
    version: nextVersion,
  });

  await tx
    .update(table.replicacheServer)
    .set({
      version: nextVersion,
    })
    .where(eq(table.replicacheServer.id, 1));
}

async function getLastMutationId(tx: DatabaseTransaction, clientId: string) {
  const result = await tx.query.replicacheClient.findFirst({
    where: eq(table.replicacheClient.id, clientId),
  });

  if (!result) {
    return 0;
  }

  return result.lastMutationId;
}

async function upsertReplicacheClient(
  tx: DatabaseTransaction,
  value: ReplicacheClientInsert
) {
  await tx
    .insert(table.replicacheClient)
    .values(value)
    .onConflictDoUpdate({
      target: table.replicacheClient.id,
      set: buildConflictUpdateColumns(table.replicacheClient, [
        "clientGroupId",
        "lastMutationId",
        "version",
      ]),
    });
}

const mutationV1Schema = z
  .object({
    id: z.number(),
    timestamp: z.number(),
    clientID: z.string(),
  })
  .and(
    z.object({
      name: z.literal("createMessage"),
      args: z.object({
        id: z.string(),
        from: z.string(),
        content: z.string(),
        order: z.number(),
      }),
    })
    // .or(z.object({}))
  );

const pushRequestV1Schema = z.object({
  pushVersion: z.literal(1),
  schemaVersion: z.string(),
  profileID: z.string(),
  clientGroupID: z.string(),
  mutations: z.array(mutationV1Schema),
});
