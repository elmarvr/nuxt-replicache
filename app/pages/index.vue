<script setup lang="ts">
import {
  Replicache,
  type MutatorDefs,
  type WriteTransaction,
} from "replicache";
import type { Message } from "~~/server/database/schema";
import { nanoid } from "nanoid";

const runtimeConfig = useRuntimeConfig();

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

const replicache = new Replicache({
  name: "chat-user-id",
  licenseKey: runtimeConfig.public.replicacheLicenseKey,
  mutators,
  pullURL: "/api/replicache/pull",
  pushURL: "/api/replicache/push",
  logLevel: "debug",
  pullInterval: 10000,
});

const messages = useSubscribe(
  replicache,
  async (tx) => {
    const list = await tx
      .scan<{ order: number; id: number; from: string; content: string }>({
        prefix: "message/",
      })
      .entries()
      .toArray();

    list.sort(([, { order: a }], [, { order: b }]) => a - b);
    return list;
  },
  { default: [] }
);

function onSubmit(event: Event) {
  event.preventDefault();
  const form = event.target as HTMLFormElement;
  const formData = new FormData(form);
  const from = formData.get("from") as string;
  const content = formData.get("content") as string;

  const lastMessage = messages.value[messages.value.length - 1]?.[1];
  const order = lastMessage?.order ? lastMessage.order + 1 : 0;

  replicache.mutate.createMessage({
    id: nanoid(),
    from,
    content,
    order,
  });
}
</script>

<template>
  <form @submit="onSubmit">
    <input type="text" name="from" placeholder="From" />
    <input type="text" name="content" placeholder="Content" />

    <button type="submit">Send</button>
  </form>
  <ul>
    <li v-for="[key, value] in messages" :key="key">
      <strong>{{ value.from }}</strong
      >: {{ value.content }}
    </li>
  </ul>
</template>
