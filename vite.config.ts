import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
  const basePath = loadEnv(mode, '.', '').VITE_BASE_PATH || '/';
  return {
  base: basePath,
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'Queimados · Agente',
        short_name: 'Queimados Agente',
        description: 'Questões, simulados e acompanhamento de estudos para Agente Administrativo de Queimados.',
        theme_color: '#090a0e',
        background_color: '#090a0e',
        display: 'standalone',
        start_url: basePath,
        icons: [{ src: `${basePath}favicon.svg`, sizes: 'any', type: 'image/svg+xml', purpose: 'any' }]
      },
      workbox: { navigateFallback: 'index.html', globPatterns: ['**/*.{js,css,html,svg,woff2}'] }
    })
  ]
  };
});
