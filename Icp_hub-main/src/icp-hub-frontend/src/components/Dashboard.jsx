import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useWallet } from '../services/walletService.jsx'
import dataService from '../services/dataService'
import { mockUser, mockActivity } from '../data/dummyData'
import { 
  Wallet, 
  Activity, 
  Folder, 
  TrendingUp, 
  Star, 
  GitFork, 
  Clock, 
  Plus,
  ArrowUpRight,
  DollarSign,
  Zap,
  Eye
} from 'lucide-react'

function Dashboard() {
  const { isConnected, currentUser } = useWallet()
  const [user, setUser] = useState(null)
  const [repositories, setRepositories] = useState([])
  const [activity] = useState(mockActivity) // Keep mock activity for now
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (isConnected) {
      loadDashboardData()
    } else {
      setLoading(false)
    }
  }, [isConnected])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      
      // Get current user using hybrid approach
      const userResult = await dataService.getCurrentUser()
      if (userResult.success) {
        setUser(userResult.data)
      }

      // Get user repositories using hybrid approach
      if (currentUser || userResult.data) {
        const reposResult = await dataService.listRepositories(
          currentUser?.principal || 'current_user', 
          { page: 0, limit: 10 }
        )
        if (reposResult.success) {
          setRepositories(reposResult.data.repositories || [])
        }
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err)
      setError('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount, currency) => {
    return `${parseFloat(amount).toFixed(2)} ${currency}`
  }

  const formatTimeAgo = (timestamp) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diff = now - time
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(hours / 24)
    
    if (days > 0) return `${days}d ago`
    if (hours > 0) return `${hours}h ago`
    return 'Just now'
  }

  const getTotalBalance = () => {
    if (user?.balance) {
      const total = Object.values(user.balance).reduce((sum, val) => sum + parseFloat(val), 0)
      return total.toFixed(2)
    }
    return '0.00'
  }

  const getActivityIcon = (type) => {
    switch (type) {
      case 'commit':
        return <GitFork size={16} />
      case 'bounty_claim':
        return <DollarSign size={16} />
      case 'stake':
        return <TrendingUp size={16} />
      case 'vote':
        return <Zap size={16} />
      default:
        return <Activity size={16} />
    }
  }

  const getStatusBadge = (status) => {
    const baseClass = "px-2 py-1 rounded-full text-xs font-medium"
    switch (status) {
      case 'deployed':
        return `${baseClass} bg-green-100 text-green-800`
      case 'pending':
        return `${baseClass} bg-yellow-100 text-yellow-800`
      case 'failed':
        return `${baseClass} bg-red-100 text-red-800`
      default:
        return `${baseClass} bg-gray-100 text-gray-800`
    }
  }

  if (!isConnected) {
    return (
      <div className="dashboard">
        <div className="container">
          <div className="not-connected">
            <div className="not-connected-content">
              <h1>Connect to view your dashboard</h1>
              <p>Please connect with Internet Identity to access your dashboard.</p>
              <Link to="/" className="btn-primary">
                Go to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="dashboard">
        <div className="container">
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  const displayUser = user || currentUser || mockUser // Fallback to mock data

  return (
    <div className="dashboard">
      <div className="container">
        {/* Welcome Section */}
        <div className="dashboard-welcome">
          <div className="welcome-content">
            <h1>Welcome back, {displayUser.name || displayUser.username}!</h1>
            <p>Here's what's happening with your projects and earnings</p>
          </div>
          <Link to="/create" className="btn-primary">
            <Plus size={16} />
            Create Repository
          </Link>
        </div>

        {error && (
          <div className="error-message">
            <div className="error-content">
              <p>{error}</p>
              <button onClick={loadDashboardData} className="btn-secondary">
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon wallet">
              <Wallet size={24} />
            </div>
            <div className="stat-content">
              <h3>Total Balance</h3>
              <p className="stat-value">${getTotalBalance()}</p>
              <span className="stat-change positive">+12.5% this month</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon earnings">
              <DollarSign size={24} />
            </div>
            <div className="stat-content">
              <h3>Total Earnings</h3>
              <p className="stat-value">${displayUser.totalEarnings || '0.00'}</p>
              <span className="stat-change positive">+8.2% this month</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon repos">
              <Folder size={24} />
            </div>
            <div className="stat-content">
              <h3>Repositories</h3>
              <p className="stat-value">{repositories.length}</p>
              <span className="stat-label">Active projects</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon staking">
              <TrendingUp size={24} />
            </div>
            <div className="stat-content">
              <h3>Staked Tokens</h3>
              <p className="stat-value">{displayUser.stakedTokens || '0'} OKY</p>
              <span className="stat-change positive">+5.1% APY</span>
            </div>
          </div>
        </div>

        <div className="dashboard-grid">
          {/* Portfolio Breakdown */}
          <div className="dashboard-card portfolio-card">
            <div className="card-header">
              <h2>Portfolio Breakdown</h2>
              <Link to="/tokens" className="card-action">
                View All <ArrowUpRight size={16} />
              </Link>
            </div>
            <div className="portfolio-list">
              {displayUser.balance ? Object.entries(displayUser.balance).map(([currency, amount]) => (
                <div key={currency} className="portfolio-item">
                  <div className="portfolio-info">
                    <span className="currency-symbol">{currency.toUpperCase()}</span>
                    <span className="currency-name">
                      {currency === 'eth' ? 'Ethereum' : 
                       currency === 'icp' ? 'Internet Computer' :
                       currency === 'matic' ? 'Polygon' :
                       currency === 'bnb' ? 'BNB Chain' :
                       currency === 'avax' ? 'Avalanche' : currency}
                    </span>
                  </div>
                  <div className="portfolio-amount">
                    <span className="amount">{amount}</span>
                    <span className="currency">{currency.toUpperCase()}</span>
                  </div>
                </div>
              )) : (
                <div className="no-portfolio">
                  <p>No portfolio data available</p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="dashboard-card activity-card">
            <div className="card-header">
              <h2>Recent Activity</h2>
              <Link to="/tokens" className="card-action">
                View All <ArrowUpRight size={16} />
              </Link>
            </div>
            <div className="activity-list">
              {activity.slice(0, 5).map((item) => (
                <div key={item.id} className="activity-item">
                  <div className="activity-icon">
                    {getActivityIcon(item.type)}
                  </div>
                  <div className="activity-content">
                    <p className="activity-description">{item.description}</p>
                    <div className="activity-meta">
                      {item.repository && (
                        <span className="activity-repo">{item.repository}</span>
                      )}
                      {item.proposal && (
                        <span className="activity-proposal">{item.proposal}</span>
                      )}
                      <span className="activity-time">{formatTimeAgo(item.timestamp)}</span>
                    </div>
                  </div>
                  {(item.reward || item.amount) && (
                    <div className="activity-reward">
                      +{item.reward || item.amount} {item.currency}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* My Repositories */}
        <div className="dashboard-card repositories-card">
          <div className="card-header">
            <h2>My Repositories</h2>
            <div className="card-actions">
              <Link to="/repositories" className="card-action">
                View All <ArrowUpRight size={16} />
              </Link>
              <Link to="/create" className="btn-secondary">
                <Plus size={16} />
                New Repository
              </Link>
            </div>
          </div>
          <div className="repositories-grid">
            {repositories.length > 0 ? repositories.map((repo) => (
              <Link key={repo.id} to={`/repositories/${repo.id}`} className="repository-card">
                <div className="repo-header">
                  <h3>{repo.name}</h3>
                  <div className="repo-stats">
                    <span className="repo-stat">
                      <Star size={14} />
                      {repo.stars || 0}
                    </span>
                    <span className="repo-stat">
                      <GitFork size={14} />
                      {repo.forks || 0}
                    </span>
                  </div>
                </div>
                <p className="repo-description">{repo.description || 'No description'}</p>
                <div className="repo-meta">
                  <span className="repo-language">{repo.language || 'Unknown'}</span>
                  <span className="repo-time">
                    <Clock size={12} />
                    {repo.updatedAt ? formatTimeAgo(repo.updatedAt) : 'Recently'}
                  </span>
                </div>
                {repo.supportedChains && (
                  <div className="repo-chains">
                    {repo.supportedChains.map((chain) => (
                      <span 
                        key={chain} 
                        className={`chain-badge ${getStatusBadge(repo.deploymentStatus?.[chain] || 'unknown')}`}
                      >
                        {chain}
                      </span>
                    ))}
                  </div>
                )}
                {repo.incentives?.enabled && (
                  <div className="repo-incentives">
                    <Zap size={14} />
                    <span>Incentives: {repo.incentives.totalPool} tokens</span>
                  </div>
                )}
              </Link>
            )) : (
              <div className="no-repositories">
                <div className="no-repositories-content">
                  <Folder size={48} />
                  <h3>No repositories yet</h3>
                  <p>Create your first repository to get started!</p>
                  <Link to="/create" className="btn-primary">
                    <Plus size={16} />
                    Create Repository
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
