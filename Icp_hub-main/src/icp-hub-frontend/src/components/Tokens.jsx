import { useState } from 'react'
import { mockUser, mockStakingHistory, supportedChains } from '../data/dummyData'
import { 
  Wallet, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Gift,
  Clock,
  ExternalLink,
  Plus,
  Minus,
  DollarSign,
  PieChart,
  History
} from 'lucide-react'

function Tokens() {
  const [user] = useState(mockUser)
  const [stakingHistory] = useState(mockStakingHistory)
  const [activeTab, setActiveTab] = useState('portfolio')
  const [stakeAmount, setStakeAmount] = useState('')
  const [unstakeAmount, setUnstakeAmount] = useState('')

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
    return Object.values(user.balance).reduce((sum, val) => sum + parseFloat(val), 0)
  }

  const getChainInfo = (currency) => {
    const chainMap = {
      'eth': 'ethereum',
      'icp': 'internet-computer',
      'matic': 'polygon',
      'bnb': 'bsc',
      'avax': 'avalanche'
    }
    return supportedChains.find(chain => chain.id === chainMap[currency])
  }

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'stake':
        return <TrendingUp size={16} className="text-blue-500" />
      case 'unstake':
        return <ArrowDownLeft size={16} className="text-orange-500" />
      case 'reward':
        return <Gift size={16} className="text-green-500" />
      default:
        return <ArrowUpRight size={16} />
    }
  }

  const handleStake = () => {
    if (stakeAmount && parseFloat(stakeAmount) > 0) {
      console.log('Staking:', stakeAmount, 'OKY')
      setStakeAmount('')
      // Simulate staking
    }
  }

  const handleUnstake = () => {
    if (unstakeAmount && parseFloat(unstakeAmount) > 0) {
      console.log('Unstaking:', unstakeAmount, 'OKY')
      setUnstakeAmount('')
      // Simulate unstaking
    }
  }

  const renderPortfolioTab = () => (
    <div className="tokens-portfolio">
      {/* Total Balance Card */}
      <div className="balance-summary-card">
        <div className="balance-header">
          <div className="balance-icon">
            <Wallet size={32} />
          </div>
          <div className="balance-content">
            <h2>Total Portfolio Value</h2>
            <p className="balance-amount">${getTotalBalance().toFixed(2)}</p>
            <span className="balance-change positive">+12.5% (24h)</span>
          </div>
        </div>
      </div>

      {/* Token Balances */}
      <div className="tokens-grid">
        {Object.entries(user.balance).map(([currency, amount]) => {
          const chainInfo = getChainInfo(currency)
          return (
            <div key={currency} className="token-card">
              <div className="token-header">
                <div className="token-icon" style={{ color: chainInfo?.color }}>
                  {chainInfo?.icon}
                </div>
                <div className="token-info">
                  <h3>{currency.toUpperCase()}</h3>
                  <p>{chainInfo?.name}</p>
                </div>
              </div>
              <div className="token-balance">
                <p className="token-amount">{amount}</p>
                <p className="token-value">
                  ${(parseFloat(amount) * (currency === 'eth' ? 2000 : currency === 'icp' ? 12 : 1)).toFixed(2)}
                </p>
              </div>
              <div className="token-actions">
                <button className="btn-sm btn-outline">
                  <ArrowUpRight size={14} />
                  Send
                </button>
                <button className="btn-sm btn-secondary">
                  <ArrowDownLeft size={14} />
                  Receive
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )

  const renderStakingTab = () => (
    <div className="tokens-staking">
      {/* Staking Overview */}
      <div className="staking-overview">
        <div className="staking-card main">
          <div className="staking-header">
            <h3>OpenKey Staking</h3>
            <span className="apy-badge">5.1% APY</span>
          </div>
          <div className="staking-stats">
            <div className="stat">
              <span className="label">Staked Amount</span>
              <span className="value">{user.stakedTokens} OKY</span>
            </div>
            <div className="stat">
              <span className="label">Estimated Rewards</span>
              <span className="value">+2.55 OKY/month</span>
            </div>
            <div className="stat">
              <span className="label">Voting Power</span>
              <span className="value">{user.stakedTokens}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Staking Actions */}
      <div className="staking-actions-grid">
        <div className="staking-action-card">
          <h4>Stake Tokens</h4>
          <p>Stake OKY tokens to earn rewards and gain voting power</p>
          <div className="stake-form">
            <div className="input-group">
              <input
                type="number"
                placeholder="0.00"
                value={stakeAmount}
                onChange={(e) => setStakeAmount(e.target.value)}
                className="stake-input"
              />
              <span className="input-suffix">OKY</span>
            </div>
            <button 
              className="btn-primary"
              onClick={handleStake}
              disabled={!stakeAmount || parseFloat(stakeAmount) <= 0}
            >
              <Plus size={16} />
              Stake Tokens
            </button>
          </div>
        </div>

        <div className="staking-action-card">
          <h4>Unstake Tokens</h4>
          <p>Unstake your tokens (14-day unbonding period)</p>
          <div className="stake-form">
            <div className="input-group">
              <input
                type="number"
                placeholder="0.00"
                value={unstakeAmount}
                onChange={(e) => setUnstakeAmount(e.target.value)}
                className="stake-input"
                max={user.stakedTokens}
              />
              <span className="input-suffix">OKY</span>
            </div>
            <button 
              className="btn-outline"
              onClick={handleUnstake}
              disabled={!unstakeAmount || parseFloat(unstakeAmount) <= 0}
            >
              <Minus size={16} />
              Unstake Tokens
            </button>
          </div>
        </div>
      </div>

      {/* Staking Info */}
      <div className="staking-info">
        <h4>Staking Information</h4>
        <div className="info-grid">
          <div className="info-item">
            <span className="info-label">Minimum Stake</span>
            <span className="info-value">10 OKY</span>
          </div>
          <div className="info-item">
            <span className="info-label">Unbonding Period</span>
            <span className="info-value">14 days</span>
          </div>
          <div className="info-item">
            <span className="info-label">Reward Distribution</span>
            <span className="info-value">Daily</span>
          </div>
          <div className="info-item">
            <span className="info-label">Validator Fee</span>
            <span className="info-value">5%</span>
          </div>
        </div>
      </div>
    </div>
  )

  const renderHistoryTab = () => (
    <div className="tokens-history">
      <div className="history-header">
        <h3>Transaction History</h3>
        <div className="history-filters">
          <select className="filter-select">
            <option value="all">All Types</option>
            <option value="stake">Staking</option>
            <option value="unstake">Unstaking</option>
            <option value="reward">Rewards</option>
          </select>
          <select className="filter-select">
            <option value="30">Last 30 days</option>
            <option value="90">Last 3 months</option>
            <option value="365">Last year</option>
          </select>
        </div>
      </div>

      <div className="history-list">
        {stakingHistory.map((transaction) => (
          <div key={transaction.id} className="history-item">
            <div className="history-icon">
              {getTransactionIcon(transaction.type)}
            </div>
            <div className="history-content">
              <div className="history-main">
                <h4 className="history-title">
                  {transaction.type === 'stake' && 'Staked Tokens'}
                  {transaction.type === 'unstake' && 'Unstaked Tokens'}
                  {transaction.type === 'reward' && 'Staking Reward'}
                </h4>
                <span className="history-amount">
                  {transaction.type === 'unstake' ? '-' : '+'}
                  {transaction.amount} {transaction.currency}
                </span>
              </div>
              <div className="history-meta">
                <span className="history-time">
                  <Clock size={12} />
                  {formatTimeAgo(transaction.timestamp)}
                </span>
                <span className="history-status">
                  <span className={`status-badge ${transaction.status}`}>
                    {transaction.status}
                  </span>
                </span>
                <a 
                  href={`https://etherscan.io/tx/${transaction.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="history-link"
                >
                  <ExternalLink size={12} />
                  View Transaction
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <div className="tokens-page">
      <div className="container">
        <div className="page-header">
          <h1>Token Management</h1>
          <p>Manage your portfolio, stake tokens, and track your earnings</p>
        </div>

        {/* Tab Navigation */}
        <div className="tab-navigation">
          <button 
            className={`tab ${activeTab === 'portfolio' ? 'active' : ''}`}
            onClick={() => setActiveTab('portfolio')}
          >
            <PieChart size={16} />
            Portfolio
          </button>
          <button 
            className={`tab ${activeTab === 'staking' ? 'active' : ''}`}
            onClick={() => setActiveTab('staking')}
          >
            <TrendingUp size={16} />
            Staking
          </button>
          <button 
            className={`tab ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            <History size={16} />
            History
          </button>
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {activeTab === 'portfolio' && renderPortfolioTab()}
          {activeTab === 'staking' && renderStakingTab()}
          {activeTab === 'history' && renderHistoryTab()}
        </div>
      </div>
    </div>
  )
}

export default Tokens 