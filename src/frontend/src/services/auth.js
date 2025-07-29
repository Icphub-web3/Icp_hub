import { AuthClient } from '@dfinity/auth-client';
import { Actor, HttpAgent } from '@dfinity/agent';

class AuthService {
  constructor() {
    this.authClient = null;
    this.identity = null;
    this.principal = null;
    this.isAuthenticated = false;
  }

  async init() {
    try {
      this.authClient = await AuthClient.create();
      this.isAuthenticated = await this.authClient.isAuthenticated();

      if (this.isAuthenticated) {
        this.identity = this.authClient.getIdentity();
        this.principal = this.identity.getPrincipal();
      }

      return this.isAuthenticated;
    } catch (error) {
      console.error('Failed to initialize auth client:', error);
      return false;
    }
  }

  async login() {
    try {
      if (!this.authClient) {
        await this.init();
      }

      return new Promise((resolve, reject) => {
        this.authClient.login({
          identityProvider:
            import.meta.env.VITE_DFX_NETWORK === 'local'
              ? `http://${import.meta.env.VITE_CANISTER_ID_INTERNET_IDENTITY}.localhost:4943`
              : 'https://identity.ic0.app',
          maxTimeToLive: BigInt(7 * 24 * 60 * 60 * 1000 * 1000 * 1000), // 7 days
          onSuccess: async () => {
            this.isAuthenticated = true;
            this.identity = this.authClient.getIdentity();
            this.principal = this.identity.getPrincipal();

            console.log('Login successful:', this.principal.toString());
            resolve({
              success: true,
              principal: this.principal.toString(),
              identity: this.identity,
            });
          },
          onError: error => {
            console.error('Login failed:', error);
            reject(error);
          },
        });
      });
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async logout() {
    try {
      if (!this.authClient) {
        return;
      }

      await this.authClient.logout();
      this.isAuthenticated = false;
      this.identity = null;
      this.principal = null;

      console.log('Logged out successfully');
      return true;
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }

  getPrincipal() {
    return this.principal;
  }

  getIdentity() {
    return this.identity;
  }

  isLoggedIn() {
    return this.isAuthenticated;
  }

  // Create an authenticated agent for making calls to backend canisters
  createAgent() {
    if (!this.identity) {
      throw new Error('User not authenticated');
    }

    const agent = new HttpAgent({
      identity: this.identity,
      host:
        import.meta.env.VITE_DFX_NETWORK === 'local'
          ? 'http://localhost:4943'
          : 'https://ic0.app',
    });

    // Fetch root key for local development
    if (import.meta.env.VITE_DFX_NETWORK === 'local') {
      agent.fetchRootKey().catch(console.error);
    }

    return agent;
  }

  // Create an actor for interacting with backend canister
  createActor(canisterId, idlFactory) {
    if (!this.identity) {
      throw new Error('User not authenticated');
    }

    const agent = this.createAgent();

    return Actor.createActor(idlFactory, {
      agent,
      canisterId,
    });
  }
}

// Export a singleton instance
export const authService = new AuthService();
export default authService;
