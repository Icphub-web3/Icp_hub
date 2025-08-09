import { useState } from 'react'
import { Link } from 'react-router-dom'
import { mockDeployments, mockRepositories, supportedChains } from '../data/dummyData'
import { 
  Rocket, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  ExternalLink,
  Settings,
  Play,
  RefreshCw,
  Eye,
  Activity,
  Zap,
  Filter
} from 'lucide-react'

function Deploy() {
  const [deployments] = useState(mockDeployments)
  const [repositories] = useState(mockRepositories)
  const [selectedRepo, setSelectedRepo] = useState('')
  const [selectedChain, setSelectedChain] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showDeployForm, setShowDeployForm] = useState(false)

  const filteredDeployments = deployments.filter(deployment => {
    const matchesRepo = !selectedRepo || deployment.repository === selectedRepo
    const matchesChain = !selectedChain || deployment.chain === selectedChain
    const matchesStatus = statusFilter === 'all' || deployment.status === statusFilter
    
    return matchesRepo && matchesChain && matchesStatus
  })

  const getStatusColor = (status) => {
    switch (status) {
      case 'deployed':
        return 'text-green-600 bg-green-100'
      case 'pending':
        return 'text-blue-600 bg-blue-100'
      case 'failed':
        return 'text-red-600 bg-red-100'
      case 'deploying':
        return 'text-yellow-600 bg-yellow-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'deployed':
        return <CheckCircle size={16} />
      case 'pending':
        return <Clock size={16} />
      case 'failed':
        return <AlertCircle size={16} />
      case 'deploying':
        return <RefreshCw size={16} className="animate-spin" />
      default:
        return <Clock size={16} />
    }
  }

  const getChainIcon = (chainId) => {
    const chain = supportedChains.find(c => c.id === chainId)
    return chain ? (
      <span style={{ color: chain.color }}>{chain.icon}</span>
    ) : null
  }

  const formatTimeAgo = (timestamp) => {
    if (!timestamp) return 'Not deployed'
    const now = new Date()
    const time = new Date(timestamp)
    const diff = now - time
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(hours / 24)
    
    if (days > 0) return `${days}d ago`
    if (hours > 0) return `${hours}h ago`
    return 'Just now'
  }

  const handleDeploy = (repo, chain) => {
    console.log(`Deploying ${repo} to ${chain}`)
    // Simulate deployment
  }

  const renderDeploymentCard = (deployment) => {
    const chain = supportedChains.find(c => c.id === deployment.chain)
    
    return (
      <div key={deployment.id} className="deployment-card">
        <div className="deployment-header">
          <div className="deployment-info">
            <div className="deployment-title">
              <Link to={`/repo/${deployment.repository}`} className="repo-link">
                {deployment.repository}
              </Link>
              <span className="deployment-version">{deployment.version}</span>
            </div>
            <div className="deployment-chain">
              {getChainIcon(deployment.chain)}
              <span>{chain?.name}</span>
            </div>
          </div>
          <div className="deployment-status">
            <span className={`status-badge ${getStatusColor(deployment.status)}`}>
              {getStatusIcon(deployment.status)}
              {deployment.status}
            </span>
          </div>
        </div>

        <div className="deployment-details">
          {deployment.contractAddress && (
            <div className="detail-item">
              <span className="label">Contract Address:</span>
              <div className="contract-address">
                <code>{deployment.contractAddress}</code>
                <a 
                  href={`${chain?.explorerUrl}/address/${deployment.contractAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="external-link"
                >
                  <ExternalLink size={14} />
                </a>
              </div>
            </div>
          )}
          
          {deployment.gasUsed && (
            <div className="detail-item">
              <span className="label">Gas Used:</span>
              <span className="value">{deployment.gasUsed}</span>
            </div>
          )}
          
          <div className="detail-item">
            <span className="label">Deployed:</span>
            <span className="value">{formatTimeAgo(deployment.deployedAt)}</span>
          </div>
          
          <div className="detail-item">
            <span className="label">Deployer:</span>
            <span className="value">{deployment.deployer}</span>
          </div>
        </div>

        <div className="deployment-actions">
          <button className="btn-outline">
            <Eye size={16} />
            View Details
          </button>
          
          {deployment.status === 'deployed' && (
            <button className="btn-secondary">
              <Settings size={16} />
              Manage
            </button>
          )}
          
          {deployment.status === 'failed' && (
            <button className="btn-primary">
              <RefreshCw size={16} />
              Retry Deploy
            </button>
          )}

          {deployment.txHash && (
            <a 
              href={`${chain?.explorerUrl}/tx/${deployment.txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline"
            >
              <ExternalLink size={16} />
              View Transaction
            </a>
          )}
        </div>
      </div>
    )
  }

  const renderDeployForm = () => (
    <div className="deploy-form">
      <div className="form-header">
        <h3>Deploy Contract</h3>
        <button 
          className="btn-outline"
          onClick={() => setShowDeployForm(false)}
        >
          Cancel
        </button>
      </div>

      <div className="form-content">
        <div className="form-group">
          <label>Repository *</label>
          <select className="form-select">
            <option value="">Select repository</option>
            {repositories.map(repo => (
              <option key={repo.id} value={repo.name}>{repo.name}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Target Network *</label>
          <div className="chains-grid">
            {supportedChains.map(chain => (
              <div key={chain.id} className="chain-option">
                <input
                  type="radio"
                  id={`chain-${chain.id}`}
                  name="chain"
                  value={chain.id}
                />
                <label htmlFor={`chain-${chain.id}`} className="chain-label">
                  <span className="chain-icon" style={{ color: chain.color }}>
                    {chain.icon}
                  </span>
                  <div className="chain-info">
                    <span className="chain-name">{chain.name}</span>
                    <span className="chain-gas">Gas: {chain.gasPrice}</span>
                  </div>
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Gas Limit</label>
            <input
              type="number"
              placeholder="3000000"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label>Gas Price (Gwei)</label>
            <input
              type="number"
              placeholder="20"
              className="form-input"
            />
          </div>
        </div>

        <div className="form-group">
          <label>Constructor Arguments</label>
          <textarea
            placeholder="Enter constructor arguments in JSON format"
            className="form-textarea"
            rows="3"
          />
        </div>

        <div className="form-group">
          <label className="checkbox-label">
            <input type="checkbox" />
            <span className="checkbox-custom"></span>
            Enable contract verification
          </label>
        </div>

        <div className="form-actions">
          <button className="btn-secondary">
            Estimate Gas
          </button>
          <button className="btn-primary">
            <Rocket size={16} />
            Deploy Contract
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="deploy-page">
      <div className="container">
        <div className="page-header">
          <div className="header-content">
            <h1>Deployments</h1>
            <p>Manage and monitor your smart contract deployments across multiple networks</p>
          </div>
          <button 
            className="btn-primary"
            onClick={() => setShowDeployForm(true)}
          >
            <Rocket size={16} />
            New Deployment
          </button>
        </div>

        {showDeployForm ? renderDeployForm() : (
          <>
            {/* Deployment Stats */}
            <div className="deployment-stats">
              <div className="stat-card">
                <div className="stat-icon">
                  <Activity size={24} />
                </div>
                <div className="stat-content">
                  <h3>Total Deployments</h3>
                  <p className="stat-value">{deployments.length}</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">
                  <CheckCircle size={24} />
                </div>
                <div className="stat-content">
                  <h3>Successful</h3>
                  <p className="stat-value">{deployments.filter(d => d.status === 'deployed').length}</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">
                  <Clock size={24} />
                </div>
                <div className="stat-content">
                  <h3>Pending</h3>
                  <p className="stat-value">{deployments.filter(d => d.status === 'pending').length}</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">
                  <Zap size={24} />
                </div>
                <div className="stat-content">
                  <h3>Networks</h3>
                  <p className="stat-value">{new Set(deployments.map(d => d.chain)).size}</p>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="deployment-filters">
              <div className="filter-group">
                <label>Repository</label>
                <select 
                  value={selectedRepo}
                  onChange={(e) => setSelectedRepo(e.target.value)}
                  className="filter-select"
                >
                  <option value="">All Repositories</option>
                  {repositories.map(repo => (
                    <option key={repo.id} value={repo.name}>{repo.name}</option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <label>Network</label>
                <select 
                  value={selectedChain}
                  onChange={(e) => setSelectedChain(e.target.value)}
                  className="filter-select"
                >
                  <option value="">All Networks</option>
                  {supportedChains.map(chain => (
                    <option key={chain.id} value={chain.id}>{chain.name}</option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <label>Status</label>
                <select 
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="filter-select"
                >
                  <option value="all">All Status</option>
                  <option value="deployed">Deployed</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                </select>
              </div>
            </div>

            {/* Deployments List */}
            <div className="deployments-content">
              {filteredDeployments.length === 0 ? (
                <div className="empty-state">
                  <Rocket size={48} />
                  <h3>No deployments found</h3>
                  <p>Deploy your first smart contract to get started</p>
                  <button 
                    className="btn-primary"
                    onClick={() => setShowDeployForm(true)}
                  >
                    <Rocket size={16} />
                    Create First Deployment
                  </button>
                </div>
              ) : (
                <div className="deployments-list">
                  {filteredDeployments.map(renderDeploymentCard)}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default Deploy 