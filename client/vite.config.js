import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Home is lazy-loaded, so its JS/CSS are normally discovered only after the
// main bundle runs. This writes the hashed file names (plus their static
// imports) into index.html so the inline script can preload them on "/".
function homeChunkPreload() {
  const PLACEHOLDER = '__HOME_PRELOAD__';
  return {
    name: 'home-chunk-preload',
    transformIndexHtml: {
      order: 'post',
      handler(html, ctx) {
        const assets = { js: [], css: [] };
        const bundle = ctx.bundle;
        const home = bundle && Object.values(bundle).find(
          (c) => c.type === 'chunk' && c.facadeModuleId && /[\\/]pages[\\/]Home\.jsx$/.test(c.facadeModuleId)
        );
        if (home) {
          const seen = new Set();
          const visit = (fileName) => {
            const chunk = bundle[fileName];
            if (!chunk || seen.has(fileName) || chunk.isEntry) return;
            seen.add(fileName);
            assets.js.push('/' + fileName);
            chunk.viteMetadata?.importedCss?.forEach((css) => {
              if (!assets.css.includes('/' + css)) assets.css.push('/' + css);
            });
            chunk.imports.forEach(visit);
          };
          visit(home.fileName);
        }
        return html.replace(PLACEHOLDER, JSON.stringify(assets));
      },
    },
  };
}

export default defineConfig({
  plugins: [react(), homeChunkPreload()],
  server: {
    port: 5175,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  preview: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    cssCodeSplit: true,
    target: 'es2020',
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        // Only the core React runtime is grouped by hand. Everything else
        // (framer-motion, swiper, lenis, axios...) is left to the bundler so it
        // lands in the lazy page chunks that actually use it instead of being
        // preloaded on every page.
        manualChunks(id) {
          if (
            /[\\/]node_modules[\\/](react|react-dom|scheduler|react-router|react-router-dom|react-helmet-async)[\\/]/.test(id)
          ) {
            return 'vendor-react';
          }
        },
      },
    },
  },
});
