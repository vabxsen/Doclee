import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import { fileURLToPath, URL } from 'node:url'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: null,
      workbox: {
        globPatterns: ['**/*.{js,css,html,woff2,svg,png,ico}'],
        // These are only needed by specific, less-common features (HEIC/TIFF
        // photo uploads, the PDF page-picker tools, sign-in/history) — force-
        // downloading them on every install/update isn't worth it when most
        // visitors just use the core Image-to-PDF flow. They're still cached
        // on-demand (CacheFirst below) the first time each is actually used.
        globIgnores: [
          '**/vendor-heic-*.js',
          '**/vendor-tiff-*.js',
          '**/vendor-firebase-auth-*.js',
          '**/vendor-firebase-firestore-*.js',
          '**/vendor-pdfjs-*.js',
        ],
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/__\//],
        runtimeCaching: [
          {
            urlPattern: ({ url }) =>
              url.hostname.includes('googleapis.com') ||
              url.hostname.includes('firebaseio.com') ||
              url.hostname.includes('firebaseapp.com') ||
              url.hostname.includes('cloudfunctions.net'),
            handler: 'NetworkOnly',
          },
          {
            // Content-hashed filenames are immutable per hash, so CacheFirst
            // is safe — no need to ever revalidate a given hash against the network.
            urlPattern: ({ url }) =>
              /\/assets\/vendor-(heic|tiff|firebase-auth|firebase-firestore|pdfjs)-.*\.js$/.test(
                url.pathname,
              ),
            handler: 'CacheFirst',
            options: {
              cacheName: 'optional-vendor-chunks',
              expiration: { maxEntries: 20 },
            },
          },
        ],
      },
      includeAssets: ['favicon.png', 'apple-touch-icon.png', 'logo.png'],
      manifest: {
        id: '/',
        name: 'Doclee',
        short_name: 'Doclee',
        description: 'Convert images to PDF with uncompromising quality.',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        background_color: '#050505',
        theme_color: '#050505',
        orientation: 'any',
        categories: ['productivity', 'utilities', 'business'],
        icons: [
          { src: '/icons/icon-48.png', sizes: '48x48', type: 'image/png' },
          { src: '/icons/icon-72.png', sizes: '72x72', type: 'image/png' },
          { src: '/icons/icon-96.png', sizes: '96x96', type: 'image/png' },
          { src: '/icons/icon-128.png', sizes: '128x128', type: 'image/png' },
          { src: '/icons/icon-144.png', sizes: '144x144', type: 'image/png' },
          { src: '/icons/icon-152.png', sizes: '152x152', type: 'image/png' },
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-384.png', sizes: '384x384', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          {
            src: '/icons/maskable-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable',
          },
          {
            src: '/icons/maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
        shortcuts: [
          {
            name: 'Image to PDF',
            short_name: 'New PDF',
            url: '/tools/image-to-pdf',
            icons: [{ src: '/icons/icon-192.png', sizes: '192x192' }],
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    rollupOptions: {
      output: {
        // Deterministic names for optional/conditionally-needed vendors, so
        // the PWA precache config below can reliably exclude them by name —
        // Rollup's auto-generated chunk names aren't stable enough to glob.
        manualChunks(id) {
          if (id.includes('node_modules/heic2any')) return 'vendor-heic'
          if (id.includes('node_modules/utif') || id.includes('node_modules/pako')) return 'vendor-tiff'
          if (id.includes('node_modules/firebase/auth') || id.includes('node_modules/@firebase/auth')) {
            return 'vendor-firebase-auth'
          }
          if (
            id.includes('node_modules/firebase/firestore') ||
            id.includes('node_modules/@firebase/firestore')
          ) {
            return 'vendor-firebase-firestore'
          }
          if (id.includes('node_modules/pdfjs-dist')) return 'vendor-pdfjs'
          return undefined
        },
      },
    },
  },
  server: {
    port: process.env.PORT ? Number(process.env.PORT) : 5173,
    strictPort: false,
  },
  preview: {
    port: process.env.PORT ? Number(process.env.PORT) : 4173,
    strictPort: false,
  },
})
