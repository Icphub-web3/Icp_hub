/**
 * @fileoverview Application Configuration Module
 * 
 * This module handles all application configuration including:
 * - Environment variables management
 * - Network configuration (local vs production)
 * - API endpoints and canister IDs
 * - Feature flags and settings
 * - Default application constants
 * 
 * @author ICPHub Team
 * @version 1.0.0
 */

/**
 * Environment Configuration
 * 
 * Centralized configuration based on environment variables.
 * Provides defaults and validation for all configuration values.
 */
export const config = {
  // Network Configuration
  network: {
    type: import.meta.env.VITE_DFX_NETWORK || 'local',
    isLocal: import.meta.env.VITE_DFX_NETWORK === 'local',
    isProduction: import.meta.env.VITE_DFX_NETWORK === 'ic',
  },

  // ICP Configuration
  icp: {
    // Local development settings
    local: {
      host: 'http://localhost:4943',
      identityProvider: `http://${import.meta.env.VITE_CANISTER_ID_INTERNET_IDENTITY || 'rdmx6-jaaaa-aaaaa-aaadq-cai'}.localhost:4943`,
    },
    // Production settings
    production: {
      host: 'https://ic0.app',
      identityProvider: 'https://identity.ic0.app',
    }
  },

  // Canister IDs
  canisters: {
    backend: import.meta.env.VITE_BACKEND_CANISTER_ID || 'rrkah-fqaaa-aaaaa-aaaaq-cai',
    internetIdentity: import.meta.env.VITE_CANISTER_ID_INTERNET_IDENTITY || 'rdmx6-jaaaa-aaaaa-aaadq-cai',
  },

  // Authentication Settings
  auth: {
    // Session duration in nanoseconds (7 days)
    maxTimeToLive: BigInt(7 * 24 * 60 * 60 * 1000 * 1000 * 1000),
    // Auto-logout after inactivity (30 minutes)
    inactivityTimeout: 30 * 60 * 1000,
  },

  // Application Settings
  app: {
    name: 'ICPHub',
    version: '1.0.0',
    description: 'Collaborative Web3 Development Platform',
    supportEmail: 'support@icphub.dev',
    documentationUrl: 'https://docs.icphub.dev',
  },

  // Editor Configuration
  editor: {
    defaultTheme: 'vs-dark',
    defaultLanguage: 'javascript',
    defaultFontSize: 14,
    autoSave: true,
    autoSaveDelay: 1000, // milliseconds
    tabSize: 2,
    wordWrap: 'on',
  },

  // Build System Configuration
  build: {
    timeout: 300000, // 5 minutes in milliseconds
    maxConcurrentBuilds: 3,
    supportedLanguages: [
      'javascript',
      'typescript',
      'rust',
      'motoko',
      'python',
      'go',
      'solidity'
    ],
  },

  // Collaboration Settings
  collaboration: {
    maxActiveUsers: 10,
    notificationTimeout: 5000, // milliseconds
    autoSyncInterval: 2000, // milliseconds
  },

  // Feature Flags
  features: {
    realTimeCollaboration: true,
    codeComments: true,
    buildSystem: true,
    analytics: true,
    notifications: true,
    darkMode: true,
    multiLanguageSupport: true,
  },

  // UI Configuration
  ui: {
    toastDuration: 4000,
    animationDuration: 300,
    debounceDelay: 300,
    sidebarWidth: 256,
    headerHeight: 64,
  },

  // Storage Configuration
  storage: {
    localStoragePrefix: 'icphub_',
    sessionStoragePrefix: 'icphub_session_',
    cacheTimeout: 24 * 60 * 60 * 1000, // 24 hours
  },
};

/**
 * Get the current network configuration
 * 
 * @returns {object} Network configuration object
 */
export const getNetworkConfig = () => {
  return config.network.isLocal ? config.icp.local : config.icp.production;
};

/**
 * Get canister ID for a specific canister
 * 
 * @param {string} canisterName - Name of the canister (backend, internetIdentity)
 * @returns {string} Canister ID
 */
export const getCanisterId = (canisterName) => {
  return config.canisters[canisterName];
};

/**
 * Check if a feature is enabled
 * 
 * @param {string} featureName - Name of the feature
 * @returns {boolean} Whether the feature is enabled
 */
export const isFeatureEnabled = (featureName) => {
  return config.features[featureName] || false;
};

/**
 * Get environment-specific host URL
 * 
 * @returns {string} Host URL for the current environment
 */
export const getHostUrl = () => {
  const networkConfig = getNetworkConfig();
  return networkConfig.host;
};

/**
 * Get environment-specific identity provider URL
 * 
 * @returns {string} Identity provider URL for the current environment
 */
export const getIdentityProviderUrl = () => {
  const networkConfig = getNetworkConfig();
  return networkConfig.identityProvider;
};

/**
 * Validate configuration on app startup
 * 
 * @throws {Error} If required configuration is missing
 */
export const validateConfig = () => {
  const required = [
    'network.type',
    'canisters.backend',
    'canisters.internetIdentity',
  ];

  for (const path of required) {
    const value = path.split('.').reduce((obj, key) => obj?.[key], config);
    if (!value) {
      throw new Error(`Missing required configuration: ${path}`);
    }
  }

  console.log('✅ Configuration validated successfully');
};

// Export default configuration
export default config;
