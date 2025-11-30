import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Cấu hình Vite cho React application
// https://vitejs.dev/config/
export default defineConfig({
  // Plugin React cho Vite
  plugins: [react()],

  // Cấu hình server development
  server: {
    port: 3000, // Port để chạy dev server
    host: true, // Cho phép truy cập từ bên ngoài (0.0.0.0)
    strictPort: true, // Fail nếu port đã được sử dụng

    // Cấu hình proxy để forward API requests đến backend
    // Khi frontend gọi /api/*, Vite sẽ forward đến http://localhost:8080/api/*
    proxy: {
      '/api': {
        target: 'http://localhost:8080', // URL của backend
        changeOrigin: true, // Thay đổi origin của request
        secure: false, // Không verify SSL certificate
      },
      '/uploads': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
    },
  },

  // Cấu hình build optimization
  build: {
    // Minify code for smaller bundle size
    // Using esbuild (default, faster than terser)
    minify: 'esbuild',
    // Tối ưu chunk size
    chunkSizeWarningLimit: 600,
    // Source maps cho production (optional, có thể tắt để nhỏ hơn)
    sourcemap: false,
    rollupOptions: {
      output: {
        // Better file naming với hash cho caching
        chunkFileNames: 'js/[name]-[hash].js',
        entryFileNames: 'js/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',

        manualChunks: (id) => {
          // Web Workers - separate chunk
          if (id.includes('/workers/') && id.endsWith('.worker.ts')) {
            return 'workers/[name]';
          }

          // Tách node_modules thành các chunks riêng
          if (id.includes('node_modules')) {
            // React và React DOM
            if (
              id.includes('react') ||
              id.includes('react-dom') ||
              id.includes('scheduler')
            ) {
              return 'react-vendor';
            }

            // React Router
            if (id.includes('react-router')) {
              return 'router-vendor';
            }

            // UI Libraries
            if (id.includes('lucide-react') || id.includes('@radix-ui')) {
              return 'ui-vendor';
            }

            // Utilities (axios, date-fns, etc.)
            if (
              id.includes('axios') ||
              id.includes('date-fns') ||
              id.includes('sonner')
            ) {
              return 'utils-vendor';
            }

            // Maps (nếu có)
            if (id.includes('leaflet') || id.includes('react-leaflet')) {
              return 'maps-vendor';
            }

            // Các vendor libraries khác
            return 'vendor';
          }
        },
      },
    },
  },

  // Worker configuration
  worker: {
    format: 'es',
  },
});
