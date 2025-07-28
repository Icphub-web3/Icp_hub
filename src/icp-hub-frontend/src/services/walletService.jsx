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

// Only Plug Wallet supported
export const WALLET_TYPES = {
  PLUG: 'plug',
}

// Wallet Provider Component
export const WalletProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false)
  const [currentWallet, setCurrentWallet] = useState(null)
  const [walletType, setWalletType] = useState(null)
  const [address, setAddress] = useState(null)
  const [balance, setBalance] = useState(null)
  const [network, setNetwork] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    checkExistingConnection()
  }, [])

  const checkExistingConnection = async () => {
    try {
      setLoading(true)
      if (typeof window !== 'undefined' && window.ic?.plug) {
        const connected = await window.ic.plug.isConnected()
        if (connected) {
          await connectPlug()
          return
        }
      }
    } catch (error) {
      console.error('Error checking existing wallet connection:', error)
    } finally {
      setLoading(false)
    }
  }

  const connectPlug = async () => {
    try {
      setLoading(true)
      setError(null)
      if (!window.ic?.plug) {
        throw new Error('Plug Wallet is not installed')
      }
      const connected = await window.ic.plug.requestConnect({
        whitelist: [process.env.VITE_BACKEND_CANISTER_ID],
        host: process.env.VITE_DFX_NETWORK === 'local' ? 'http://localhost:4943' : 'https://ic0.app',
      })
      if (!connected) {
        throw new Error('Failed to connect to Plug Wallet')
      }
      const principal = await window.ic.plug.agent.getPrincipal()
      const balance = await window.ic.plug.requestBalance()
      setIsConnected(true)
      setCurrentWallet({ address: principal.toString(), type: WALLET_TYPES.PLUG })
      setWalletType(WALLET_TYPES.PLUG)
      setAddress(principal.toString())
      setBalance(balance[0]?.amount || 0)
      setNetwork('Internet Computer')
      return { success: true, address: principal.toString() }
    } catch (error) {
      console.error('Plug Wallet connection failed:', error)
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
      if (walletType === WALLET_TYPES.PLUG && window.ic?.plug) {
        await window.ic.plug.disconnect()
      }
      setIsConnected(false)
      setCurrentWallet(null)
      setWalletType(null)
      setAddress(null)
      setBalance(null)
      setNetwork(null)
      return { success: true }
    } catch (error) {
      console.error('Wallet disconnection failed:', error)
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

  const formatBalance = (bal) => {
    if (!bal) return '0'
    return Number(bal).toFixed(4)
  }

  // Check if Plug Wallet is available
  const isWalletAvailable = (type) => {
    return type === WALLET_TYPES.PLUG && typeof window !== 'undefined' && window.ic?.plug
  }

  const value = {
    isConnected,
    currentWallet,
    walletType,
    address,
    balance,
    network,
    loading,
    error,
    connectPlug,
    disconnectWallet,
    setError,
    formatAddress,
    formatBalance,
    isWalletAvailable,
    WALLET_TYPES
  }

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  )
}

export default WalletContext 