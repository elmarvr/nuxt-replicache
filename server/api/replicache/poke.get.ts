import { onPoke } from "~~/server/utils/poke";

export default defineEventHandler((event) => {
  const eventStream = createEventStream(event);

  const cleanup = onPoke(() => {
    eventStream.push("poke");
  });

  eventStream.onClosed(() => {
    cleanup();
  });

  return eventStream;
});
