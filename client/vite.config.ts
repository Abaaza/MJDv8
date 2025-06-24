import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { visualizer } from 'rollup-plugin-visualizer';
import viteCompression from 'vite-plugin-compression';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const plugins = [react()];
  
  // Add bundle analyzer in development
  if (mode === 'development') {
    plugins.push(
      visualizer({
        open: false,
        gzipSize: true,
        brotliSize: true,
      })
    );
  }

  // Add compression in production
  if (mode === 'production') {
    plugins.push(
      viteCompression({
        algorithm: 'gzip',
        ext: '.gz',
      }),
      viteCompression({
        algorithm: 'brotliCompress',
        ext: '.br',
      })
    );
  }

  return {
    server: {
      host: "::",
      port: 8080,
    },
    plugins,
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    build: {
      outDir: "dist",
      sourcemap: mode === 'development',
      minify: mode === 'production' ? 'terser' : false,
      target: 'es2015',
      cssCodeSplit: true,
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks: {
            // Core vendor chunk
            vendor: ['react', 'react-dom', 'react-router-dom'],
            // UI library chunk
            ui: [
              '@radix-ui/react-dialog',
              '@radix-ui/react-dropdown-menu',
              '@radix-ui/react-tooltip',
              '@radix-ui/react-select',
              '@radix-ui/react-tabs',
            ],
            // Data fetching chunk
            data: ['@tanstack/react-query', '@supabase/supabase-js'],
            // Utilities chunk
            utils: ['date-fns', 'xlsx', 'zod', 'lucide-react'],
            // Form handling chunk
            forms: ['react-hook-form', '@hookform/resolvers'],
            // Charts chunk
            charts: ['recharts'],
          },
          // Use content hash for better caching
          chunkFileNames: (chunkInfo) => {
            const facadeModuleId = chunkInfo.facadeModuleId ? chunkInfo.facadeModuleId.split('/').pop() : 'chunk';
            return `js/${facadeModuleId}-[hash].js`;
          },
          entryFileNames: 'js/[name]-[hash].js',
          assetFileNames: (assetInfo) => {
            const extType = assetInfo.name?.split('.').pop() || 'asset';
            if (/\.(css)$/.test(assetInfo.name || '')) {
              return 'css/[name]-[hash][extname]';
            }
            if (/\.(png|jpe?g|gif|svg|webp|webm|mp3)$/.test(assetInfo.name || '')) {
              return 'media/[name]-[hash][extname]';
            }
            return `${extType}/[name]-[hash][extname]`;
          },
        },
      },
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true,
        },
      },
    },
    optimizeDeps: {
      include: ['react', 'react-dom', '@tanstack/react-query'],
      exclude: ['@vite/client', '@vite/env'],
    },
    define: {
      // Ensure environment variables are available at build time
      'process.env.NODE_ENV': JSON.stringify(mode),
    },
  };
});
