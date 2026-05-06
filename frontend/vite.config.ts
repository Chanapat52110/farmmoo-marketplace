import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  base: "/",
  plugins: [tailwindcss(), react()],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  build: {
    // Generate source maps only in CI/staging; omit in production for security
    sourcemap: process.env.VITE_SOURCEMAP === 'true',
    // lightningcss (Vite 8 default) can't minify Tailwind v4's source() at-rule.
    // Disable CSS minification; Tailwind v4 already applies its own optimisations.
    cssMinify: false,
    rollupOptions: {
      output: {
        // Split large vendor chunks so users only re-download what changed
        manualChunks(id: string) {
          if (!id.includes('node_modules')) return undefined;
          if (/\/react\/|\/react-dom\/|\/react-router\//.test(id)) return 'vendor-react';
          if (/\/recharts\//.test(id)) return 'vendor-charts';
          if (/\/motion\//.test(id)) return 'vendor-motion';
          if (/\/@radix-ui\//.test(id)) return 'vendor-ui';
          return 'vendor-misc';
        },
      },
    },
  },

  server: {
    port: 5173,
  },
})
