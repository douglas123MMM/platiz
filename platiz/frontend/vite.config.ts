import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(process.env.VITE_SUPABASE_URL || 'https://vhgxevfrgnzbebffejnz.supabase.co'),
    'import.meta.env.VITE_SUPABASE_SERVICE_KEY': JSON.stringify(process.env.VITE_SUPABASE_SERVICE_KEY || ''),
  },
  server: {
    port: 5173,
    proxy: {
      '/api': { target: 'http://localhost:4000', changeOrigin: true },
      '/uploads': { target: 'http://localhost:4000', changeOrigin: true },
    },
  },
});
