import { useState } from 'react'
import { useWallet } from '../services/walletService.jsx'
import { X, Shield, AlertCircle, CheckCircle, Loader, ExternalLink } from 'lucide-react'

function WalletConnectionModal({ isOpen, onClose }) {
  const { 
    connectInternetIdentity,
    loading,
    isAuthAvailable,
    AUTH_TYPES
  } = useWallet()
  
  const [connecting, setConnecting] = useState(false)
  const [connectionError, setConnectionError] = useState(null)
  const [connectionSuccess, setConnectionSuccess] = useState(null)

  // Internet Identity option
  const authOptions = [
    {
      type: AUTH_TYPES.INTERNET_IDENTITY,
      name: 'Internet Identity',
      description: 'Secure authentication for Internet Computer',
      icon: '🔐',
      color: '#29abe2',
      learnMoreUrl: 'https://identity.ic0.app',
      connectFunction: connectInternetIdentity
    }
  ]

  const handleAuthConnect = async (authOption) => {
    setConnecting(true)
    setConnectionError(null)
    setConnectionSuccess(null)

    try {
      const result = await authOption.connectFunction()
      
      if (result.success) {
        setConnectionSuccess(`Successfully authenticated with ${authOption.name}!`)
        setTimeout(() => {
          handleClose()
        }, 2000)
      } else {
        setConnectionError(result.error || `Failed to authenticate with ${authOption.name}`)
      }
    } catch (error) {
      setConnectionError(error.message || `Failed to authenticate with ${authOption.name}`)
    } finally {
      setConnecting(false)
    }
  }

  const handleClose = () => {
    if (!connecting) {
      setConnecting(false)
      setConnectionError(null)
      setConnectionSuccess(null)
      onClose()
    }
  }

  if (!isOpen) return null

  if (connectionSuccess) {
    return (
      <div className="modal-overlay">
        <div className="modal-content wallet-success-modal">
          <div className="success-content">
            <div className="success-icon">
              <CheckCircle size={48} />
            </div>
            <h2>Authentication Successful!</h2>
            <p>{connectionSuccess}</p>
            <div className="loading-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content wallet-modal">
        <div className="modal-header">
          <h2>
            <Shield size={24} />
            Connect to Internet Computer
          </h2>
          <button 
            className="modal-close"
            onClick={handleClose}
            disabled={connecting}
          >
            <X size={20} />
          </button>
        </div>

        <div className="wallet-modal-description">
          <p>Authenticate with Internet Identity to access your ICPHub account.</p>
        </div>

        {connectionError && (
          <div className="error-message">
            <AlertCircle size={16} />
            {connectionError}
          </div>
        )}

        <div className="wallet-options">
          {authOptions.map((authOption) => {
            const isAvailable = isAuthAvailable()
            const isConnecting = connecting

            return (
              <div key={authOption.type} className="wallet-option">
                <button
                  className={`wallet-option-button ${!isAvailable ? 'unavailable' : ''} ${isConnecting ? 'connecting' : ''}`}
                  onClick={() => isAvailable ? handleAuthConnect(authOption) : window.open(authOption.learnMoreUrl, '_blank')}
                  disabled={connecting}
                >
                  <div className="wallet-option-content">
                    <div className="wallet-icon" style={{ backgroundColor: authOption.color }}>
                      {isConnecting ? (
                        <Loader size={24} className="spinner" />
                      ) : (
                        <span className="wallet-emoji">{authOption.icon}</span>
                      )}
                    </div>
                    
                    <div className="wallet-info">
                      <div className="wallet-name">
                        {authOption.name}
                      </div>
                      <div className="wallet-description">
                        {isConnecting ? 'Authenticating...' : authOption.description}
                      </div>
                    </div>

                    <div className="wallet-action">
                      {isConnecting ? (
                        <div className="connecting-indicator">
                          <Loader size={16} className="spinner" />
                        </div>
                      ) : (
                        <div className="connect-button">
                          Connect
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              </div>
            )
          })}
        </div>

        <div className="wallet-modal-footer">
          <p className="wallet-disclaimer">
            <strong>New to Internet Identity?</strong> Internet Identity is a secure, anonymous authentication system for the Internet Computer. 
            <a href="https://identity.ic0.app" target="_blank" rel="noopener noreferrer">Learn more</a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default WalletConnectionModal
