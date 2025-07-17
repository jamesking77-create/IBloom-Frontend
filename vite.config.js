import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import basicSsl from '@vitejs/plugin-basic-ssl'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    basicSsl()
  ],
  
  server: {
    https: false,
    host: '0.0.0.0', 
    port: 3000,
  }, 
  
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
    alias: {
      '@': '/src'
    }
  },
  
  build: {
    rollupOptions: {
      external: []
    }
  }
})