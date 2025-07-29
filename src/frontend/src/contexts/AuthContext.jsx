/**
 * @fileoverview Authentication Context for ICPHub - Manages user authentication state
 * 
 * This context handles all aspects of user authentication using Internet Identity:
 * - Initialization of the AuthClient
 * - User login and logout
 * - Storing user identity and principal
 * - Providing authentication state to the entire application
 * - Managing loading and error states during authentication
 * 
 * @author ICPHub Team
 * @version 1.0.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/auth';
import { getErrorMessage } from '../utils/errors';

// Create a new context for authentication
const AuthContext = createContext({});

/**
 * Custom hook to use the authentication context
 * 
 * Provides easy access to authentication state and methods.
 * Throws an error if used outside of an AuthProvider.
 * 
 * @returns {object} The authentication context value
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

/**
 * AuthProvider Component - Provides authentication context to the application
 * 
 * Wraps the application to provide authentication state and methods to all components.
 * Handles initialization, login, logout, and error management.
 * 
 * @param {object} props - The component props
 * @param {React.ReactNode} props.children - The child components to render
 * @returns {JSX.Element} The AuthProvider component
 */
export const AuthProvider = ({ children }) => {
  // State for authentication status, loading, user data, and errors
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);

  /**
   * Initialize authentication when the application starts
   *
   * Checks if the user is already authenticated with Internet Identity and sets
   * the user state accordingly. Handles any initialization errors.
   */
  useEffect(() => {
    const initAuth = async () => {
      try {
        setIsLoading(true);
        const authenticated = await authService.init();

        if (authenticated) {
          const principal = authService.getPrincipal();
          setUser({
            principal: principal?.toString(),
            identity: authService.getIdentity(),
          });
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.log(error); // Log full error object for UserInterrupt debugging
        console.error('Auth initialization failed:', error);
        setError(getErrorMessage(error));
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  /**
   * Handles the user login process
   *
   * Initiates the Internet Identity login flow and updates the user state on success.
   * Catches and handles any login errors.
   * 
   * @returns {Promise<object>} A promise that resolves with the login result
   */
  const login = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await authService.login();

      if (result.success) {
        setUser({
          principal: result.principal,
          identity: result.identity,
        });
        setIsAuthenticated(true);
        return result;
      }
    } catch (error) {
      console.log(error); // Log full error object for UserInterrupt debugging
      console.error('Login failed:', error);
      setError(getErrorMessage(error));
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handles the user logout process
   *
   * Logs the user out of Internet Identity and clears the user state.
   * 
   * @returns {Promise<boolean>} A promise that resolves to true on successful logout
   */
  const logout = async () => {
    try {
      setIsLoading(true);
      setError(null);

      await authService.logout();

      setUser(null);
      setIsAuthenticated(false);
      return true;
    } catch (error) {
      console.log(error); // Log full error object for UserInterrupt debugging
      console.error('Logout failed:', error);
      setError(getErrorMessage(error));
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Clears the current authentication error
   */
  const clearError = () => {
    setError(null);
  };

  // Value provided by the context
  const value = {
    isAuthenticated,  // Is the user authenticated?
    isLoading,        // Is an auth operation in progress?
    user,             // User object with principal and identity
    error,            // Current authentication error
    login,            // Login function
    logout,           // Logout function
    clearError,       // Function to clear errors
    authService,      // Direct access to the authService instance
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
