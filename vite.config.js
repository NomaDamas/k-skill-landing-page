import { defineConfig } from 'vite';

const utf8TextTypes = {
  name: 'utf8-text-types',
  configurePreviewServer(server) {
    server.middlewares.use((req, res, next) => {
      const url = req.url || '';
      if (/\.txt(\?|$)/.test(url)) {
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      } else if (/\.xml(\?|$)/.test(url)) {
        res.setHeader('Content-Type', 'application/xml; charset=utf-8');
      }
      next();
    });
  },
};

export default defineConfig({
  server: { port: 5173, strictPort: true },
  preview: {
    port: 4173,
    strictPort: true,
    allowedHosts: ['k-skill.nomadamas.org'],
  },
  plugins: [utf8TextTypes],
});
