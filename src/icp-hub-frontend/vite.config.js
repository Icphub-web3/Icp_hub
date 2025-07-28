import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    'process.env.VITE_DFX_NETWORK': JSON.stringify(process.env.DFX_NETWORK || 'local'),
    'process.env.VITE_BACKEND_CANISTER_ID': JSON.stringify(process.env.CANISTER_ID_ICP_HUB_BACKEND || 'rdmx6-jaaaa-aaaaa-aaadq-cai'),
    'process.env.VITE_INTERNET_IDENTITY_CANISTER_ID': JSON.stringify(process.env.CANISTER_ID_INTERNET_IDENTITY || 'rwlgt-iiaaa-aaaaa-aaaaa-cai'),
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:4943',
        changeOrigin: true,
      },
    },
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: 'globalThis',
      },
    },
  },
})
