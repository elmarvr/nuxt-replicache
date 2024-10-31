import { consola } from "consola";

export default defineTask({
  meta: {
    name: "db:seed",
    description: "Run database seed task",
  },
  async run() {
    const t0 = performance.now();

    //Run seed task here

    const t1 = performance.now();
    consola.success(`Database seed done in ${Math.round(t1 - t0)}ms`);

    return { result: "success" };
  },
});
