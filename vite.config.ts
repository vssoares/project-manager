import { defineConfig } from 'vite'
import angular from '@analogjs/vite-plugin-angular'

export default defineConfig(({ mode }) => ({
  base: './',
  resolve: {
    mainFields: ['module'],
  },
  plugins: [angular({ jit: mode !== 'production' })],
  build: {
    outDir: 'dist',
    minify: 'esbuild',
    chunkSizeWarningLimit: 2500,
  },
  optimizeDeps: {
    include: ['monaco-editor'],
  },
  worker: {
    format: 'es',
  },
}))
