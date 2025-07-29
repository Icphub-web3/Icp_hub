import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Function to get canister IDs from dfx.json
function getCanisterIds() {
  try {
    // Path to dfx.json relative to the frontend directory
    const configPath = join(__dirname, '..', '..', 'dfx.json');
    const dfxConfig = JSON.parse(readFileSync(configPath, 'utf8'));
    const canisterIds = {};

    // List all backend canister names that the frontend might interact with
    const allCanisterNames = [
      'auth',
      'backend',
      'chain_fusion',
      'ipfs',
      'storage',
      'Icp_hub_backend',
    ];

    allCanisterNames.forEach(name => {
      // Try to get local canister ID from dfx.json. If not found, check process.env (e.g., for deploy)
      const canister = dfxConfig.canisters[name];
      if (canister) {
        if (canister.local && canister.local.canister_id) {
          canisterIds[name.toUpperCase()] = canister.local.canister_id;
        } else if (process.env.CANISTER_ID_MAP) {
          const canisterIdMap = JSON.parse(process.env.CANISTER_ID_MAP);
          if (canisterIdMap[name]) {
            canisterIds[name.toUpperCase()] = canisterIdMap[name];
          }
        }
      }
    });
    return canisterIds;
  } catch (e) {
    console.error('Error reading dfx.json for canister IDs:', e);
    return {};
  }
}

// Load canister IDs
const canisterEnv = getCanisterIds();

// Map them to VITE_APP_ format for React apps
const defineEnv = {};
for (const key in canisterEnv) {
  defineEnv[`process.env.VITE_APP_${key}_CANISTER_ID`] = JSON.stringify(
    canisterEnv[key]
  );
}

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist', // CRITICAL: This must match the dfx.json's frontend source path (src/frontend/dist)
    emptyOutDir: true,
  },
  server: {
    host: '127.0.0.1',
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000', // Default DFX local replica port
        changeOrigin: true,
        rewrite: path => path.replace(/^\/api/, '/api'),
      },
    },
  },
  define: {
    global: {}, // For some libraries that might expect 'global'
    ...defineEnv, // Inject canister IDs as environment variables
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: 'globalThis',
      },
    },
  },
});
