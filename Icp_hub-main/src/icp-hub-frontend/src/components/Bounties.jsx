// src/components/Bounties.jsx 
import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useWallet } from '../services/walletService.jsx'
import dataService from '../services/dataService'
import searchService from '../services/searchService'
import { mockBounties } from '../data/dummyData'
import { 
  Search, 
  Filter, 
  DollarSign, 
  Clock, 
  User, 
  Star,
  Plus,
  MapPin,
  Tag,
  Calendar,
  Users,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Loader,
  X
} from 'lucide-react'

function Bounties() {
  // Authentication state
  const { isConnected, currentUser } = useWallet()
  
  // Data state
  const [bounties, setBounties] = useState([])
  const [searchResults, setSearchResults] = useState([])
  
  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDifficulty, setSelectedDifficulty] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedCurrency, setSelectedCurrency] = useState('all')
  const [amountRange, setAmountRange] = useState({ min: '', max: '' })
  
  // UI state
  const [loading, setLoading] = useState(false)
  const [searchLoading, setSearchLoading] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [error, setError] = useState(null)
  const [hasSearched, setHasSearched] = useState(false)

  // Form state
  const [createFormData, setCreateFormData] = useState({
    title: '',
    description: '',
    repository: '',
    difficulty: 'beginner',
    amount: '',
    currency: 'USDC',
    deadline: '',
    tags: ''
  })

  useEffect(() => {
    initializeData()
  }, [isConnected])

  // Handle search with debouncing
  useEffect(() => {
    if (searchTerm.trim().length > 0) {
      handleSearch()
    } else {
      setSearchResults([])
      setHasSearched(false)
    }
  }, [searchTerm, selectedDifficulty, selectedStatus, selectedCurrency, amountRange])

  const initializeData = async () => {
    setLoading(true)
    setError(null)
    
    try {
      // Try to load bounties from backend first, fallback to mock data
      const result = await dataService.getBounties()
      if (result.success) {
        setBounties(result.data)
      } else {
        // Fallback to mock data
        setBounties(mockBounties)
      }
    } catch (err) {
      console.error('Failed to initialize bounties:', err)
      setBounties(mockBounties) // Fallback to mock data
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = useCallback(async () => {
    if (!searchTerm.trim()) return

    setSearchLoading(true)
    setError(null)

    try {
      // Use custom bounty search that filters repositories by bounty-related criteria
      const filters = {
        difficulty: selectedDifficulty !== 'all' ? selectedDifficulty : null,
        status: selectedStatus !== 'all' ? selectedStatus : null,
        currency: selectedCurrency !== 'all' ? selectedCurrency : null,
        minAmount: amountRange.min ? parseFloat(amountRange.min) : null,
        maxAmount: amountRange.max ? parseFloat(amountRange.max) : null,
        pagination: { page: 0, limit: 20 }
      }

      const result = await searchService.searchBounties(searchTerm, filters)
      
      if (result.success) {
        // For now, we'll simulate bounty search results from repository data
        // In a real implementation, you'd have dedicated bounty search
        const bountyResults = filterBountiesBySearch(bounties, searchTerm, filters)
        setSearchResults(bountyResults)
        setHasSearched(true)
      } else {
        setError(dataService.parseApiError(result.error))
        setSearchResults([])
      }
    } catch (err) {
      console.error('Bounty search failed:', err)
      setError('Search failed. Please try again.')
      setSearchResults([])
    } finally {
      setSearchLoading(false)
    }
  }, [searchTerm, selectedDifficulty, selectedStatus, selectedCurrency, amountRange, bounties])

  // Client-side filtering helper (for demo purposes)
  const filterBountiesBySearch = (bounties, query, filters) => {
    return bounties.filter(bounty => {
      const matchesSearch = bounty.title.toLowerCase().includes(query.toLowerCase()) ||
                           bounty.description.toLowerCase().includes(query.toLowerCase()) ||
                           bounty.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
      
      const matchesDifficulty = !filters.difficulty || bounty.difficulty === filters.difficulty
      const matchesStatus = !filters.status || bounty.status === filters.status
      const matchesCurrency = !filters.currency || bounty.currency === filters.currency
      
      const amount = parseFloat(bounty.amount)
      const matchesAmount = (!filters.minAmount || amount >= filters.minAmount) &&
                           (!filters.maxAmount || amount <= filters.maxAmount)
      
      return matchesSearch && matchesDifficulty && matchesStatus && matchesCurrency && matchesAmount
    })
  }

  const handleCreateBounty = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Convert form data to bounty creation format
      const bountyData = {
        ...createFormData,
        tags: createFormData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        amount: parseFloat(createFormData.amount),
        deadline: new Date(createFormData.deadline).toISOString()
      }

      // For demo purposes, add to local state
      // In real implementation, this would call the backend
      const newBounty = {
        id: `bounty_${Date.now()}`,
        ...bountyData,
        owner: currentUser?.username || 'You',
        status: 'open',
        applicants: 0,
        createdAt: new Date().toISOString()
      }

      setBounties(prev => [newBounty, ...prev])
      setShowCreateForm(false)
      setCreateFormData({
        title: '',
        description: '',
        repository: '',
        difficulty: 'beginner',
        amount: '',
        currency: 'USDC',
        deadline: '',
        tags: ''
      })

      alert('Bounty created successfully!')
    } catch (error) {
      console.error('Failed to create bounty:', error)
      setError('Failed to create bounty. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'beginner':
        return 'text-green-600 bg-green-100'
      case 'intermediate':
        return 'text-blue-600 bg-blue-100'
      case 'expert':
        return 'text-purple-600 bg-purple-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'open':
        return 'text-green-600 bg-green-100'
      case 'in_progress':
        return 'text-blue-600 bg-blue-100'
      case 'completed':
        return 'text-gray-600 bg-gray-100'
      case 'cancelled':
        return 'text-red-600 bg-red-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const formatTimeLeft = (deadline) => {
    const now = new Date()
    const end = new Date(deadline)
    const diff = end - now
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    
    if (days > 0) return `${days} days left`
    if (days === 0) return 'Ends today'
    return 'Expired'
  }

  // Determine which bounties to display
  const displayBounties = hasSearched ? searchResults : bounties

  const renderBountyCard = (bounty) => (
    <div key={bounty.id} className="bounty-card">
      <div className="bounty-header">
        <div className="bounty-title-section">
          <h3 className="bounty-title">{bounty.title}</h3>
          <div className="bounty-badges">
            <span className={`badge ${getDifficultyColor(bounty.difficulty)}`}>
              {bounty.difficulty}
            </span>
            <span className={`badge ${getStatusColor(bounty.status)}`}>
              {bounty.status.replace('_', ' ')}
            </span>
          </div>
        </div>
        <div className="bounty-amount">
          <DollarSign size={16} />
          <span className="amount">{bounty.amount}</span>
          <span className="currency">{bounty.currency}</span>
        </div>
      </div>

      <p className="bounty-description">{bounty.description}</p>

      <div className="bounty-tags">
        {bounty.tags.map((tag, index) => (
          <span key={index} className="tag">
            <Tag size={12} />
            {tag}
          </span>
        ))}
      </div>

      <div className="bounty-meta">
        <div className="meta-item">
          <MapPin size={14} />
          <Link to={`/repo/${bounty.repository}`} className="repo-link">
            {bounty.repository}
          </Link>
        </div>
        <div className="meta-item">
          <User size={14} />
          <span>{bounty.owner}</span>
        </div>
        <div className="meta-item">
          <Users size={14} />
          <span>{bounty.applicants} applicants</span>
        </div>
        <div className="meta-item">
          <Clock size={14} />
          <span className={formatTimeLeft(bounty.deadline).includes('Expired') ? 'text-red-500' : ''}>
            {formatTimeLeft(bounty.deadline)}
          </span>
        </div>
      </div>

      <div className="bounty-actions">
        <button className="btn-outline">
          View Details
        </button>
        {bounty.status === 'open' && (
          <button className="btn-primary">
            Apply for Bounty
          </button>
        )}
        {bounty.status === 'in_progress' && bounty.assignee && (
          <span className="assignee-info">
            <CheckCircle size={14} />
            Assigned to {bounty.assignee}
          </span>
        )}
      </div>
    </div>
  )

  const renderCreateBountyForm = () => (
    <div className="create-bounty-form">
      <div className="form-header">
        <h3>Create New Bounty</h3>
        <button 
          className="btn-outline"
          onClick={() => setShowCreateForm(false)}
        >
          Cancel
        </button>
      </div>

      <form onSubmit={handleCreateBounty} className="form-content">
        <div className="form-group">
          <label>Bounty Title *</label>
          <input
            type="text"
            placeholder="Describe what needs to be done"
            className="form-input"
            value={createFormData.title}
            onChange={(e) => setCreateFormData(prev => ({ ...prev, title: e.target.value }))}
            required
          />
        </div>

        <div className="form-group">
          <label>Description *</label>
          <textarea
            placeholder="Provide detailed requirements and acceptance criteria"
            className="form-textarea"
            rows="4"
            value={createFormData.description}
            onChange={(e) => setCreateFormData(prev => ({ ...prev, description: e.target.value }))}
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Repository *</label>
            <input
              type="text"
              placeholder="Repository name"
              className="form-input"
              value={createFormData.repository}
              onChange={(e) => setCreateFormData(prev => ({ ...prev, repository: e.target.value }))}
              required
            />
          </div>

          <div className="form-group">
            <label>Difficulty Level *</label>
            <select 
              className="form-select"
              value={createFormData.difficulty}
              onChange={(e) => setCreateFormData(prev => ({ ...prev, difficulty: e.target.value }))}
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="expert">Expert</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Reward Amount *</label>
            <input
              type="number"
              placeholder="100"
              className="form-input"
              value={createFormData.amount}
              onChange={(e) => setCreateFormData(prev => ({ ...prev, amount: e.target.value }))}
              required
            />
          </div>

          <div className="form-group">
            <label>Currency *</label>
            <select 
              className="form-select"
              value={createFormData.currency}
              onChange={(e) => setCreateFormData(prev => ({ ...prev, currency: e.target.value }))}
            >
              <option value="USDC">USDC</option>
              <option value="USDT">USDT</option>
              <option value="OKY">OKY</option>
              <option value="ETH">ETH</option>
              <option value="ICP">ICP</option>
            </select>
          </div>

          <div className="form-group">
            <label>Deadline *</label>
            <input
              type="date"
              className="form-input"
              value={createFormData.deadline}
              onChange={(e) => setCreateFormData(prev => ({ ...prev, deadline: e.target.value }))}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label>Tags</label>
          <input
            type="text"
            placeholder="frontend, react, web3 (comma separated)"
            className="form-input"
            value={createFormData.tags}
            onChange={(e) => setCreateFormData(prev => ({ ...prev, tags: e.target.value }))}
          />
        </div>

        <div className="form-actions">
          <button type="button" className="btn-secondary">
            Save as Draft
          </button>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? (
              <>
                <Loader size={16} className="spinner" />
                Creating...
              </>
            ) : (
              <>
                <DollarSign size={16} />
                Create Bounty
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )

  return (
    <div className="bounties-page">
      <div className="container">
        <div className="page-header">
          <div className="header-content">
            <h1>Bounties</h1>
            <p>Discover development opportunities and create bounties for your projects</p>
          </div>
          {isConnected && (
            <button 
              className="btn-primary"
              onClick={() => setShowCreateForm(true)}
            >
              <Plus size={16} />
              Create Bounty
            </button>
          )}
        </div>

        {error && (
          <div className="error-banner">
            <AlertCircle size={20} />
            <span>{error}</span>
            <button onClick={() => setError(null)}>
              <X size={16} />
            </button>
          </div>
        )}

        {showCreateForm ? renderCreateBountyForm() : (
          <>
            {/* Enhanced Search and Filters */}
            <div className="bounties-controls">
              <div className="search-section">
                <div className="search-input">
                  <Search size={18} />
                  <input
                    type="text"
                    placeholder="Search bounties by title, description, or tags..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  {searchLoading && <Loader size={16} className="search-loader spinner" />}
                </div>
              </div>

              <div className="filters-section">
                <div className="filter-group">
                  <label>Difficulty</label>
                  <select 
                    value={selectedDifficulty}
                    onChange={(e) => setSelectedDifficulty(e.target.value)}
                    className="filter-select"
                  >
                    <option value="all">All Levels</option>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="expert">Expert</option>
                  </select>
                </div>

                <div className="filter-group">
                  <label>Status</label>
                  <select 
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="filter-select"
                  >
                    <option value="all">All Status</option>
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>

                <div className="filter-group">
                  <label>Currency</label>
                  <select 
                    value={selectedCurrency}
                    onChange={(e) => setSelectedCurrency(e.target.value)}
                    className="filter-select"
                  >
                    <option value="all">All Currencies</option>
                    <option value="USDC">USDC</option>
                    <option value="USDT">USDT</option>
                    <option value="OKY">OKY</option>
                    <option value="ETH">ETH</option>
                    <option value="ICP">ICP</option>
                  </select>
                </div>

                <div className="filter-group amount-range">
                  <label>Amount Range</label>
                  <div className="range-inputs">
                    <input
                      type="number"
                      placeholder="Min"
                      value={amountRange.min}
                      onChange={(e) => setAmountRange(prev => ({ ...prev, min: e.target.value }))}
                      className="range-input"
                    />
                    <span>-</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={amountRange.max}
                      onChange={(e) => setAmountRange(prev => ({ ...prev, max: e.target.value }))}
                      className="range-input"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Search Results Info */}
            {hasSearched && (
              <div className="search-info">
                <p>
                  {searchLoading ? (
                    <>
                      <Loader size={16} className="inline-spinner" />
                      Searching bounties...
                    </>
                  ) : (
                    <>Found {searchResults.length} bounties for "{searchTerm}"</>
                  )}
                </p>
                {!searchLoading && (
                  <button 
                    className="clear-search"
                    onClick={() => {
                      setSearchTerm('')
                      setHasSearched(false)
                      setSearchResults([])
                    }}
                  >
                    Clear search
                  </button>
                )}
              </div>
            )}

            {/* Bounties Stats */}
            <div className="bounties-stats">
              <div className="stat-card">
                <h3>Total Bounties</h3>
                <p className="stat-number">{displayBounties.length}</p>
              </div>
              <div className="stat-card">
                <h3>Open Bounties</h3>
                <p className="stat-number">{displayBounties.filter(b => b.status === 'open').length}</p>
              </div>
              <div className="stat-card">
                <h3>Total Rewards</h3>
                <p className="stat-number">
                  ${displayBounties.reduce((sum, b) => sum + parseFloat(b.amount), 0).toLocaleString()}
                </p>
              </div>
              <div className="stat-card">
                <h3>Active Applicants</h3>
                <p className="stat-number">{displayBounties.reduce((sum, b) => sum + b.applicants, 0)}</p>
              </div>
            </div>

            {/* Bounties List */}
            <div className="bounties-content">
              {loading && displayBounties.length === 0 ? (
                <div className="loading-state">
                  <div className="spinner"></div>
                  <p>Loading bounties...</p>
                </div>
              ) : displayBounties.length === 0 ? (
                <div className="empty-state">
                  <AlertCircle size={48} />
                  <h3>
                    {hasSearched ? 'No bounties found' : 'No bounties available'}
                  </h3>
                  <p>
                    {hasSearched 
                      ? 'Try adjusting your search criteria'
                      : 'Be the first to create a bounty'
                    }
                  </p>
                  {isConnected && (
                    <button 
                      className="btn-primary"
                      onClick={() => setShowCreateForm(true)}
                    >
                      <Plus size={16} />
                      Create First Bounty
                    </button>
                  )}
                </div>
              ) : (
                <div className="bounties-grid">
                  {displayBounties.map(renderBountyCard)}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <style jsx>{`
        .search-loader {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
        }

        .search-info {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          background: #f8f9fa;
          border-radius: 8px;
          margin-bottom: 20px;
        }

        .clear-search {
          background: none;
          border: none;
          color: #007bff;
          cursor: pointer;
          font-size: 14px;
        }

        .error-banner {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 8px;
          color: #dc2626;
          margin-bottom: 20px;
        }

        .error-banner button {
          margin-left: auto;
          padding: 4px;
          border: none;
          background: none;
          color: inherit;
          cursor: pointer;
        }

        .amount-range .range-inputs {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .range-input {
          flex: 1;
          padding: 6px 8px;
          border: 1px solid #e0e0e0;
          border-radius: 4px;
          font-size: 12px;
        }

        .inline-spinner {
          animation: spin 1s linear infinite;
          margin-right: 8px;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

export default Bounties
