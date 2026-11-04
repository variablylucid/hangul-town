import { defineConfig } from 'vite';

export default defineConfig({
  // Relative paths so the build works from an itch.io subfolder.
  base: './',
  server: { host: true },
  build: {
    // Phaser alone is ~1.3 MB minified; that's expected.
    chunkSizeWarningLimit: 2000,
    rolldownOptions: {
      input: {
        main: 'index.html',
        fonts: 'fonts.html', // font test page
      },
    },
  },
});
