import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useWallet } from '../services/walletService.jsx'
import { Home, Folder, Users, User, Plus, Wallet, LogOut, Settings, ChevronDown, DollarSign, Vote, TrendingUp, FileText } from 'lucide-react'
import NewRepositoryModal from './NewRepositoryModal'
import WalletConnectionModal from './WalletConnectionModal'

function Header() {
  const { 
  isConnected, 
  currentUser,
  principal,
  address,
  loading,
  error,
  setError,
  formatAddress,
  disconnectWallet
} = useWallet()
  
  const navigate = useNavigate()
  const location = useLocation()
  const [isNewRepoModalOpen, setIsNewRepoModalOpen] = useState(false)
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false)
  const [isWalletMenuOpen, setIsWalletMenuOpen] = useState(false)

  const isHomePage = location.pathname === '/'

  const handleConnectWallet = () => {
    setError(null)
    setIsWalletModalOpen(true)
  }

  const handleDisconnectWallet = async () => {
    try {
      setError(null)
      await disconnectWallet()
      navigate('/')
      setIsWalletMenuOpen(false)
    } catch (error) {
      console.error('Disconnect error:', error)
    }
  }

  const handleNewRepository = () => {
    if (!isConnected) {
      handleConnectWallet()
    } else {
      setIsNewRepoModalOpen(true)
    }
  }

  const handleProfileClick = () => {
    setIsWalletMenuOpen(false)
    if (isConnected) {
      navigate('/profile')
    }
  }

  const closeWalletMenu = () => {
    setIsWalletMenuOpen(false)
  }

  // Close wallet menu when clicking outside
  const handleWalletMenuClick = (e) => {
    e.stopPropagation()
  }

  return (
    <>
      <header className="header" onClick={closeWalletMenu}>
        <div className="container">
          <div className="header-content">
            <Link to="/" className="logo">
              {isHomePage ? (
                <img 
                  src="/OPENKEY.png" 
                  alt="OpenKey" 
                  className="logo-image"
                  style={{ height: '20x', width: '100px' }}
                />
              ) : (
                <span className="logo-text">OpenKey</span>
              )}
            </Link>
            
            <nav className="nav">
              <Link to="/" className="nav-link">
                <Home size={18} />
                <span>Home</span>
              </Link>
              {isConnected && (
                <Link to="/dashboard" className="nav-link">
                  <Settings size={18} />
                  <span>Dashboard</span>
                </Link>
              )}
              <Link to="/repositories" className="nav-link">
                <Folder size={18} />
                <span>Repositories</span>
              </Link>
              <Link to="/bounties" className="nav-link">
                <DollarSign size={18} />
                <span>Bounties</span>
              </Link>
              <Link to="/governance" className="nav-link">
                <Vote size={18} />
                <span>Governance</span>
              </Link>
              <a 
                href="https://github.com/Icphub-web3/Icp_hub/blob/main/README.md" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="nav-link"
              >
                <FileText size={18} />
                <span>Documentation</span>
              </a>
              {isConnected && (
                <Link to="/tokens" className="nav-link">
                  <TrendingUp size={18} />
                  <span>Tokens</span>
                </Link>
              )}
            </nav>

            <div className="header-actions">
              {isConnected && (
                <button 
                  className="btn-secondary new-btn"
                  onClick={handleNewRepository}
                  disabled={loading}
                >
                  <Plus size={16} />
                  New
                </button>
              )}

              <div className="wallet-section">
                {!isConnected ? (
                  <button 
                    className="btn-primary connect-wallet-btn"
                    onClick={handleConnectWallet}
                    disabled={loading}
                  >
                    <Wallet size={16} />
                    {loading ? 'Connecting...' : 'Connect Wallet'}
                  </button>
                ) : (
                  <div className="wallet-menu-container">
                    <button 
                      className="wallet-menu-trigger"
                      onClick={(e) => {
                        e.stopPropagation()
                        setIsWalletMenuOpen(!isWalletMenuOpen)
                      }}
                    >
                      <div className="wallet-info">
                        <div className="wallet-main">
                          <Wallet size={16} />
                          <span className="wallet-address">
                            {formatAddress(principal)}
                          </span>
                        </div>
                        <div className="wallet-details">
                          <span className="wallet-balance">
                            Internet Computer
                          </span>
                          <span className="wallet-network">
                            {/*{network}*/}
                            {currentUser ? `@${currentUser.username}` : 'Authenticated'}
                          </span>
                        </div>
                      </div>
                      <ChevronDown size={16} className={`chevron ${isWalletMenuOpen ? 'open' : ''}`} />
                    </button>

                    {isWalletMenuOpen && (
                      <div className="wallet-menu" onClick={handleWalletMenuClick}>
                        <div className="wallet-menu-header">
                          <div className="wallet-status">
                            <div className="status-indicator connected"></div>
                            <div className="wallet-type">
                                Internet Identity
                              </div>
                          </div>
                        </div>
                        
                        <div className="wallet-menu-info">
                          <div className="info-row">
                            <span className="label">Principal:</span>
                            <span className="value">{formatAddress(principal)}</span>
                          </div>
                          {currentUser && (
                          <div className="info-row">
                            <span className="label">Username:</span>
                            <span className="value">{currentUser.username}</span>
                          </div>
                          )}
                          <div className="info-row">
                            <span className="label">Network:</span>
                            <span className="value">Internet Computer</span>
                          </div>
                        </div>
                        
                        <div className="wallet-menu-divider"></div>
                        
                        <button 
                          className="wallet-menu-item"
                          onClick={() => {
                            setIsWalletModalOpen(true)
                            setIsWalletMenuOpen(false)
                  }}
                        >
                          <Settings size={16} />
                          Re-authenticate
                        </button>
                        
                        <button 
                          className="wallet-menu-item"
                          onClick={() => {
                            navigate('/repositories')
                            setIsWalletMenuOpen(false)
                          }}
                        >
                          <Folder size={16} />
                          Your Repositories
                        </button>

                        <button 
                          className="wallet-menu-item"
                          onClick={() => {
                            navigate('/deploy')
                            setIsWalletMenuOpen(false)
                          }}
                        >
                          <Settings size={16} />
                          Deployments
                        </button>

                        <button 
                          className="wallet-menu-item"
                          onClick={() => {
                            navigate('/storage')
                            setIsWalletMenuOpen(false)
                          }}
                        >
                          <Folder size={16} />
                          Storage
                        </button>
                        
                        <button 
                          className="wallet-menu-item"
                          onClick={() => {
                            setIsWalletModalOpen(true)
                            setIsWalletMenuOpen(false)
                          }}
                        >
                          <Settings size={16} />
                          Switch Wallet
                        </button>
                        
                        <div className="wallet-menu-divider"></div>
                        
                        <button 
                          className="wallet-menu-item wallet-menu-disconnect"
                          onClick={handleDisconnectWallet}
                          disabled={loading}
                        >
                          <LogOut size={16} />
                          {loading ? 'Disconnecting...' : 'Disconnect Wallet'}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="header-error">
            <div className="container">
              <p>{error}</p>
              <button onClick={() => setError(null)}>×</button>
            </div>
          </div>
        )}
      </header>

      {/* Modals */}
      <NewRepositoryModal 
        isOpen={isNewRepoModalOpen}
        onClose={() => setIsNewRepoModalOpen(false)}
      />

      <WalletConnectionModal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
      />
    </>
  )
}

export default Header 