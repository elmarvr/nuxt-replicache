import { type WatchSource } from "vue";

export function useSubscribe<Tx, TData, TDefault = undefined>(
  replicache: Subscribable<Tx>,
  query: (tx: Tx) => Promise<TData>,
  opts: UseSubscribeOptions<TData, TDefault> = {}
): Ref<TData | TDefault> {
  const data = ref(opts.default);
  let unsubscribe = () => {};

  subscribe();
  if (opts.watch) {
    watch(opts.watch, subscribe);
  }

  function subscribe() {
    unsubscribe();

    unsubscribe = replicache.subscribe(query, {
      onData: (value) => {
        data.value = value;
      },
      isEqual: opts.isEqual,
    });
  }

  return data as Ref<TData | TDefault>;
}

export type UseSubscribeOptions<TData, TDefault> = {
  default?: TDefault;
  watch?: WatchSource[] | undefined;
  isEqual?: ((a: TData, b: TData) => boolean) | undefined;
};

export interface Subscribable<Tx> {
  subscribe<Data>(
    query: (tx: Tx) => Promise<Data>,
    options: {
      onData: (data: Data) => void;
      isEqual?: ((a: Data, b: Data) => boolean) | undefined;
    }
  ): () => void;
}
