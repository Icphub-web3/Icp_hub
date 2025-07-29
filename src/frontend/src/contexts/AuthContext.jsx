import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/auth';
import { getErrorMessage } from '../utils/errors';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);

  // Initialize authentication on app start
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
        console.error('Auth initialization failed:', error);
        setError(getErrorMessage(error));
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

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
      console.error('Login failed:', error);
      setError(getErrorMessage(error));
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      setError(null);

      await authService.logout();

      setUser(null);
      setIsAuthenticated(false);
      return true;
    } catch (error) {
      console.error('Logout failed:', error);
      setError(getErrorMessage(error));
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  const value = {
    isAuthenticated,
    isLoading,
    user,
    error,
    login,
    logout,
    clearError,
    authService,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
