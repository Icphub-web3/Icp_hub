/**
 * @fileoverview Unit Tests for Configuration Module
 * 
 * Tests for the centralized configuration system including:
 * - Environment variable handling
 * - Network configuration
 * - Feature flags
 * - Configuration validation
 * - Utility functions
 * 
 * @author ICPHub Team
 * @version 1.0.0
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { 
  config, 
  getNetworkConfig, 
  getCanisterId, 
  isFeatureEnabled, 
  getHostUrl, 
  getIdentityProviderUrl,
  validateConfig 
} from '../index.js';

describe('Configuration Module', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Configuration', () => {
    it('should have default configuration values', () => {
      expect(config).toBeDefined();
      expect(config.app.name).toBe('ICPHub');
      expect(config.app.version).toBe('1.0.0');
      expect(config.editor.defaultTheme).toBe('vs-dark');
      expect(config.build.timeout).toBe(300000);
    });

    it('should have network configuration', () => {
      expect(config.network).toBeDefined();
      expect(config.network.type).toBeDefined();
      expect(config.network.isLocal).toBeDefined();
      expect(config.network.isProduction).toBeDefined();
    });

    it('should have ICP configuration for both environments', () => {
      expect(config.icp.local).toBeDefined();
      expect(config.icp.production).toBeDefined();
      expect(config.icp.local.host).toBe('http://localhost:4943');
      expect(config.icp.production.host).toBe('https://ic0.app');
    });
  });

  describe('Network Configuration', () => {
    it('should return local config when network is local', () => {
      vi.stubEnv('VITE_DFX_NETWORK', 'local');
      const networkConfig = getNetworkConfig();
      
      expect(networkConfig.host).toBe('http://localhost:4943');
      expect(networkConfig.identityProvider).toContain('localhost:4943');
    });

    it('should return production config when network is ic', () => {
      vi.stubEnv('VITE_DFX_NETWORK', 'ic');
      const networkConfig = getNetworkConfig();
      
      expect(networkConfig.host).toBe('https://ic0.app');
      expect(networkConfig.identityProvider).toBe('https://identity.ic0.app');
    });
  });

  describe('Canister ID Management', () => {
    it('should return correct canister ID for backend', () => {
      const canisterId = getCanisterId('backend');
      expect(canisterId).toBeDefined();
      expect(typeof canisterId).toBe('string');
    });

    it('should return correct canister ID for internet identity', () => {
      const canisterId = getCanisterId('internetIdentity');
      expect(canisterId).toBeDefined();
      expect(typeof canisterId).toBe('string');
    });

    it('should return undefined for non-existent canister', () => {
      const canisterId = getCanisterId('nonExistent');
      expect(canisterId).toBeUndefined();
    });
  });

  describe('Feature Flags', () => {
    it('should return true for enabled features', () => {
      expect(isFeatureEnabled('realTimeCollaboration')).toBe(true);
      expect(isFeatureEnabled('codeComments')).toBe(true);
      expect(isFeatureEnabled('buildSystem')).toBe(true);
    });

    it('should return false for disabled features', () => {
      expect(isFeatureEnabled('nonExistentFeature')).toBe(false);
    });

    it('should handle feature flag edge cases', () => {
      expect(isFeatureEnabled('')).toBe(false);
      expect(isFeatureEnabled(null)).toBe(false);
      expect(isFeatureEnabled(undefined)).toBe(false);
    });
  });

  describe('URL Utilities', () => {
    it('should return correct host URL for local environment', () => {
      vi.stubEnv('VITE_DFX_NETWORK', 'local');
      const hostUrl = getHostUrl();
      expect(hostUrl).toBe('http://localhost:4943');
    });

    it('should return correct host URL for production environment', () => {
      vi.stubEnv('VITE_DFX_NETWORK', 'ic');
      const hostUrl = getHostUrl();
      expect(hostUrl).toBe('https://ic0.app');
    });

    it('should return correct identity provider URL for local environment', () => {
      vi.stubEnv('VITE_DFX_NETWORK', 'local');
      const identityUrl = getIdentityProviderUrl();
      expect(identityUrl).toContain('localhost:4943');
    });

    it('should return correct identity provider URL for production environment', () => {
      vi.stubEnv('VITE_DFX_NETWORK', 'ic');
      const identityUrl = getIdentityProviderUrl();
      expect(identityUrl).toBe('https://identity.ic0.app');
    });
  });

  describe('Configuration Validation', () => {
    it('should validate successfully with all required config', () => {
      vi.stubEnv('VITE_DFX_NETWORK', 'local');
      vi.stubEnv('VITE_BACKEND_CANISTER_ID', 'test-backend');
      vi.stubEnv('VITE_CANISTER_ID_INTERNET_IDENTITY', 'test-ii');
      
      expect(() => validateConfig()).not.toThrow();
    });

    it('should throw error for missing required configuration', () => {
      // Clear environment variables
      vi.stubEnv('VITE_DFX_NETWORK', '');
      vi.stubEnv('VITE_BACKEND_CANISTER_ID', '');
      
      expect(() => validateConfig()).toThrow('Missing required configuration');
    });

    it('should validate specific configuration paths', () => {
      vi.stubEnv('VITE_DFX_NETWORK', 'local');
      vi.stubEnv('VITE_BACKEND_CANISTER_ID', '');
      vi.stubEnv('VITE_CANISTER_ID_INTERNET_IDENTITY', 'test-ii');
      
      expect(() => validateConfig()).toThrow('canisters.backend');
    });
  });

  describe('Configuration Structure', () => {
    it('should have authentication settings', () => {
      expect(config.auth).toBeDefined();
      expect(config.auth.maxTimeToLive).toBeDefined();
      expect(config.auth.inactivityTimeout).toBeDefined();
      expect(typeof config.auth.maxTimeToLive).toBe('bigint');
      expect(typeof config.auth.inactivityTimeout).toBe('number');
    });

    it('should have editor configuration', () => {
      expect(config.editor).toBeDefined();
      expect(config.editor.defaultTheme).toBe('vs-dark');
      expect(config.editor.defaultLanguage).toBe('javascript');
      expect(config.editor.defaultFontSize).toBe(14);
      expect(config.editor.autoSave).toBe(true);
    });

    it('should have build system configuration', () => {
      expect(config.build).toBeDefined();
      expect(config.build.timeout).toBe(300000);
      expect(config.build.maxConcurrentBuilds).toBe(3);
      expect(Array.isArray(config.build.supportedLanguages)).toBe(true);
      expect(config.build.supportedLanguages).toContain('javascript');
      expect(config.build.supportedLanguages).toContain('motoko');
    });

    it('should have collaboration settings', () => {
      expect(config.collaboration).toBeDefined();
      expect(config.collaboration.maxActiveUsers).toBe(10);
      expect(config.collaboration.notificationTimeout).toBe(5000);
      expect(config.collaboration.autoSyncInterval).toBe(2000);
    });

    it('should have UI configuration', () => {
      expect(config.ui).toBeDefined();
      expect(config.ui.toastDuration).toBe(4000);
      expect(config.ui.animationDuration).toBe(300);
      expect(config.ui.sidebarWidth).toBe(256);
      expect(config.ui.headerHeight).toBe(64);
    });

    it('should have storage configuration', () => {
      expect(config.storage).toBeDefined();
      expect(config.storage.localStoragePrefix).toBe('icphub_');
      expect(config.storage.sessionStoragePrefix).toBe('icphub_session_');
      expect(config.storage.cacheTimeout).toBe(24 * 60 * 60 * 1000);
    });
  });

  describe('Environment Variable Handling', () => {
    it('should use environment variables when available', () => {
      vi.stubEnv('VITE_DFX_NETWORK', 'production');
      vi.stubEnv('VITE_BACKEND_CANISTER_ID', 'custom-backend-id');
      
      // Re-import to get fresh config with new env vars
      const { config: freshConfig } = await import('../index.js');
      
      expect(freshConfig.network.type).toBe('production');
      expect(freshConfig.canisters.backend).toBe('custom-backend-id');
    });

    it('should fall back to defaults when environment variables are missing', () => {
      vi.stubEnv('VITE_DFX_NETWORK', '');
      vi.stubEnv('VITE_BACKEND_CANISTER_ID', '');
      
      const { config: freshConfig } = await import('../index.js');
      
      expect(freshConfig.network.type).toBe('local'); // Default value
      expect(freshConfig.canisters.backend).toBe('rrkah-fqaaa-aaaaa-aaaaq-cai'); // Default value
    });
  });

  describe('Type Safety', () => {
    it('should have correct types for numeric values', () => {
      expect(typeof config.auth.inactivityTimeout).toBe('number');
      expect(typeof config.editor.defaultFontSize).toBe('number');
      expect(typeof config.build.timeout).toBe('number');
      expect(typeof config.build.maxConcurrentBuilds).toBe('number');
    });

    it('should have correct types for boolean values', () => {
      expect(typeof config.network.isLocal).toBe('boolean');
      expect(typeof config.network.isProduction).toBe('boolean');
      expect(typeof config.editor.autoSave).toBe('boolean');
    });

    it('should have correct types for arrays', () => {
      expect(Array.isArray(config.build.supportedLanguages)).toBe(true);
      expect(config.build.supportedLanguages.length).toBeGreaterThan(0);
    });

    it('should have correct types for objects', () => {
      expect(typeof config.features).toBe('object');
      expect(typeof config.icp).toBe('object');
      expect(typeof config.canisters).toBe('object');
    });
  });
});
