import { useState } from 'react'
import { Users, TrendingUp, MessageCircle, Award, MapPin, Link as LinkIcon, Github, Twitter } from 'lucide-react'

function Community() {
  const [activeTab, setActiveTab] = useState('developers')

  const developers = [
    {
      id: 1,
      username: "vitalik-eth",
      name: "Vitalik Buterin",
      avatar: "https://github.com/vbuterin.png",
      location: "Global",
      bio: "Ethereum co-founder, researcher and developer",
      followers: 125000,
      following: 42,
      repositories: 87,
      contributions: 2341,
      languages: ["Solidity", "Python", "JavaScript"],
      badges: ["Ethereum Core", "Top Contributor", "Security Expert"],
      githubUrl: "https://github.com/vbuterin",
      twitterUrl: "https://twitter.com/VitalikButerin"
    },
    {
      id: 2,
      username: "defi-builder",
      name: "Alex Rodriguez",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      location: "San Francisco, CA",
      bio: "Building the future of decentralized finance",
      followers: 5670,
      following: 234,
      repositories: 45,
      contributions: 1876,
      languages: ["Solidity", "TypeScript", "Rust"],
      badges: ["DeFi Expert", "Smart Contract Auditor"],
      githubUrl: "https://github.com/defi-builder",
      twitterUrl: "https://twitter.com/defi_builder"
    },
    {
      id: 3,
      username: "nft-creator",
      name: "Sarah Chen",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b790?w=150&h=150&fit=crop&crop=face",
      location: "Tokyo, Japan",
      bio: "NFT artist and marketplace developer",
      followers: 3421,
      following: 156,
      repositories: 23,
      contributions: 987,
      languages: ["JavaScript", "React", "Solidity"],
      badges: ["NFT Pioneer", "Artist"],
      githubUrl: "https://github.com/nft-creator",
      twitterUrl: "https://twitter.com/nft_creator"
    },
    {
      id: 4,
      username: "dao-architect",
      name: "Michael Thompson",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      location: "Berlin, Germany",
      bio: "DAO governance and protocol design specialist",
      followers: 2890,
      following: 89,
      repositories: 34,
      contributions: 1234,
      languages: ["Rust", "Go", "Solidity"],
      badges: ["DAO Expert", "Protocol Designer"],
      githubUrl: "https://github.com/dao-architect",
      twitterUrl: "https://twitter.com/dao_architect"
    }
  ]

  const discussions = [
    {
      id: 1,
      title: "Best practices for smart contract security in 2024",
      author: "security-expert",
      replies: 24,
      lastActivity: "2 hours ago",
      tags: ["security", "smart-contracts", "best-practices"]
    },
    {
      id: 2,
      title: "Layer 2 scaling solutions comparison",
      author: "layer2-dev",
      replies: 18,
      lastActivity: "4 hours ago",
      tags: ["layer2", "scaling", "ethereum"]
    },
    {
      id: 3,
      title: "Cross-chain bridge implementation challenges",
      author: "bridge-builder",
      replies: 15,
      lastActivity: "1 day ago",
      tags: ["cross-chain", "interoperability", "bridges"]
    }
  ]

  const trendingTopics = [
    { topic: "DeFi 2.0", posts: 342, growth: "+15%" },
    { topic: "Layer 2 Solutions", posts: 289, growth: "+23%" },
    { topic: "NFT Utilities", posts: 234, growth: "+8%" },
    { topic: "DAO Governance", posts: 198, growth: "+12%" },
    { topic: "Cross-chain", posts: 167, growth: "+31%" },
    { topic: "Zero Knowledge", posts: 145, growth: "+45%" }
  ]

  return (
    <div className="community">
      <div className="container">
        {/* Header */}
        <div className="community-header">
          <h1>Web3 Community</h1>
          <p>Connect with developers, share knowledge, and build the future together</p>
        </div>

        {/* Community Stats */}
        <div className="community-stats">
          <div className="stat-card">
            <Users size={32} />
            <div>
              <h3>50,000+</h3>
              <p>Active Developers</p>
            </div>
          </div>
          <div className="stat-card">
            <MessageCircle size={32} />
            <div>
              <h3>25,000+</h3>
              <p>Discussions</p>
            </div>
          </div>
          <div className="stat-card">
            <Award size={32} />
            <div>
              <h3>10,000+</h3>
              <p>Open Source Projects</p>
            </div>
          </div>
          <div className="stat-card">
            <TrendingUp size={32} />
            <div>
              <h3>500+</h3>
              <p>New Projects Weekly</p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="tab-navigation">
          <button 
            className={`tab ${activeTab === 'developers' ? 'active' : ''}`}
            onClick={() => setActiveTab('developers')}
          >
            <Users size={18} />
            Developers
          </button>
          <button 
            className={`tab ${activeTab === 'discussions' ? 'active' : ''}`}
            onClick={() => setActiveTab('discussions')}
          >
            <MessageCircle size={18} />
            Discussions
          </button>
          <button 
            className={`tab ${activeTab === 'trending' ? 'active' : ''}`}
            onClick={() => setActiveTab('trending')}
          >
            <TrendingUp size={18} />
            Trending
          </button>
        </div>

        {/* Content based on active tab */}
        {activeTab === 'developers' && (
          <div className="developers-section">
            <h2>Featured Developers</h2>
            <div className="developers-grid">
              {developers.map(dev => (
                <div key={dev.id} className="developer-card">
                  <div className="dev-header">
                    <img src={dev.avatar} alt={dev.name} className="dev-avatar" />
                    <div className="dev-info">
                      <h3>{dev.name}</h3>
                      <p className="dev-username">@{dev.username}</p>
                      <p className="dev-location">
                        <MapPin size={14} />
                        {dev.location}
                      </p>
                    </div>
                  </div>
                  
                  <p className="dev-bio">{dev.bio}</p>
                  
                  <div className="dev-badges">
                    {dev.badges.map(badge => (
                      <span key={badge} className="badge">{badge}</span>
                    ))}
                  </div>
                  
                  <div className="dev-stats">
                    <div className="stat">
                      <strong>{dev.followers.toLocaleString()}</strong>
                      <span>Followers</span>
                    </div>
                    <div className="stat">
                      <strong>{dev.repositories}</strong>
                      <span>Repos</span>
                    </div>
                    <div className="stat">
                      <strong>{dev.contributions.toLocaleString()}</strong>
                      <span>Contributions</span>
                    </div>
                  </div>
                  
                  <div className="dev-languages">
                    {dev.languages.map(lang => (
                      <span key={lang} className="language-tag">{lang}</span>
                    ))}
                  </div>
                  
                  <div className="dev-links">
                    <a href={dev.githubUrl} target="_blank" rel="noopener noreferrer">
                      <Github size={18} />
                    </a>
                    <a href={dev.twitterUrl} target="_blank" rel="noopener noreferrer">
                      <Twitter size={18} />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'discussions' && (
          <div className="discussions-section">
            <div className="section-header">
              <h2>Recent Discussions</h2>
              <button className="btn-primary">Start Discussion</button>
            </div>
            <div className="discussions-list">
              {discussions.map(discussion => (
                <div key={discussion.id} className="discussion-card">
                  <div className="discussion-content">
                    <h3>{discussion.title}</h3>
                    <p>Started by @{discussion.author}</p>
                    <div className="discussion-tags">
                      {discussion.tags.map(tag => (
                        <span key={tag} className="tag">#{tag}</span>
                      ))}
                    </div>
                  </div>
                  <div className="discussion-meta">
                    <div className="replies">
                      <MessageCircle size={16} />
                      {discussion.replies} replies
                    </div>
                    <div className="last-activity">
                      Last activity: {discussion.lastActivity}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'trending' && (
          <div className="trending-section">
            <h2>Trending Topics</h2>
            <div className="trending-grid">
              {trendingTopics.map((item, index) => (
                <div key={item.topic} className="trending-card">
                  <div className="trending-rank">#{index + 1}</div>
                  <div className="trending-content">
                    <h3>{item.topic}</h3>
                    <p>{item.posts} posts</p>
                    <span className={`growth ${item.growth.startsWith('+') ? 'positive' : 'negative'}`}>
                      {item.growth}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Community 