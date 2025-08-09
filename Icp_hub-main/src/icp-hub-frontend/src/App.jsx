import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { WalletProvider, useWallet } from './services/walletService.jsx'
import Header from './components/Header'
import Home from './components/Home'
import Dashboard from './components/Dashboard'
import Repositories from './components/Repositories'
import Community from './components/Community'
import Profile from './components/Profile'
import UserProfile from './components/UserProfile'
import RepositoryDetail from './components/RepositoryDetail'
import RepoCreate from './components/RepoCreate'
import Tokens from './components/Tokens'
import Bounties from './components/Bounties'
import Governance from './components/Governance'
import Deploy from './components/Deploy'
import Storage from './components/Storage'
import Footer from './components/Footer'
import './App.css'
import { useState, useEffect } from 'react'
import apiService from './services/api'

// Loading component
function LoadingSpinner() {
  return (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      <p>Connecting to Internet Computer...</p>
    </div>
  )
}

// Error boundary component
function ErrorBoundary({ children }) {
  const [hasError, setHasError] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const handleError = (error) => {
      console.error('Error caught by boundary:', error)
      setHasError(true)
      setError(error)
    }

    window.addEventListener('error', handleError)
    return () => window.removeEventListener('error', handleError)
  }, [])

  if (hasError) {
    return (
      <div className="error-container">
        <div className="error-content">
          <h2>Something went wrong</h2>
          <p>We're experiencing technical difficulties. Please try again later.</p>
          <button 
            className="btn-primary"
            onClick={() => {
              setHasError(false)
              setError(null)
              window.location.reload()
            }}
          >
            Reload Page
          </button>
        </div>
      </div>
    )
  }

  return children
}

// Main App content component
function AppContent() {
  const { loading, error, isConnected } = useWallet()
  
  // Initialize API service
  useEffect(() => {
    const initializeApp = async () => {
      try {
        await apiService.init()
      } catch (error) {
        console.error('Failed to initialize API service:', error)
      }
    }
    
    initializeApp()
  }, [])

  if (loading) {
    return <LoadingSpinner />
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-content">
          <h2>Connection Error</h2>
          <p>{error}</p>
          <button 
            className="btn-primary"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="App">
      <Header />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/repositories" element={<Repositories />} />
          <Route path="/create" element={<RepoCreate />} />
          <Route path="/community" element={<Community />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/user/:username" element={<UserProfile />} />
          <Route path="/repo/:id" element={<RepositoryDetail />} />
          <Route path="/tokens" element={<Tokens />} />
          <Route path="/bounties" element={<Bounties />} />
          <Route path="/governance" element={<Governance />} />
          <Route path="/deploy" element={<Deploy />} />
          <Route path="/storage" element={<Storage />} />
          <Route path="/:owner/:repo" element={<RepositoryDetail />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

// Main App component
function App() {
  return (
    <ErrorBoundary>
      <WalletProvider>
        <Router>
          <AppContent />
        </Router>
      </WalletProvider>
    </ErrorBoundary>
  )
}

export default App
