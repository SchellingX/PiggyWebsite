import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load environment variables based on the mode (development/production)
  // The third argument '' loads all env vars regardless of prefix (e.g. VITE_)
  // Using (process as any).cwd() to avoid TS error about missing property on Process type
  const env = loadEnv(mode, (process as any).cwd(), '');

  return {
    server: {
      proxy: {
        '/api': 'http://localhost:8080',
        '/uploads': 'http://localhost:8080'
      }
    },
    plugins: [react()],
    define: {
      // Polyfill process.env.API_KEY for the frontend code
      // This allows 'process.env.API_KEY' usage in browser-side code
      'process.env.API_KEY': JSON.stringify(env.API_KEY)
    }
  };
});