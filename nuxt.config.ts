import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  modules: ['nuxt-mongoose'],
  mongoose: {
    uri: process.env.NUXT_MONGODB_URI || '',
    modelsDir: 'models'
  },
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
  vite: {
    plugins: [
      tailwindcss()
    ]
  }
})