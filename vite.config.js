import { defineConfig } from 'vite';

export default defineConfig({
  base: process.env.NODE_ENV === 'production' ? '/my-game/' : '/',
  build: { chunkSizeWarningLimit: 1600, assetsInlineLimit: 0, rollupOptions: { output: { manualChunks: id => (id.includes('node_modules/phaser') ? 'phaser' : undefined) } } },
  server: { host: true },
});
