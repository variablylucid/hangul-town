import { defineConfig } from 'vite';

export default defineConfig({
  // Relative paths so the build works from an itch.io subfolder.
  base: './',
  server: { host: true },
  // Phaser alone is ~1.3 MB minified; that's expected.
  build: { chunkSizeWarningLimit: 2000 },
});
