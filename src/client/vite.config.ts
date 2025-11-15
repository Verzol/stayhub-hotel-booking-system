import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Cấu hình Vite cho React application
// https://vitejs.dev/config/
export default defineConfig({
  // Plugin React cho Vite
  plugins: [react()],
  
  // Cấu hình server development
  server: {
    port: 3000,              // Port để chạy dev server
    host: true,              // Cho phép truy cập từ bên ngoài (0.0.0.0)
    strictPort: true,        // Fail nếu port đã được sử dụng
    
    // Cấu hình proxy để forward API requests đến backend
    // Khi frontend gọi /api/*, Vite sẽ forward đến http://localhost:8080/api/*
    proxy: {
      '/api': {
        target: 'http://localhost:8080',  // URL của backend
        changeOrigin: true,               // Thay đổi origin của request
        secure: false,                    // Không verify SSL certificate
      }
    }
  },
})