import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Search, Filter, Star, GitFork, Eye, Calendar, Code, TrendingUp, Plus, Settings, Trash2, Edit3, Copy, Globe, Lock, AlertCircle, X, Check, MoreHorizontal, ExternalLink, Download, Upload, Loader } from 'lucide-react'
import apiService from '../services/api'
import dataService from '../services/dataService'
import searchService from '../services/searchService'
import { useWallet } from '../services/walletService.jsx'
import NewRepositoryModal from './NewRepositoryModal'

function Repositories() {
  // Authentication state - prioritize useWallet if available, fallback to apiService
  const walletService = useWallet ? useWallet() : null
  const isConnected = walletService?.isConnected || false
  const currentUser = walletService?.currentUser || null
  
  // Legacy authentication fallback
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [legacyUser, setLegacyUser] = useState(null)
  
  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('')
  const [filterLanguage, setFilterLanguage] = useState('all')
  const [sortBy, setSortBy] = useState('stars') // Legacy default, will map to 'Stars' for new API
  const [searchResults, setSearchResults] = useState([])
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  
  // UI state
  const [loading, setLoading] = useState(false)
  const [searchLoading, setSearchLoading] = useState(false)
  const [userRepositories, setUserRepositories] = useState([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedRepo, setSelectedRepo] = useState(null)
  const [showDropdown, setShowDropdown] = useState(null)
  const [error, setError] = useState(null)
  const [hasSearched, setHasSearched] = useState(false)

  // Repository forms state
  const [editFormData, setEditFormData] = useState({
    description: '',
    settings: {
      defaultBranch: 'main',
      allowForking: true,
      allowIssues: true,
      allowWiki: true,
      allowProjects: true,
      visibility: { Public: null },
      license: '',
      topics: []
    }
  })

  const [newTopic, setNewTopic] = useState('')

  // Mock repositories for fallback
  const mockRepositories = [
    {
      id: 1,
      owner: "ethereum",
      name: "defi-yield-farming",
      description: "Advanced yield farming protocol with automated compounding strategies for maximum returns",
      language: "Solidity",
      languageColor: "#3C3C3D",
      stars: 2847,
      forks: 456,
      watchers: 123,
      lastUpdated: "2 hours ago",
      topics: ["defi", "yield-farming", "smart-contracts", "ethereum"],
      isPrivate: false
    }
  ]

  // Initialize data on component mount
  useEffect(() => {
    initializeData()
  }, [isConnected, isAuthenticated])

  // Handle search with debouncing
  useEffect(() => {
    if (searchTerm.trim().length > 0) {
      handleSearch()
      handleSuggestions()
    } else {
      setSearchResults([])
      setSuggestions([])
      setHasSearched(false)
      setShowSuggestions(false)
    }
  }, [searchTerm, filterLanguage, sortBy])

  const initializeData = async () => {
    setLoading(true)
    setError(null)
    
    try {
      // Try new wallet service first
      if (isConnected && currentUser) {
        await fetchUserRepositories()
      } else {
        // Fallback to legacy API service
        const initialized = await apiService.init()
        if (initialized) {
          setIsAuthenticated(apiService.isAuthenticated)
          setLegacyUser(apiService.currentUser)
          
          if (apiService.isAuthenticated && apiService.currentUser) {
            await fetchUserRepositories()
          }
        } else {
          setError('Failed to connect to backend. Please ensure DFX is running on localhost:4943')
        }
      }
    } catch (err) {
      console.error('Failed to initialize:', err)
      if (err.message && err.message.includes('ERR_CONNECTION_REFUSED')) {
        setError('Backend connection failed. Please start DFX with: dfx start')
      } else {
        setError('Failed to load repositories')
      }
    } finally {
      setLoading(false)
    }
  }

  const fetchUserRepositories = async () => {
    try {
      // Use new service if available
      if (dataService && (isConnected || isAuthenticated)) {
        const principal = currentUser?.principal || (legacyUser && apiService.getPrincipal())
        if (principal) {
          const result = await dataService.listRepositories(principal)
          if (result.success) {
            setUserRepositories(result.data.repositories || [])
            return
          } else {
            console.warn('Failed to fetch repositories:', result.error)
          }
        }
      }
      
      // Fallback to legacy API service
      if (apiService.isAuthenticated) {
        const principal = apiService.getPrincipal()
        if (principal) {
          const result = await apiService.listRepositories(principal)
          if (result.success) {
            setUserRepositories(result.data.repositories || [])
          } else {
            console.warn('Failed to fetch repositories:', result.error)
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch user repositories:', error)
    }
  }

  const handleSearch = useCallback(async () => {
    if (!searchTerm.trim()) return

    setSearchLoading(true)
    setError(null)

    try {
      // Try new search service first
      if (searchService?.debouncedRepositorySearch) {
        const filters = {
          language: filterLanguage !== 'all' ? filterLanguage : undefined,
          pagination: { page: 0, limit: 20 }
        }

        const result = await searchService.debouncedRepositorySearch(searchTerm, filters)
        
        if (result.success) {
          setSearchResults(result.data.repositories || [])
          setHasSearched(true)
        } else {
          setError(parseError(result.error))
          setSearchResults([])
        }
      } else {
        // Fallback to basic filtering of user repositories
        const filtered = (userRepositories.length > 0 ? userRepositories : mockRepositories)
          .filter(repo => 
            repo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (repo.description && repo.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (repo.topics && repo.topics.some(topic => topic.toLowerCase().includes(searchTerm.toLowerCase())))
          )
        setSearchResults(filtered)
        setHasSearched(true)
      }
    } catch (err) {
      console.error('Search failed:', err)
      setError('Search failed. Please try again.')
      setSearchResults([])
    } finally {
      setSearchLoading(false)
    }
  }, [searchTerm, filterLanguage, sortBy, userRepositories])

  const handleSuggestions = useCallback(async () => {
    if (!searchTerm.trim() || searchTerm.length < 2) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    try {
      if (searchService?.debouncedSuggestions) {
        const result = await searchService.debouncedSuggestions(searchTerm, 5)
        if (result.success) {
          setSuggestions(result.data || [])
          setShowSuggestions(result.data?.length > 0)
        }
      }
    } catch (err) {
      console.error('Suggestions failed:', err)
    }
  }, [searchTerm])

  const handleSuggestionClick = (suggestion) => {
    setSearchTerm(suggestion)
    setShowSuggestions(false)
  }

  const handleRepositoryCreated = async (newRepo) => {
    // Refresh the repository list
    await fetchUserRepositories()
    setError(null)
  }

  const handleEditRepository = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const service = dataService || apiService
      const result = await service.updateRepository(selectedRepo.id, editFormData)
      
      if (result.success) {
        setShowEditModal(false)
        setSelectedRepo(null)
        await fetchUserRepositories()
        alert('Repository updated successfully!')
      } else {
        setError(parseError(result.error))
      }
    } catch (error) {
      console.error('Failed to update repository:', error)
      setError('Failed to update repository. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteRepository = async (repositoryId) => {
    if (!confirm('Are you sure you want to delete this repository? This action cannot be undone.')) {
      return
    }

    setLoading(true)
    setError(null)
    
    try {
      const service = dataService || apiService
      const result = await service.deleteRepository(repositoryId)
      
      if (result.success) {
        await fetchUserRepositories()
        alert('Repository deleted successfully!')
      } else {
        setError(parseError(result.error))
      }
    } catch (error) {
      console.error('Failed to delete repository:', error)
      setError('Failed to delete repository. Please try again.')
    } finally {
      setLoading(false)
      setShowDropdown(null)
    }
  }

  const openEditModal = (repo) => {
    setSelectedRepo(repo)
    setEditFormData({
      description: repo.description || '',
      settings: {
        defaultBranch: repo.settings?.defaultBranch || 'main',
        allowForking: repo.settings?.allowForking ?? true,
        allowIssues: repo.settings?.allowIssues ?? true,
        allowWiki: repo.settings?.allowWiki ?? true,
        allowProjects: repo.settings?.allowProjects ?? true,
        visibility: repo.isPrivate ? { Private: null } : { Public: null },
        license: repo.settings?.license || '',
        topics: repo.settings?.topics || []
      }
    })
    setShowEditModal(true)
    setShowDropdown(null)
  }

  const addTopic = () => {
    if (newTopic.trim() && !editFormData.settings.topics.includes(newTopic.trim())) {
      setEditFormData(prev => ({
        ...prev,
        settings: {
          ...prev.settings,
          topics: [...prev.settings.topics, newTopic.trim()]
        }
      }))
      setNewTopic('')
    }
  }

  const removeTopic = (topicToRemove) => {
    setEditFormData(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        topics: prev.settings.topics.filter(topic => topic !== topicToRemove)
      }
    }))
  }

  // Helper functions
  const parseError = (error) => {
    if (dataService?.parseApiError) {
      return dataService.parseApiError(error)
    }
    if (apiService?.getErrorMessage) {
      return apiService.getErrorMessage(error)
    }
    return typeof error === 'string' ? error : 'An error occurred'
  }

  const getUserPrincipal = () => {
    return currentUser?.principal?.toString() || 
           (legacyUser && apiService.getPrincipal()?.toString())
  }

  const isUserOwner = (repo) => {
    const userPrincipal = getUserPrincipal()
    return userPrincipal && (
      repo.owner === userPrincipal || 
      (repo.owner?.principal && repo.owner.principal.toString() === userPrincipal)
    )
  }

  // Determine which repositories to display
  const displayRepositories = hasSearched ? searchResults : (userRepositories.length > 0 ? userRepositories : mockRepositories)
  const languages = ['all', 'Solidity', 'TypeScript', 'Rust', 'JavaScript', 'Python', 'C++', 'Go', 'Motoko']
  const isUserLoggedIn = isConnected || isAuthenticated

  const trendingRepos = [
    { rank: 1, name: "ethereum/go-ethereum", description: "Official Go implementation of the Ethereum protocol", stars: "34.2k", language: "Go" },
    { rank: 2, name: "bitcoin/bitcoin", description: "Bitcoin Core integration/staging tree", stars: "76.1k", language: "C++" },
    { rank: 3, name: "OpenZeppelin/openzeppelin-contracts", description: "OpenZeppelin Contracts is a library for secure smart contract development", stars: "24.8k", language: "Solidity" }
  ]

  const renderRepositoryCard = (repo) => (
    <div key={repo.id} className="repository-card">
      <div className="repo-header">
        <div className="repo-title">
          <Link to={`/repo/${repo.id}`} className="repo-name-link">
            <h3>{repo.owner?.username || repo.owner}/{repo.name}</h3>
          </Link>
          <div className="repo-badges">
            <span className={`repo-privacy ${repo.isPrivate ? 'private' : 'public'}`}>
              {repo.isPrivate ? <Lock size={12} /> : <Globe size={12} />}
              {repo.isPrivate ? 'Private' : 'Public'}
            </span>
            {repo.score && (
              <span className="search-score">
                Match: {Math.round(repo.score * 100)}%
              </span>
            )}
          </div>
        </div>
        <div className="repo-actions">
          <div className="repo-stats">
            <span className="stat">
              <Star size={14} />
              {(repo.stars || 0).toLocaleString()}
            </span>
            <span className="stat">
              <GitFork size={14} />
              {repo.forks || 0}
            </span>
            {repo.watchers && (
              <span className="stat">
                <Eye size={14} />
                {repo.watchers}
              </span>
            )}
          </div>
          
          {isUserLoggedIn && isUserOwner(repo) && (
            <div className="repo-menu">
              <button 
                className="menu-trigger"
                onClick={() => setShowDropdown(showDropdown === repo.id ? null : repo.id)}
              >
                <MoreHorizontal size={16} />
              </button>
              
              {showDropdown === repo.id && (
                <div className="dropdown-menu">
                  <button onClick={() => openEditModal(repo)}>
                    <Edit3 size={14} />
                    Edit Repository
                  </button>
                  <button onClick={() => navigator.clipboard.writeText(window.location.origin + `/repo/${repo.id}`)}>
                    <Copy size={14} />
                    Copy Link
                  </button>
                  <Link to={`/repo/${repo.id}`}>
                    <ExternalLink size={14} />
                    View Repository
                  </Link>
                  <hr />
                  <button 
                    onClick={() => handleDeleteRepository(repo.id)}
                    className="danger"
                  >
                    <Trash2 size={14} />
                    Delete Repository
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      <p className="repo-description">
        {repo.description || 'No description provided.'}
      </p>
      
      {repo.matchedFields && repo.matchedFields.length > 0 && (
        <div className="matched-fields">
          <span>Matched in: {repo.matchedFields.join(', ')}</span>
        </div>
      )}
      
      {repo.topics && repo.topics.length > 0 && (
        <div className="repo-topics">
          {repo.topics.slice(0, 4).map(topic => (
            <span key={topic} className="topic-tag">{topic}</span>
          ))}
          {repo.topics.length > 4 && (
            <span className="topic-more">+{repo.topics.length - 4} more</span>
          )}
        </div>
      )}
      
      <div className="repo-footer">
        {repo.language && (
          <div className="repo-language">
            <span 
              className="language-dot" 
              style={{ backgroundColor: repo.languageColor || '#ccc' }}
            ></span>
            {repo.language}
          </div>
        )}
        <div className="repo-updated">
          <Calendar size={14} />
          Updated {repo.lastUpdated || 
            (repo.updatedAt ? new Date(Number(repo.updatedAt) / 1000000).toLocaleDateString() : 'Unknown')}
        </div>
      </div>
    </div>
  )

  return (
    <div className="repositories">
      <div className="container">
        <div className="repositories-header">
          <div className="header-content">
            <div className="header-text">
              <h1>Repositories</h1>
              <p>Explore cutting-edge blockchain projects and manage your code</p>
            </div>
            {isUserLoggedIn && (
              <button 
                className="btn-primary create-repo-btn"
                onClick={() => setShowCreateModal(true)}
                disabled={loading}
              >
                <Plus size={20} />
                New Repository
              </button>
            )}
          </div>
        </div>

        {/* Enhanced Search with Suggestions */}
        <div className="search-filters">
          <div className="search-box-container">
            <div className="search-box">
              <Search size={20} />
              <input
                type="text"
                placeholder="Search repositories by name, description, or topics..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => setShowSuggestions(suggestions.length > 0)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              />
              {searchLoading && <Loader size={16} className="search-loader spinner" />}
            </div>
            
            {/* Search Suggestions */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="search-suggestions">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    className="suggestion-item"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    <Search size={14} />
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          <div className="filters">
            <select 
              className="filter-select"
              value={filterLanguage}
              onChange={(e) => setFilterLanguage(e.target.value)}
            >
              {languages.map(lang => (
                <option key={lang} value={lang}>
                  {lang === 'all' ? 'All Languages' : lang}
                </option>
              ))}
            </select>
            
            <select 
              className="filter-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="stars">Most Stars</option>
              <option value="forks">Most Forks</option>
              <option value="updated">Recently Updated</option>
            </select>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="error-banner">
            <AlertCircle size={20} />
            <span>{error}</span>
            <button onClick={() => setError(null)}>
              <X size={16} />
            </button>
          </div>
        )}

        {/* Search Results Info */}
        {hasSearched && (
          <div className="search-info">
            <p>
              {searchLoading ? (
                <>
                  <Loader size={16} className="inline-spinner" />
                  Searching...
                </>
              ) : (
                <>Found {displayRepositories.length} repositories for "{searchTerm}"</>
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

        {/* Repository Grid */}
        <div className="repositories-grid">
          {loading && displayRepositories.length === 0 ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading repositories...</p>
            </div>
          ) : displayRepositories.length === 0 ? (
            <div className="empty-state">
              <Code size={48} />
              <h3>
                {hasSearched ? 'No repositories found' : 'No repositories yet'}
              </h3>
              <p>
                {hasSearched 
                  ? 'Try adjusting your search terms or filters'
                  : isUserLoggedIn 
                    ? 'Create your first repository to get started'
                    : 'Connect your wallet to view your repositories'
                }
              </p>
              {isUserLoggedIn && (
                <button 
                  className="btn-primary"
                  onClick={() => setShowCreateModal(true)}
                >
                  <Plus size={20} />
                  Create repository
                </button>
              )}
            </div>
          ) : (
            displayRepositories.map(renderRepositoryCard)
          )}
        </div>

        {/* Trending Section */}
        {!hasSearched && (
          <div className="trending-section">
            <div className="section-header">
              <h2>
                <TrendingUp size={24} />
                Trending This Week
              </h2>
            </div>
            
            <div className="trending-repos">
              {trendingRepos.map(repo => (
                <div key={repo.rank} className="trending-card">
                  <div className="trending-rank">#{repo.rank}</div>
                  <div className="trending-content">
                    <h4>{repo.name}</h4>
                    <p>{repo.description}</p>
                    <div className="trending-stats">
                      <span><Star size={14} /> {repo.stars}</span>
                      <span>{repo.language}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Create Repository Modal */}
      <NewRepositoryModal 
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleRepositoryCreated}
      />

      {/* Edit Repository Modal */}
      {showEditModal && selectedRepo && (
        <div className="modal-overlay" onClick={() => !loading && setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit repository</h2>
              <button 
                className="modal-close"
                onClick={() => setShowEditModal(false)}
                disabled={loading}
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleEditRepository} className="edit-repo-form">
              <div className="form-group">
                <label htmlFor="edit-description">Description</label>
                <textarea
                  id="edit-description"
                  value={editFormData.description}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="A short description of your project"
                  rows={3}
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="edit-topics">Topics</label>
                <div className="topics-input">
                  <input
                    id="edit-topics"
                    type="text"
                    value={newTopic}
                    onChange={(e) => setNewTopic(e.target.value)}
                    placeholder="Add a topic"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTopic())}
                    disabled={loading}
                  />
                  <button type="button" onClick={addTopic} disabled={loading || !newTopic.trim()}>
                    Add
                  </button>
                </div>
                <div className="topics-list">
                  {editFormData.settings.topics.map(topic => (
                    <span key={topic} className="topic-tag">
                      {topic}
                      <button 
                        type="button"
                        onClick={() => removeTopic(topic)}
                        disabled={loading}
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <h4>Features</h4>
                <div className="checkbox-group">
                  <label className="checkbox-option">
                    <input
                      type="checkbox"
                      checked={editFormData.settings.allowIssues}
                      onChange={(e) => setEditFormData(prev => ({
                        ...prev,
                        settings: { ...prev.settings, allowIssues: e.target.checked }
                      }))}
                      disabled={loading}
                    />
                    <span>Issues</span>
                  </label>
                  
                  <label className="checkbox-option">
                    <input
                      type="checkbox"
                      checked={editFormData.settings.allowWiki}
                      onChange={(e) => setEditFormData(prev => ({
                        ...prev,
                        settings: { ...prev.settings, allowWiki: e.target.checked }
                      }))}
                      disabled={loading}
                    />
                    <span>Wiki</span>
                  </label>
                  
                  <label className="checkbox-option">
                    <input
                      type="checkbox"
                      checked={editFormData.settings.allowProjects}
                      onChange={(e) => setEditFormData(prev => ({
                        ...prev,
                        settings: { ...prev.settings, allowProjects: e.target.checked }
                      }))}
                      disabled={loading}
                    />
                    <span>Projects</span>
                  </label>
                </div>
              </div>

              <div className="form-actions">
                <button 
                  type="button" 
                  className="btn-secondary"
                  onClick={() => setShowEditModal(false)}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
        </div>
      )}

      {/* Enhanced Styles */}
      <style jsx>{`
        .repositories {
          min-height: 100vh;
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
          padding: 20px 0;
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
        }

        .repositories-header {
          margin-bottom: 30px;
        }

        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
        }

        .header-text h1 {
          font-size: 2.5rem;
          font-weight: 700;
          color: #1a202c;
          margin: 0 0 8px 0;
        }

        .header-text p {
          color: #718096;
          font-size: 1.1rem;
          margin: 0;
        }

        .search-filters {
          display: flex;
          gap: 16px;
          margin-bottom: 30px;
          flex-wrap: wrap;
        }

        .search-box-container {
          position: relative;
          flex: 1;
          min-width: 300px;
        }

        .search-box {
          display: flex;
          align-items: center;
          background: white;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          padding: 12px 16px;
          gap: 12px;
          transition: border-color 0.2s ease;
          position: relative;
        }

        .search-box:focus-within {
          border-color: #4299e1;
          box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.1);
        }

        .search-box input {
          flex: 1;
          border: none;
          outline: none;
          font-size: 16px;
          background: transparent;
        }

        .search-loader {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          animation: spin 1s linear infinite;
        }

        .search-suggestions {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: white;
          border: 1px solid #e0e0e0;
          border-top: none;
          border-radius: 0 0 8px 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          z-index: 1000;
          max-height: 200px;
          overflow-y: auto;
        }

        .suggestion-item {
          display: flex;
          align-items: center;
          gap: 8px;
          width: 100%;
          padding: 8px 12px;
          border: none;
          background: white;
          text-align: left;
          cursor: pointer;
          transition: background-color 0.2s ease;
        }

        .suggestion-item:hover {
          background: #f5f5f5;
        }

        .filters {
          display: flex;
          gap: 12px;
        }

        .filter-select {
          padding: 12px 16px;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          background: white;
          font-size: 14px;
          cursor: pointer;
          transition: border-color 0.2s ease;
          min-width: 120px;
        }

        .filter-select:focus {
          border-color: #4299e1;
          outline: none;
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

        .inline-spinner {
          animation: spin 1s linear infinite;
          margin-right: 8px;
        }

        .repositories-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 24px;
          margin-bottom: 40px;
        }

        .repository-card {
          background: white;
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          transition: all 0.2s ease;
          border: 1px solid #e2e8f0;
        }

        .repository-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px -5px rgba(0, 0, 0, 0.1);
        }

        .repo-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 16px;
        }

        .repo-title h3 {
          margin: 0 0 8px 0;
          color: #1a202c;
          font-size: 1.2rem;
          font-weight: 600;
        }

        .repo-name-link {
          text-decoration: none;
          color: inherit;
        }

        .repo-name-link:hover h3 {
          color: #4299e1;
        }

        .repo-badges {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .repo-privacy {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 500;
        }

        .repo-privacy.public {
          background: #c6f6d5;
          color: #22543d;
        }

        .repo-privacy.private {
          background: #fed7d7;
          color: #742a2a;
        }

        .search-score {
          background: #e3f2fd;
          color: #1976d2;
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 12px;
        }

        .repo-actions {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .repo-stats {
          display: flex;
          gap: 16px;
        }

        .stat {
          display: flex;
          align-items: center;
          gap: 4px;
          color: #718096;
          font-size: 14px;
        }

        .repo-menu {
          position: relative;
        }

        .menu-trigger {
          padding: 8px;
          border: none;
          background: none;
          border-radius: 8px;
          cursor: pointer;
          transition: background-color 0.2s ease;
        }

        .menu-trigger:hover {
          background: #f7fafc;
        }

        .dropdown-menu {
          position: absolute;
          top: 100%;
          right: 0;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          z-index: 100;
          min-width: 180px;
          overflow: hidden;
        }

        .dropdown-menu button,
        .dropdown-menu a {
          display: flex;
          align-items: center;
          gap: 8px;
          width: 100%;
          padding: 12px 16px;
          border: none;
          background: none;
          text-align: left;
          cursor: pointer;
          font-size: 14px;
          color: #4a5568;
          text-decoration: none;
          transition: background-color 0.2s ease;
        }

        .dropdown-menu button:hover,
        .dropdown-menu a:hover {
          background: #f7fafc;
        }

        .dropdown-menu button.danger:hover {
          background: #fed7d7;
          color: #c53030;
        }

        .dropdown-menu hr {
          margin: 0;
          border: none;
          border-top: 1px solid #e2e8f0;
        }

        .repo-description {
          color: #4a5568;
          line-height: 1.5;
          margin-bottom: 16px;
        }

        .matched-fields {
          padding: 4px 0;
          font-size: 12px;
          color: #666;
          font-style: italic;
        }

        .repo-topics {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 16px;
        }

        .topic-tag {
          background: #edf2f7;
          color: #4a5568;
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 500;
        }

        .topic-more {
          color: #718096;
          font-size: 12px;
          font-style: italic;
        }

        .repo-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          color: #718096;
          font-size: 14px;
        }

        .repo-language {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .language-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
        }

        .repo-updated {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .loading-state, .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px 20px;
          text-align: center;
          grid-column: 1 / -1;
        }

        .loading-state .spinner, .loading-spinner {
          width: 32px;
          height: 32px;
          border: 3px solid #f3f3f3;
          border-top: 3px solid #007bff;
          border-radius: 50%;
          margin-bottom: 16px;
          animation: spin 1s linear infinite;
        }

        .empty-state h3 {
          margin: 16px 0 8px 0;
          color: #4a5568;
        }

        .empty-state p {
          color: #718096;
          margin-bottom: 20px;
        }

        .trending-section {
          margin-top: 60px;
        }

        .section-header h2 {
          display: flex;
          align-items: center;
          gap: 12px;
          color: #1a202c;
          margin-bottom: 24px;
        }

        .trending-repos {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
        }

        .trending-card {
          display: flex;
          gap: 16px;
          background: white;
          border-radius: 12px;
          padding: 20px;
          border: 1px solid #e2e8f0;
        }

        .trending-rank {
          font-size: 1.5rem;
          font-weight: 700;
          color: #4299e1;
          min-width: 40px;
        }

        .trending-content h4 {
          margin: 0 0 8px 0;
          color: #1a202c;
        }

        .trending-content p {
          color: #718096;
          margin: 0 0 12px 0;
          font-size: 14px;
        }

        .trending-stats {
          display: flex;
          gap: 16px;
          font-size: 14px;
          color: #718096;
        }

        .trending-stats span {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .btn-primary {
          background: linear-gradient(135deg, #4299e1 0%, #3182ce 100%);
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .btn-primary:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(66, 153, 225, 0.4);
        }

        .btn-primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .btn-secondary {
          background: white;
          color: #4a5568;
          border: 2px solid #e2e8f0;
          padding: 12px 24px;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-secondary:hover:not(:disabled) {
          border-color: #cbd5e0;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }

        .modal-content {
          background: white;
          border-radius: 16px;
          max-width: 600px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 24px 24px 0 24px;
          border-bottom: 1px solid #e2e8f0;
          margin-bottom: 24px;
        }

        .modal-header h2 {
          margin: 0;
          color: #1a202c;
        }

        .modal-close {
          padding: 8px;
          border: none;
          background: none;
          border-radius: 8px;
          cursor: pointer;
          transition: background-color 0.2s ease;
        }

        .modal-close:hover {
          background: #f7fafc;
        }

        .edit-repo-form {
          padding: 0 24px 24px 24px;
        }

        .form-group {
          margin-bottom: 24px;
        }

        .form-group label {
          display: block;
          margin-bottom: 8px;
          font-weight: 600;
          color: #4a5568;
        }

        .form-group input,
        .form-group textarea {
          width: 100%;
          padding: 12px 16px;
          border: 2px solid #e2e8f0;
          border-radius: 8px;
          font-size: 14px;
          transition: border-color 0.2s ease;
          box-sizing: border-box;
        }

        .form-group input:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: #4299e1;
        }

        .topics-input {
          display: flex;
          gap: 8px;
          margin-bottom: 12px;
        }

        .topics-input input {
          flex: 1;
        }

        .topics-input button {
          padding: 8px 16px;
          background: #4299e1;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
        }

        .topics-list {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .topics-list .topic-tag {
          display: flex;
          align-items: center;
          gap: 6px;
          background: #edf2f7;
          padding: 6px 10px;
          border-radius: 12px;
          font-size: 12px;
        }

        .topics-list .topic-tag button {
          padding: 2px;
          border: none;
          background: none;
          cursor: pointer;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .checkbox-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .checkbox-option {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 12px;
          cursor: pointer;
        }

        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          margin-top: 32px;
          padding-top: 24px;
          border-top: 1px solid #e2e8f0;
        }

        .loading-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(255, 255, 255, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2000;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .header-content {
            flex-direction: column;
            align-items: stretch;
          }

          .search-filters {
            flex-direction: column;
          }

          .repositories-grid {
            grid-template-columns: 1fr;
          }

          .repo-header {
            flex-direction: column;
            gap: 12px;
          }

          .repo-actions {
            justify-content: space-between;
          }

          .trending-repos {
            grid-template-columns: 1fr;
          }

          .search-box-container {
            min-width: auto;
          }
        }
      `}</style>
    </div>
  )
}

export default Repositories
