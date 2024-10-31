export default defineNuxtConfig({
  modules: ["@nuxthub/core"],
  devtools: { enabled: true },
  future: { compatibilityVersion: 4 },
  compatibilityDate: "2024-07-30",

  hub: {
    database: true,
  },
  nitro: {
    experimental: {
      tasks: true,
      websocket: true,
    },
  },
});
