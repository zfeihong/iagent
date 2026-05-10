import { defineConfig } from 'vite';

export default defineConfig({
  root: __dirname,
  base: '/',
  build: {
    outDir: '../dist/web',
    assetsDir: 'assets',
    emptyOutDir: true
  },
  server: {
    port: 5173,
    open: true
  }
});
