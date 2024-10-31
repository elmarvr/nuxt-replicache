import type { ZodSchema } from "zod";

class Mutation<
  TSchema extends ZodSchema<any>,
  TDef extends {
    input?: TSchema;
    handler?: (opts: { input: TSchema["_input"] }) => Promise<void>;
  }
> {
  _def: TDef;

  constructor(def: TDef) {
    this._def = def;
  }

  input<TSchema extends ZodSchema<any>>(input: TSchema) {
    return new Mutation<TSchema, TDef & { input: TSchema }>({
      ...this._def,
      input,
    });
  }

  handler(handler: (opts: { input: TSchema["_input"] }) => Promise<void>) {
    return new Mutation<
      TSchema,
      TDef & { handler: NonNullable<TDef["handler"]> }
    >({
      ...this._def,
      handler,
    });
  }

  //@internal
  _input!: TSchema["_input"];
}

class Server<TMutations extends Record<string, Mutation<ZodSchema<any>, any>>> {
  mutations: TMutations;

  constructor(mutations: TMutations) {
    this.mutations = mutations;
  }

  execute<TName extends keyof TMutations>(
    name: TName & string,
    rawInput: unknown
  ) {
    const mutation = this.mutations[name];

    if (!mutation) {
      throw createError({
        status: 404,
        statusMessage: "Not Found",
        message: `Unknown mutation ${name}`,
      });
    }

    const input = mutation._def.input!.parse(rawInput);

    return mutation._def.handler(input);
  }
}

export { type Mutation, type Server };

export const mutation = new Mutation({});
export function defineServer<
  TMutations extends Record<string, Mutation<ZodSchema<any>, any>>
>(mutations: TMutations): Server<TMutations> {
  return new Server(mutations);
}
