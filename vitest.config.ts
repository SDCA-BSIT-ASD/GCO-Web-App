import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    projects: [
      {
        test: {
          name: 'unit',
          include: ['app/**/*.test.{js,ts}', 'server/**/*.test.{js,ts}'],
          environment: 'jsdom'
        }
      },
      {
        test: {
          name: 'e2e',
          include: ['tests/e2e/*.{test,spec}.ts'],
          environment: 'node'
        }
      }
    ]
  }
})
