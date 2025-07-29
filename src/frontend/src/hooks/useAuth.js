import { useState, useEffect, useCallback } from 'react';
import { AuthClient } from '@dfinity/auth-client';
import { useRepoStore, useFileStore, useBuildStore, useCollabStore } from '../store';
import toast from 'react-hot-toast';

export const useAuth = () => {
  const [authClient, setAuthClient] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [identity, setIdentity] = useState(null);
  const [principal, setPrincipal] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const initAuth = useCallback(async () => {
    try {
      const client = await AuthClient.create({
        idleOptions: {
          idleTimeout: 1000 * 60 * 30, // 30 minutes
          disableDefaultIdleCallback: true
        }
      });
      
      setAuthClient(client);
      
      const isAuth = await client.isAuthenticated();
      setIsAuthenticated(isAuth);
      
      if (isAuth) {
        const identity = client.getIdentity();
        const principal = identity.getPrincipal();
        setIdentity(identity);
        setPrincipal(principal);
      }
    } catch (error) {
      console.error('Auth initialization failed:', error);
      toast.error('Authentication initialization failed');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async () => {
    if (!authClient) return;
    
    setIsLoading(true);
    try {
      const identityProvider = process.env.DFX_NETWORK === 'local'
        ? `http://localhost:4943/?canisterId=${process.env.CANISTER_ID_INTERNET_IDENTITY}`
        : 'https://identity.ic0.app';

      await new Promise((resolve, reject) => {
        authClient.login({
          identityProvider,
          maxTimeToLive: BigInt(7 * 24 * 60 * 60 * 1000 * 1000 * 1000), // 7 days
          onSuccess: resolve,
          onError: reject,
        });
      });

      const identity = authClient.getIdentity();
      const principal = identity.getPrincipal();
      
      setIdentity(identity);
      setPrincipal(principal);
      setIsAuthenticated(true);
      
      toast.success('Successfully logged in!');
    } catch (error) {
      console.error('Login failed:', error);
      toast.error('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [authClient]);

  const logout = useCallback(async () => {
    if (!authClient) return;
    
    try {
      await authClient.logout();
      setIsAuthenticated(false);
      setIdentity(null);
      setPrincipal(null);
      
      // Clear all stores
      useRepoStore.getState().setRepositories([]);
      useRepoStore.getState().setCurrentRepo(null);
      useFileStore.getState().setFiles({});
      useFileStore.getState().openFiles = [];
      useFileStore.getState().setActiveFile(null);
      useBuildStore.getState().setBuilds([]);
      useBuildStore.getState().setTests([]);
      useCollabStore.getState().setActiveUsers([]);
      useCollabStore.getState().setComments([]);
      
      toast.success('Successfully logged out!');
    } catch (error) {
      console.error('Logout failed:', error);
      toast.error('Logout failed');
    }
  }, [authClient]);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  return {
    authClient,
    isAuthenticated,
    identity,
    principal,
    isLoading,
    login,
    logout
  };
};
