export default defineNuxtConfig({
  modules: ["@nuxthub/core", "@vueuse/nuxt"],
  devtools: { enabled: true },
  future: { compatibilityVersion: 4 },
  compatibilityDate: "2024-07-30",

  runtimeConfig: {
    public: {
      replicacheLicenseKey: "",
    },
  },
  ssr: false,

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
