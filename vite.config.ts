import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [{
    name: 'development-style-policy',
    transformIndexHtml(html, context) {
      // Vite injects styles during development; the packaged app stays strict.
      return context.server ? html.replace("style-src 'self'", "style-src 'self' 'unsafe-inline'") : html;
    },
  }],
  base: './',
  server: { host: '127.0.0.1', port: 5173, strictPort: true },
  build: { outDir: 'dist', emptyOutDir: true },
});
