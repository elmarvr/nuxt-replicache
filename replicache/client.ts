import type { WriteTransaction } from "replicache";
import type { Server } from "./server";

export function defineClient<TServer extends Server<any>>(mutations: {
  [K in keyof TServer["mutations"]]: (
    tx: WriteTransaction,
    input: TServer["mutations"][K]["_input"]
  ) => Promise<void>;
}) {
  return mutations;
}
