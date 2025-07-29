import { beforeEach, describe, expect, it, vi } from 'vitest';
import { initAgentTest } from '../utils/testHelpers.js';
import { authService } from '../services/auth.js';

// Mock data and utilities
let mockAgent, mockActor;
beforeEach(() => {
  mockAgent = initAgentTest();
  vi.clearAllMocks();
});

describe('Authentication Service', () => {
  it('should initialize AuthClient and set identity if authenticated', async () => {
    // Given
    const authClientMock = vi.fn(() => ({
      isAuthenticated: vi.fn(() => Promise.resolve(true)),
      getIdentity: vi.fn(() => ({
        getPrincipal: vi.fn(() => ({ toString: () => 'mockPrincipal' }))
      }))
    }));

    // Mock AuthClient.create to return our mocked instance
    vi.mocked(authService.AuthClient.create).mockResolvedValue(authClientMock());

    // When
    const isAuthenticated = await authService.init();

    // Then
    expect(isAuthenticated).toBe(true);
    expect(authService.identity).not.toBeNull();
    expect(authService.identity.getPrincipal().toString()).toBe('mockPrincipal');
  });

  it('should handle login errors gracefully', async () => {
    // Given
    const loginMock = vi.fn(() => Promise.reject(new Error('Login Failed')));
    vi.mocked(authService.AuthClient.create).mockResolvedValue({ login: loginMock });

    // When
    const loginResult = await authService.login().catch(e => e);

    // Then
    expect(loginResult.message).toBe('Login Failed');
    expect(loginMock).toHaveBeenCalled();
  });

  it('should create an authenticated agent with correct host', async () => {
    // Given
    const expectedHost = 'http://localhost:4943';

    // When
    const agent = authService.createAgent();

    // Then
    expect(agent).toBeInstanceOf(mockAgent);
    expect(mockAgent).toHaveBeenCalledWith({
      identity: authService.identity,
      host: expectedHost
    });
  });
});
