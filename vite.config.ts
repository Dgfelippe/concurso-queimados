import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
  const basePath = loadEnv(mode, '.', '').VITE_BASE_PATH || '/';
  return {
  base: basePath,
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('/node_modules/react/') || id.includes('/node_modules/react-dom/') ||
            id.includes('/node_modules/react-router/') || id.includes('/node_modules/react-router-dom/') ||
            id.includes('/node_modules/scheduler/')) return 'react-vendor';
        }
      }
    }
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'Dg Concursos',
        short_name: 'Dg Concursos',
        description: 'Preparação para concursos públicos com questões, simulados e acompanhamento de estudos.',
        lang: 'pt-BR',
        theme_color: '#090a0e',
        background_color: '#090a0e',
        display: 'standalone',
        start_url: basePath,
        icons: [{ src: `${basePath}favicon.svg`, sizes: 'any', type: 'image/svg+xml', purpose: 'any' }]
      },
      workbox: {
        navigateFallback: 'index.html',
        globPatterns: ['**/*.{css,html,svg,woff2}'],
        runtimeCaching: [{
          urlPattern: ({ request }) => request.destination === 'script',
          handler: 'CacheFirst',
          options: {
            cacheName: 'app-scripts',
            expiration: { maxEntries: 40, maxAgeSeconds: 60 * 60 * 24 * 30 },
            cacheableResponse: { statuses: [0, 200] }
          }
        }]
      }
    })
  ]
  };
});
