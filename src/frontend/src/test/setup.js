/**
 * @fileoverview Test Setup and Configuration
 * 
 * This file configures the testing environment for ICPHub frontend tests.
 * It sets up:
 * - Global test utilities
 * - Mock implementations
 * - Test environment configuration
 * - Cleanup helpers
 * 
 * @author ICPHub Team
 * @version 1.0.0
 */

import { vi, beforeEach, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// Global test setup
beforeEach(() => {
  // Reset all mocks before each test
  vi.clearAllMocks();
  
  // Setup environment variables for testing
  vi.stubEnv('VITE_DFX_NETWORK', 'local');
  vi.stubEnv('VITE_BACKEND_CANISTER_ID', 'test-backend-canister');
  vi.stubEnv('VITE_CANISTER_ID_INTERNET_IDENTITY', 'test-ii-canister');
  
  // Mock console methods to avoid noise in test output
  vi.spyOn(console, 'log').mockImplementation(() => {});
  vi.spyOn(console, 'warn').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

// Global test cleanup
afterEach(() => {
  // Clean up React Testing Library
  cleanup();
  
  // Clear all timers
  vi.clearAllTimers();
  
  // Restore all mocks
  vi.restoreAllMocks();
  
  // Clear localStorage and sessionStorage
  localStorage.clear();
  sessionStorage.clear();
});

// Mock localStorage and sessionStorage for testing
const createStorageMock = () => {
  const storage = new Map();
  return {
    getItem: vi.fn((key) => storage.get(key) || null),
    setItem: vi.fn((key, value) => storage.set(key, value)),
    removeItem: vi.fn((key) => storage.delete(key)),
    clear: vi.fn(() => storage.clear()),
    get length() {
      return storage.size;
    },
    key: vi.fn((index) => {
      const keys = Array.from(storage.keys());
      return keys[index] || null;
    }),
  };
};

// Define global storage mocks
global.localStorage = createStorageMock();
global.sessionStorage = createStorageMock();

// Mock navigator for storage quota API
Object.defineProperty(global.navigator, 'storage', {
  value: {
    estimate: vi.fn().mockResolvedValue({
      quota: 1000000,
      usage: 50000,
    }),
  },
  writable: true,
});

// Mock window.location for URL-related tests
Object.defineProperty(global.window, 'location', {
  value: {
    href: 'http://localhost:5173',
    origin: 'http://localhost:5173',
    pathname: '/',
    search: '',
    hash: '',
  },
  writable: true,
});

// Mock react-hot-toast to avoid rendering issues in tests
vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
    loading: vi.fn(),
  },
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    loading: vi.fn(),
  },
  Toaster: () => null,
}));

// Mock @dfinity/auth-client
vi.mock('@dfinity/auth-client', () => ({
  AuthClient: {
    create: vi.fn().mockResolvedValue({
      isAuthenticated: vi.fn().mockResolvedValue(false),
      login: vi.fn(),
      logout: vi.fn(),
      getIdentity: vi.fn().mockReturnValue({
        getPrincipal: vi.fn().mockReturnValue({
          toString: vi.fn().mockReturnValue('test-principal'),
        }),
      }),
    }),
  },
}));

// Mock @dfinity/agent
vi.mock('@dfinity/agent', () => ({
  HttpAgent: vi.fn().mockImplementation(() => ({
    fetchRootKey: vi.fn().mockResolvedValue(undefined),
  })),
  Actor: {
    createActor: vi.fn().mockReturnValue({}),
  },
}));

// Test utilities
export const createMockRepository = (overrides = {}) => ({
  id: 'test-repo-id',
  name: 'test-repository',
  description: 'A test repository',
  isPrivate: false,
  tags: ['test'],
  owner: 'test-principal',
  collaborators: [],
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  fileCount: 5,
  size: 1024,
  language: 'JavaScript',
  stars: 0,
  forks: 0,
  ...overrides,
});

export const createMockUser = (overrides = {}) => ({
  principal: 'test-principal',
  identity: {
    getPrincipal: () => ({ toString: () => 'test-principal' }),
  },
  ...overrides,
});

export const createMockError = (message = 'Test error', type = 'UNKNOWN') => {
  const error = new Error(message);
  error.type = type;
  return error;
};

// Async test utilities
export const waitForAsync = () => new Promise(resolve => setTimeout(resolve, 0));

export const waitForCondition = async (condition, timeout = 1000) => {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    if (await condition()) {
      return true;
    }
    await new Promise(resolve => setTimeout(resolve, 10));
  }
  throw new Error('Condition not met within timeout');
};

// Export for use in tests
export { vi };
