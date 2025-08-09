import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { 
  User, MapPin, Link as LinkIcon, Calendar, GitBranch, Star, 
  GitCommit, Users, Settings, Edit, Plus, X, Save, Award, Code,
  Building2, Mail, Twitter, Globe, ArrowLeft, ExternalLink,
  GitFork, Eye, TrendingUp, Search, Filter, Pin, PinOff
} from 'lucide-react'

function UserProfile() {
  const { username } = useParams()
  const [activeTab, setActiveTab] = useState('overview')
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('updated')
  const [filterBy, setFilterBy] = useState('all')
  const [starredRepos, setStarredRepos] = useState(new Set([1, 3])) // Initially starred repos
  const [pinnedRepoIds, setPinnedRepoIds] = useState(new Set([1, 2, 3])) // Initially pinned repos

  // Mock user data - in a real app, this would be fetched based on username
  const userData = {
    ethereum: {
      username: "ethereum",
      name: "Alex Chen", 
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
      bio: "Full-stack Web3 developer passionate about DeFi protocols and smart contract security. Building the decentralized future one commit at a time.",
      location: "San Francisco, CA",
      company: "DeFi Labs",
      website: "https://alexchen.dev",
      twitter: "@alexchen_dev", 
      email: "alex@defilabs.com",
      followers: 1247,
      following: 89,
      publicRepos: 47,
      joinDate: "March 2021",
      contributions: 2847,
      achievements: ["Web3 Pioneer", "Smart Contract Auditor", "DeFi Expert", "Open Source Contributor"],
      languages: ["Solidity", "TypeScript", "Rust", "JavaScript", "Python", "Go"],
      organizations: ["DeFi Labs", "Ethereum Foundation", "OpenZeppelin", "ConsenSys"],
      isVerified: true,
      status: "Building the future of DeFi 🚀",
      pinnedRepos: [
        {
          id: 1,
          name: "defi-yield-farming",
          description: "Advanced yield farming protocol with automated compounding strategies",
          language: "Solidity",
          languageColor: "#3C3C3D",
          stars: 234,
          forks: 45
        },
        {
          id: 2,
          name: "cross-chain-bridge",
          description: "Secure cross-chain asset bridge supporting multiple EVM chains", 
          language: "TypeScript",
          languageColor: "#2b7489",
          stars: 156,
          forks: 23
        },
        {
          id: 3,
          name: "smart-contract-auditor",
          description: "Automated smart contract vulnerability scanner",
          language: "Rust", 
          languageColor: "#dea584",
          stars: 89,
          forks: 12
        }
      ]
    },
    "web3-labs": {
      username: "web3-labs",
      name: "Web3 Labs",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
      bio: "Leading Web3 development company specializing in DeFi, NFTs, and blockchain infrastructure.",
      location: "London, UK", 
      company: "Web3 Labs Ltd",
      website: "https://web3labs.com",
      twitter: "@web3labs",
      email: "hello@web3labs.com",
      followers: 3421,
      following: 156,
      publicRepos: 89,
      joinDate: "January 2020", 
      contributions: 5234,
      achievements: ["Enterprise Partner", "Blockchain Innovator", "DeFi Pioneer"],
      languages: ["Solidity", "TypeScript", "Go", "Rust"],
      organizations: ["Web3 Labs", "Ethereum Enterprise Alliance"],
      isVerified: true,
      status: "Accelerating Web3 adoption 💡"
    }
  }

  const user = userData[username] || userData["ethereum"] // Default fallback

  const [repositories, setRepositories] = useState([
    {
      id: 1,
      name: "defi-yield-optimizer",
      description: "Advanced yield farming optimizer with automated rebalancing strategies",
      language: "Solidity",
      languageColor: "#3C3C3D", 
      stars: 234,
      forks: 45,
      isPrivate: false,
      lastUpdated: "Updated 2 hours ago",
      updatedDate: new Date(Date.now() - 2 * 60 * 60 * 1000)
    },
    {
      id: 2,
      name: "cross-chain-bridge", 
      description: "Secure cross-chain asset bridge supporting multiple EVM chains",
      language: "TypeScript",
      languageColor: "#2b7489",
      stars: 156,
      forks: 23,
      isPrivate: false,
      lastUpdated: "Updated yesterday",
      updatedDate: new Date(Date.now() - 24 * 60 * 60 * 1000)
    },
    {
      id: 3,
      name: "smart-contract-auditor",
      description: "Automated smart contract vulnerability scanner", 
      language: "Rust",
      languageColor: "#dea584",
      stars: 89,
      forks: 12,
      isPrivate: false,
      lastUpdated: "Updated 3 days ago",
      updatedDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
    },
    {
      id: 4,
      name: "nft-marketplace-v2",
      description: "Next-generation NFT marketplace with cross-chain support",
      language: "TypeScript",
      languageColor: "#2b7489",
      stars: 178,
      forks: 34,
      isPrivate: false,
      lastUpdated: "Updated 1 week ago",
      updatedDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    },
    {
      id: 5,
      name: "dao-governance-suite",
      description: "Complete DAO governance framework with voting and treasury management",
      language: "Solidity", 
      languageColor: "#3C3C3D",
      stars: 112,
      forks: 28,
      isPrivate: false,
      lastUpdated: "Updated 2 weeks ago",
      updatedDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
    },
    {
      id: 6,
      name: "web3-wallet-sdk",
      description: "Universal Web3 wallet integration SDK",
      language: "JavaScript",
      languageColor: "#f1e05a",
      stars: 67,
      forks: 15,
      isPrivate: false,
      lastUpdated: "Updated 3 weeks ago",
      updatedDate: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000)
    },
    {
      id: 7,
      name: "blockchain-analytics",
      description: "Advanced blockchain data analytics platform",
      language: "Python",
      languageColor: "#3572A5",
      stars: 203,
      forks: 56,
      isPrivate: false,
      lastUpdated: "Updated 1 month ago",
      updatedDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    },
    {
      id: 8,
      name: "metaverse-engine",
      description: "High-performance 3D engine for metaverse applications",
      language: "C++",
      languageColor: "#f34b7d",
      stars: 445,
      forks: 78,
      isPrivate: false,
      lastUpdated: "Updated 6 weeks ago",
      updatedDate: new Date(Date.now() - 42 * 24 * 60 * 60 * 1000)
    }
  ])

  const activities = [
    { type: 'commit', repo: 'defi-yield-optimizer', message: 'Add liquidity pool optimization', time: '2 hours ago', icon: GitCommit },
    { type: 'star', repo: 'ethereum/go-ethereum', message: 'Starred repository', time: '5 hours ago', icon: Star },
    { type: 'fork', repo: 'OpenZeppelin/openzeppelin-contracts', message: 'Forked repository', time: '1 day ago', icon: GitFork },
    { type: 'commit', repo: 'cross-chain-bridge', message: 'Fix bridge validation logic', time: '2 days ago', icon: GitCommit },
    { type: 'star', repo: 'rust-lang/rust', message: 'Starred repository', time: '3 days ago', icon: Star },
    { type: 'commit', repo: 'smart-contract-auditor', message: 'Improve vulnerability detection', time: '4 days ago', icon: GitCommit }
  ]

  const contributionData = Array.from({ length: 365 }, (_, i) => ({
    date: new Date(Date.now() - (364 - i) * 24 * 60 * 60 * 1000),
    count: Math.floor(Math.random() * 5)
  }))

  // Filter and sort repositories
  const filteredRepositories = repositories
    .filter(repo => {
      const matchesSearch = repo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           repo.description.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesFilter = filterBy === 'all' || 
                           (filterBy === 'starred' && starredRepos.has(repo.id)) ||
                           (filterBy === 'pinned' && pinnedRepoIds.has(repo.id))
      return matchesSearch && matchesFilter
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'stars':
          return b.stars - a.stars
        case 'updated':
        default:
          return b.updatedDate - a.updatedDate
      }
    })

  const toggleStar = (repoId) => {
    setStarredRepos(prev => {
      const newStarred = new Set(prev)
      if (newStarred.has(repoId)) {
        newStarred.delete(repoId)
        // Update repository stars count
        setRepositories(repos => repos.map(repo => 
          repo.id === repoId ? { ...repo, stars: repo.stars - 1 } : repo
        ))
      } else {
        newStarred.add(repoId)
        // Update repository stars count
        setRepositories(repos => repos.map(repo => 
          repo.id === repoId ? { ...repo, stars: repo.stars + 1 } : repo
        ))
      }
      return newStarred
    })
  }

  const togglePin = (repoId) => {
    setPinnedRepoIds(prev => {
      const newPinned = new Set(prev)
      if (newPinned.has(repoId)) {
        newPinned.delete(repoId)
      } else {
        newPinned.add(repoId)
      }
      return newPinned
    })
  }

  return (
    <div className="user-profile">
      <div className="container">
        {/* Back Navigation */}
        <div className="back-navigation">
          <Link to="/repositories" className="back-btn">
            <ArrowLeft size={16} />
            Back to Repositories
          </Link>
        </div>

        {/* Profile Header */}
        <div className="user-profile-header">
          <div className="user-main-info">
            <div className="user-avatar-section">
              <img src={user.avatar} alt={user.name} className="user-avatar-large" />
              {user.isVerified && (
                <div className="verified-badge">
                  <Award size={16} />
                  Verified
                </div>
              )}
            </div>
            
            <div className="user-info-section">
              <div className="user-name-section">
                <h1>{user.name}</h1>
                <p className="user-username">@{user.username}</p>
                {user.status && (
                  <div className="user-status">
                    <span className="status-emoji">💭</span>
                    <span>{user.status}</span>
                  </div>
                )}
              </div>
              
              <p className="user-bio">{user.bio}</p>
              
              <div className="user-meta">
                {user.company && (
                  <div className="meta-item">
                    <Building2 size={16} />
                    <span>{user.company}</span>
                  </div>
                )}
                {user.location && (
                  <div className="meta-item">
                    <MapPin size={16} />
                    <span>{user.location}</span>
                  </div>
                )}
                {user.website && (
                  <div className="meta-item">
                    <Globe size={16} />
                    <a href={user.website} target="_blank" rel="noopener noreferrer">
                      {user.website}
                    </a>
                  </div>
                )}
                {user.twitter && (
                  <div className="meta-item">
                    <Twitter size={16} />
                    <a href={`https://twitter.com/${user.twitter.substring(1)}`} target="_blank" rel="noopener noreferrer">
                      {user.twitter}
                    </a>
                  </div>
                )}
                {user.email && (
                  <div className="meta-item">
                    <Mail size={16} />
                    <a href={`mailto:${user.email}`}>{user.email}</a>
                  </div>
                )}
                <div className="meta-item">
                  <Calendar size={16} />
                  <span>Joined {user.joinDate}</span>
                </div>
              </div>
              
              <div className="user-stats-overview">
                <div className="stat">
                  <strong>{user.followers.toLocaleString()}</strong> followers
                </div>
                <div className="stat">
                  <strong>{user.following}</strong> following
                </div>
                <div className="stat">
                  <strong>{user.publicRepos}</strong> repositories
                </div>
                <div className="stat">
                  <strong>{user.contributions.toLocaleString()}</strong> contributions
                </div>
              </div>

              <div className="user-actions">
                <button className="btn-primary">
                  <Users size={16} />
                  Follow
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar Info */}
          <div className="user-sidebar">
            <div className="achievements">
              <div className="section-header">
                <h3>
                  <Award size={16} />
                  Achievements
                </h3>
              </div>
              <div className="badges">
                {user.achievements.map((achievement, index) => (
                  <span key={index} className="achievement-badge">
                    {achievement}
                  </span>
                ))}
              </div>
            </div>

            <div className="languages">
              <div className="section-header">
                <h3>
                  <Code size={16} />
                  Languages
                </h3>
              </div>
              <div className="language-list">
                {user.languages.map((language, index) => (
                  <span key={index} className="language-item">
                    {language}
                  </span>
                ))}
              </div>
            </div>

            <div className="organizations">
              <div className="section-header">
                <h3>
                  <Users size={16} />
                  Organizations
                </h3>
              </div>
              <div className="org-list">
                {user.organizations.map((org, index) => (
                  <span key={index} className="org-item">
                    {org}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Profile Navigation */}
        <div className="user-profile-nav">
          <button 
            className={`nav-tab ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <User size={16} />
            Overview
          </button>
          <button 
            className={`nav-tab ${activeTab === 'repositories' ? 'active' : ''}`}
            onClick={() => setActiveTab('repositories')}
          >
            <GitBranch size={16} />
            Repositories
            <span className="tab-count">{user.publicRepos}</span>
          </button>
          <button 
            className={`nav-tab ${activeTab === 'activity' ? 'active' : ''}`}
            onClick={() => setActiveTab('activity')}
          >
            Activity
          </button>
          <button 
            className={`nav-tab ${activeTab === 'contributions' ? 'active' : ''}`}
            onClick={() => setActiveTab('contributions')}
          >
            Contributions
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="overview-section">
            {/* Pinned Repositories */}
            <div className="pinned-repos">
              <div className="section-header">
                <h2>
                  <Pin size={20} />
                  Pinned Repositories
                </h2>
                <span className="pinned-count">{pinnedRepoIds.size} pinned</span>
              </div>
              <div className="pinned-repos-grid">
                {user.pinnedRepos?.map((repo, index) => (
                  <Link key={index} to={`/${user.username}/${repo.name}`} className="pinned-repo-card">
                    <div className="pinned-repo-header">
                      <h3>{repo.name}</h3>
                      <span className="repo-privacy">Public</span>
                    </div>
                    <p className="pinned-repo-description">{repo.description}</p>
                    <div className="pinned-repo-footer">
                      <div className="repo-language">
                        <span 
                          className="language-dot" 
                          style={{ backgroundColor: repo.languageColor }}
                        ></span>
                        {repo.language}
                      </div>
                      <div className="repo-stats">
                        <span><Star size={14} /> {repo.stars}</span>
                        <span><GitFork size={14} /> {repo.forks}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="recent-activity">
              <div className="section-header">
                <h2>Recent Activity</h2>
              </div>
              <div className="activity-feed">
                {activities.slice(0, 6).map((activity, index) => {
                  const IconComponent = activity.icon
                  return (
                    <div key={index} className="activity-item">
                      <div className="activity-icon">
                        <IconComponent size={16} />
                      </div>
                      <div className="activity-content">
                        <p>{activity.message} in <strong>{activity.repo}</strong></p>
                        <span className="activity-time">{activity.time}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'repositories' && (
          <div className="repositories-section">
            <div className="repositories-header">
              <h2>Public Repositories ({filteredRepositories.length})</h2>
              <div className="repo-controls">
                <div className="repo-search-container">
                  <Search size={16} className="search-icon" />
                  <input 
                    type="text" 
                    placeholder="Find a repository..." 
                    className="repo-search"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <select 
                  className="repo-filter"
                  value={filterBy}
                  onChange={(e) => setFilterBy(e.target.value)}
                >
                  <option value="all">All repositories</option>
                  <option value="starred">Starred repositories</option>
                  <option value="pinned">Pinned repositories</option>
                </select>
                <select 
                  className="repo-sort"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="updated">Recently updated</option>
                  <option value="name">Name</option>
                  <option value="stars">Most stars</option>
                </select>
              </div>
            </div>
            
            <div className="user-repos">
              {filteredRepositories.map(repo => (
                <div key={repo.id} className="user-repo-card">
                  <div className="repo-header">
                    <div className="repo-title">
                      <Link to={`/${user.username}/${repo.name}`} className="repo-name-link">
                        <h3>{repo.name}</h3>
                      </Link>
                      {repo.isPrivate && <span className="private-badge">Private</span>}
                      {pinnedRepoIds.has(repo.id) && (
                        <span className="pinned-indicator">
                          <Pin size={12} />
                          Pinned
                        </span>
                      )}
                    </div>
                    <div className="repo-actions">
                      <button 
                        className={`action-btn pin-btn ${pinnedRepoIds.has(repo.id) ? 'pinned' : ''}`}
                        onClick={() => togglePin(repo.id)}
                        title={pinnedRepoIds.has(repo.id) ? 'Unpin repository' : 'Pin repository'}
                      >
                        {pinnedRepoIds.has(repo.id) ? <PinOff size={14} /> : <Pin size={14} />}
                      </button>
                      <button 
                        className={`action-btn star-btn ${starredRepos.has(repo.id) ? 'starred' : ''}`}
                        onClick={() => toggleStar(repo.id)}
                        title={starredRepos.has(repo.id) ? 'Unstar repository' : 'Star repository'}
                      >
                        <Star size={14} />
                      </button>
                    </div>
                  </div>
                  <p className="repo-description">{repo.description}</p>
                  <div className="repo-footer">
                    <div className="repo-language">
                      <span 
                        className="language-dot" 
                        style={{ backgroundColor: repo.languageColor }}
                      ></span>
                      {repo.language}
                    </div>
                    <div className="repo-stats">
                      <span><Star size={14} /> {repo.stars}</span>
                      <span><GitFork size={14} /> {repo.forks}</span>
                    </div>
                    <div className="repo-updated">{repo.lastUpdated}</div>
                  </div>
                </div>
              ))}
            </div>
            
            {filteredRepositories.length === 0 && (
              <div className="no-results">
                <Search size={48} />
                <h3>No repositories found</h3>
                <p>Try adjusting your search or filter criteria.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="activity-section">
            <div className="activity-header">
              <h2>Activity Timeline</h2>
            </div>
            <div className="activity-feed">
              {activities.map((activity, index) => {
                const IconComponent = activity.icon
                return (
                  <div key={index} className="activity-item">
                    <div className="activity-icon">
                      <IconComponent size={16} />
                    </div>
                    <div className="activity-content">
                      <p>{activity.message} in <strong>{activity.repo}</strong></p>
                      <span className="activity-time">{activity.time}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {activeTab === 'contributions' && (
          <div className="contributions-section">
            <div className="contributions-stats">
              <div className="contrib-stat">
                <strong>{user.contributions.toLocaleString()}</strong>
                <span>contributions this year</span>
              </div>
            </div>
            <div className="contribution-graph">
              <div className="graph-months">
                {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map(month => (
                  <span key={month}>{month}</span>
                ))}
              </div>
              <div className="graph-grid">
                {contributionData.map((day, index) => (
                  <div 
                    key={index}
                    className={`contribution-day level-${day.count}`}
                    title={`${day.count} contributions on ${day.date.toDateString()}`}
                  />
                ))}
              </div>
              <div className="graph-legend">
                <span>Less</span>
                <div className="legend-levels">
                  <div className="level level-0"></div>
                  <div className="level level-1"></div>
                  <div className="level level-2"></div>
                  <div className="level level-3"></div>
                  <div className="level level-4"></div>
                </div>
                <span>More</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default UserProfile 