import { useState } from 'react'
import { useWallet } from '../services/walletService.jsx'
import { X, Wallet, AlertCircle, CheckCircle, Loader, ExternalLink } from 'lucide-react'

function WalletConnectionModal({ isOpen, onClose }) {
  const { 
    connectPlug,
    loading,
    isWalletAvailable,
    WALLET_TYPES
  } = useWallet()
  
  const [connectingWallet, setConnectingWallet] = useState(null)
  const [connectionError, setConnectionError] = useState(null)
  const [connectionSuccess, setConnectionSuccess] = useState(null)

  // Only Plug Wallet option
  const walletOptions = [
    {
      type: WALLET_TYPES.PLUG,
      name: 'Plug Wallet',
      description: 'Connect using Plug wallet for Internet Computer',
      icon: '🔌',
      color: '#4c9aff',
      downloadUrl: 'https://plugwallet.ooo/',
      connectFunction: connectPlug
    }
  ]

  const handleWalletConnect = async (wallet) => {
    setConnectingWallet(wallet.type)
    setConnectionError(null)
    setConnectionSuccess(null)

    try {
      const result = await wallet.connectFunction()
      
      if (result.success) {
        setConnectionSuccess(`Successfully connected to ${wallet.name}!`)
        setTimeout(() => {
          handleClose()
        }, 2000)
      } else {
        setConnectionError(result.error || `Failed to connect to ${wallet.name}`)
      }
    } catch (error) {
      setConnectionError(error.message || `Failed to connect to ${wallet.name}`)
    } finally {
      setConnectingWallet(null)
    }
  }

  const handleClose = () => {
    if (!connectingWallet) {
      setConnectingWallet(null)
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
            <h2>Wallet Connected!</h2>
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
            <Wallet size={24} />
            Connect Your Wallet
          </h2>
          <button 
            className="modal-close"
            onClick={handleClose}
            disabled={connectingWallet}
          >
            <X size={20} />
          </button>
        </div>

        <div className="wallet-modal-description">
                          <p>Connect your Plug wallet to start using OpenKey on the Internet Computer.</p>
        </div>

        {connectionError && (
          <div className="error-message">
            <AlertCircle size={16} />
            {connectionError}
          </div>
        )}

        <div className="wallet-options">
          {walletOptions.map((wallet) => {
            const isAvailable = isWalletAvailable(wallet.type)
            const isConnecting = connectingWallet === wallet.type

            return (
              <div key={wallet.type} className="wallet-option">
                <button
                  className={`wallet-option-button ${!isAvailable ? 'unavailable' : ''} ${isConnecting ? 'connecting' : ''}`}
                  onClick={() => isAvailable ? handleWalletConnect(wallet) : window.open(wallet.downloadUrl, '_blank')}
                  disabled={connectingWallet && !isConnecting}
                >
                  <div className="wallet-option-content">
                    <div className="wallet-icon" style={{ backgroundColor: wallet.color }}>
                      {isConnecting ? (
                        <Loader size={24} className="spinner" />
                      ) : (
                        <span className="wallet-emoji">{wallet.icon}</span>
                      )}
                    </div>
                    
                    <div className="wallet-info">
                      <div className="wallet-name">
                        {wallet.name}
                        {!isAvailable && <span className="not-installed">Not Installed</span>}
                      </div>
                      <div className="wallet-description">
                        {isConnecting ? 'Connecting...' : wallet.description}
                      </div>
                    </div>

                    <div className="wallet-action">
                      {isAvailable ? (
                        isConnecting ? (
                          <div className="connecting-indicator">
                            <Loader size={16} className="spinner" />
                          </div>
                        ) : (
                          <div className="connect-button">
                            Connect
                          </div>
                        )
                      ) : (
                        <div className="install-button">
                          <ExternalLink size={16} />
                          Install
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
            <strong>New to Plug?</strong> Plug is a browser extension wallet for the Internet Computer. 
            <a href="https://plugwallet.ooo/" target="_blank" rel="noopener noreferrer">Install Plug Wallet</a> to get started.
          </p>
        </div>
      </div>
    </div>
  )
}

export default WalletConnectionModal 