/**
 * @fileoverview Authentication Service for ICPHub - Internet Identity Integration
 * 
 * This service provides authentication functionality using Internet Identity:
 * - Initializes and manages the AuthClient
 * - Handles login/logout with Internet Identity
 * - Creates authenticated agents for canister calls
 * - Manages user identity and principal
 * 
 * @author ICPHub Team
 * @version 1.0.0
 */

import { AuthClient } from '@dfinity/auth-client';
import { Actor, HttpAgent } from '@dfinity/agent';
import { getHostUrl, getIdentityProviderUrl, config } from '../config/index.js';
import { handleError, withErrorHandling } from '../utils/errorHandler.js';

/**
 * AuthService Class - Manages Internet Identity authentication
 * 
 * This service acts as a singleton to handle all authentication-related operations
 * in the ICPHub application. It provides methods for login, logout, and creating
 * authenticated agents for communication with ICP canisters.
 */
class AuthService {
  /**
   * Initialize the AuthService instance
   * 
   * Sets up the initial state with null values for the authentication client,
   * identity, and principal.
   */
  constructor() {
    this.authClient = null;      // The @dfinity/auth-client instance
    this.identity = null;        // The user's cryptographic identity
    this.principal = null;       // The user's unique principal ID
    this.isAuthenticated = false; // Current authentication status
  }

  /**
   * Initialize the authentication client
   * 
   * Creates an AuthClient instance and checks if the user is already authenticated.
   * If authenticated, retrieves the user's identity and principal.
   * 
   * @returns {Promise<boolean>} True if the user is authenticated, false otherwise
   */
  async init() {
    try {
      // Create the AuthClient instance
      this.authClient = await AuthClient.create();
      
      // Check if user is already authenticated (e.g., from a previous session)
      this.isAuthenticated = await this.authClient.isAuthenticated();

      if (this.isAuthenticated) {
        // Get the user's identity and principal if authenticated
        this.identity = this.authClient.getIdentity();
        this.principal = this.identity.getPrincipal();
      }

      return this.isAuthenticated;
    } catch (error) {
      console.log(error); // Log full error object for UserInterrupt debugging
      console.error('Failed to initialize auth client:', error);
      return false;
    }
  }

  /**
   * Initiate the Internet Identity login process
   * 
   * Opens the Internet Identity authentication window and handles the login flow.
   * Uses the appropriate identity provider based on the environment (local vs production).
   * 
   * @returns {Promise<object>} A promise that resolves with login result
   */
  async login() {
    try {
      // Ensure AuthClient is initialized
      if (!this.authClient) {
        await this.init();
      }

      return new Promise((resolve, reject) => {
        this.authClient.login({
          // Use configuration-based identity provider
          identityProvider: getIdentityProviderUrl(),
          // Session duration from configuration
          maxTimeToLive: config.auth.maxTimeToLive,
          
          // Handle successful authentication
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
          
          // Handle authentication errors
          onError: error => {
            console.log(error); // Log full error object for UserInterrupt debugging
            console.error('Login failed:', error);
            reject(error);
          },
        });
      });
    } catch (error) {
      console.log(error); // Log full error object for UserInterrupt debugging
      console.error('Login error:', error);
      throw error;
    }
  }

  /**
   * Log the user out of Internet Identity
   * 
   * Clears the authentication session and resets all authentication state.
   * 
   * @returns {Promise<boolean>} True if logout was successful
   */
  async logout() {
    try {
      if (!this.authClient) {
        return;
      }

      // Log out from Internet Identity
      await this.authClient.logout();
      
      // Clear all authentication state
      this.isAuthenticated = false;
      this.identity = null;
      this.principal = null;

      console.log('Logged out successfully');
      return true;
    } catch (error) {
      console.log(error); // Log full error object for UserInterrupt debugging
      console.error('Logout error:', error);
      throw error;
    }
  }

  /**
   * Get the user's principal ID
   * 
   * @returns {Principal|null} The user's principal or null if not authenticated
   */
  getPrincipal() {
    return this.principal;
  }

  /**
   * Get the user's identity object
   * 
   * @returns {Identity|null} The user's identity or null if not authenticated
   */
  getIdentity() {
    return this.identity;
  }

  /**
   * Check if the user is currently authenticated
   * 
   * @returns {boolean} True if authenticated, false otherwise
   */
  isLoggedIn() {
    return this.isAuthenticated;
  }

  /**
   * Create an authenticated HTTP agent for making calls to ICP canisters
   * 
   * Creates an HttpAgent with the user's identity for authenticated requests.
   * Automatically configures for local development or production environment.
   * 
   * @returns {HttpAgent} An authenticated HTTP agent
   * @throws {Error} If the user is not authenticated
   */
  createAgent() {
    if (!this.identity) {
      throw new Error('User not authenticated');
    }

    const agent = new HttpAgent({
      identity: this.identity,
      host: getHostUrl(), // Use configuration-based host
    });

    // Fetch root key for local development (required for local replica)
    if (config.network.isLocal) {
      agent.fetchRootKey().catch((error) => {
        handleError(error, { context: 'fetchRootKey', service: 'auth' });
      });
    }

    return agent;
  }

  /**
   * Create an authenticated actor for interacting with a specific canister
   * 
   * Creates an Actor instance that can call methods on the specified canister
   * using the user's authenticated identity.
   * 
   * @param {string} canisterId - The ID of the target canister
   * @param {object} idlFactory - The Candid interface definition for the canister
   * @returns {ActorSubclass} An actor for the specified canister
   * @throws {Error} If the user is not authenticated
   */
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
