import type { InlineConfig } from 'vitest'
import type { UserConfig } from 'vite'
import { defineConfig } from 'vite'

interface VitestConfigExport extends UserConfig {
  test: InlineConfig
}

module.exports = defineConfig({
  plugins: [],
  build: {
    lib: {
      entry: './src/index.ts',
      formats: ['es', 'cjs'],
      fileName: (format) => `index.${format}.js`,
    },
    emptyOutDir: false,
    outDir: 'dist/compiled',
  },
  test: {
    globals: true,
    include: ['**/*.spec.ts'],
    setupFiles: ['./setupTests.ts'],
    environment: 'jsdom',
  },
} as VitestConfigExport)
