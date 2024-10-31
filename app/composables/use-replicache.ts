import {
  Replicache,
  type MutatorDefs,
  type WriteTransaction,
} from "replicache";

export function useReplicache(name: string) {
  const runtimeConfig = useRuntimeConfig();

  const replicache = new Replicache({
    name,
    licenseKey: runtimeConfig.public.replicacheLicenseKey,
    mutators,
    pullURL: "/api/replicache/pull",
    pushURL: "/api/replicache/push",
    logLevel: "debug",
    pullInterval: null,
  });

  const { data } = useEventSource("/api/replicache/poke");

  watch(data, () => {
    replicache.pull();
  });

  return replicache;
}

const mutators = {
  async createMessage(
    tx: WriteTransaction,
    {
      id,
      from,
      content,
      order,
    }: {
      id: string;
      from: string;
      content: string;
      order: number;
    }
  ) {
    await tx.set(`message/${id}`, {
      from,
      content,
      order,
    });
  },
} satisfies MutatorDefs;
