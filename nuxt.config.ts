import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  modules: ['nuxt-mongoose'],
  runtimeConfig: {
    sessionSecret: process.env.NUXT_SESSION_SECRET || 'gco-dev-session-secret',
    google: {
      clientId: process.env.NUXT_GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.NUXT_GOOGLE_CLIENT_SECRET || '',
      allowedDomains: process.env.NUXT_ALLOWED_EMAIL_DOMAINS || 'school.edu.ph'
    }
  },
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