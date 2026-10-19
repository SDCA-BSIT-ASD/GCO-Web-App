// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  app: {
    head: {
      htmlAttrs: {
        'data-theme': 'light'
      }
    }
  },
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  css: ['~/assets/styles/main.css'],
  modules: [
    '@nuxtjs/tailwindcss'
  ],
  runtimeConfig: {
    mongodbUri: ''
  }
})