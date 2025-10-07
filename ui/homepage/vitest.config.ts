import path from 'node:path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    include: ['app/**/*.test.{ts,tsx}', 'app/**/*.__tests__/*.{ts,tsx}', 'app/**/__tests__/**/*.{ts,tsx}'],
    environmentOptions: {
      jsdom: {
        url: 'http://localhost',
      },
    },
  },
  resolve: {
    alias: {
      '@components': path.resolve(__dirname, 'components'),
      '@i18n': path.resolve(__dirname, 'i18n'),
      '@lib': path.resolve(__dirname, 'lib'),
      '@types': path.resolve(__dirname, 'types'),
    },
  },
  esbuild: {
    loader: 'tsx',
    jsx: 'automatic',
  },
})
