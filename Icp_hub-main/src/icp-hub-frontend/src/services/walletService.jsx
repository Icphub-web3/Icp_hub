import { createContext, useContext, useState, useEffect } from 'react'
import apiService from './api'

// Wallet Context
const WalletContext = createContext()

// Custom hook to use wallet context
export const useWallet = () => {
  const context = useContext(WalletContext)
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider')
  }
  return context
}

// Authentication types
export const AUTH_TYPES = {
  INTERNET_IDENTITY: 'internet_identity',
}

// Wallet Provider Component  
export const WalletProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  const [principal, setPrincipal] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    initializeAuth()
  }, [])

  const initializeAuth = async () => {
    try {
      setLoading(false)
      const initialized = await apiService.init()
      
      if (initialized && apiService.isAuthenticated) {
        const user = await apiService.getCurrentUser()
        const userPrincipal = apiService.getPrincipal()
        
        setIsConnected(true)
        setCurrentUser(user)
        setPrincipal(userPrincipal?.toString())
      }
    } catch (error) {
      console.error('Auth initialization failed:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const connectInternetIdentity = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const success = await apiService.login()
      
      if (success) {
        const user = await apiService.getCurrentUser()
        const userPrincipal = apiService.getPrincipal()
        
        setIsConnected(true)
        setCurrentUser(user)
        setPrincipal(userPrincipal?.toString())
        
        return { success: true, principal: userPrincipal?.toString() }
      } else {
        throw new Error('Failed to connect with Internet Identity')
      }
    } catch (error) {
      console.error('Internet Identity connection failed:', error)
      setError(error.message)
      return { success: false, error: error.message }
    } finally {
      setLoading(false)
    }
  }

  const disconnectWallet = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const success = await apiService.logout()
      
      if (success) {
        setIsConnected(false)
        setCurrentUser(null)
        setPrincipal(null)
        return { success: true }
      } else {
        throw new Error('Failed to disconnect')
      }
    } catch (error) {
      console.error('Disconnect failed:', error)
      setError(error.message)
      return { success: false, error: error.message }
    } finally {
      setLoading(false)
    }
  }

  // Utility functions
  const formatAddress = (addr) => {
    if (!addr) return ''
    if (addr.length <= 10) return addr
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  const isAuthAvailable = () => {
    return typeof window !== 'undefined'
  }

const login = async () => {
  setLoading(true);
  setError(null);
  
  try {
    await authClient.login({
      identityProvider: import.meta.env.VITE_DFX_NETWORK === 'local' 
        ? `http://localhost:4943?canisterId=${import.meta.env.VITE_INTERNET_IDENTITY_CANISTER_ID}`
        : 'https://identity.ic0.app',
      onSuccess: async () => {
        setIsConnected(true);
        const identity = authClient.getIdentity();
        const principal = identity.getPrincipal();
        setPrincipal(principal);
        
        // Now fetch the user profile
        try {
          const userResult = await apiService.getUser(principal);
          if (userResult.success) {
            setCurrentUser(userResult.data);
          } else {
            // Handle new user registration flow
            console.log("User not found in system, needs registration");
          }
        } catch (err) {
          console.error("Failed to fetch user profile:", err);
        }
      },
    });
  } catch (err) {
    setError(`Authentication failed: ${err.message}`);
  } finally {
    setLoading(false);
  }
};

  const value = {
    isConnected,
    currentUser,
    principal,
    address: principal,
    loading,
    error,
    connectInternetIdentity,
    disconnectWallet,
    setError,
    formatAddress,
    isAuthAvailable,
    AUTH_TYPES
  }

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  )
}

export default WalletContext
