// Import the defineConfig function from the vite package.
// This function is used to create a Vite configuration object.
import { defineConfig } from 'vite';

// Import the react plugin from the @vitejs/plugin-react package.
// This plugin enables React support in Vite.
import react from '@vitejs/plugin-react';

// Import the VitePWA plugin.
import { VitePWA } from 'vite-plugin-pwa';

// Export the Vite configuration object.
export default defineConfig({
  // Use the react and VitePWA plugins.
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'Соціальна мапа турботи',
        short_name: 'Мапа турботи',
        description: 'Мапа соціальних послуг України.',
        lang: 'uk',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
    }),
  ],
  // Configure the build process.
  build: {
    // Specify the output directory for the build.
    outDir: 'dist',
    // Disable sourcemaps for the build.
    sourcemap: false,
    // Set the chunk size warning limit to 1600KB.
    chunkSizeWarningLimit: 1600,
  },
  // Configure the development server.
  server: {
    // Specify the port for the development server.
    port: 3000,
  },
});
