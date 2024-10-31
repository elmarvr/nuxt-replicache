import { EventEmitter } from "node:events";

const emitter = new EventEmitter();

export function poke() {
  emitter.emit("poke");
}

export function onPoke(callback: () => void) {
  emitter.on("poke", callback);

  return () => {
    emitter.removeListener("poke", callback);
  };
}
