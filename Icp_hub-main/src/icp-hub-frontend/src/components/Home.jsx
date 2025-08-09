import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Github, Star, GitFork, TrendingUp, Users, Code, Zap, Shield, ArrowRight, Play, Link as LinkIcon, Globe, Layers, CheckCircle, Award, Rocket, Heart, ChevronRight, ExternalLink } from 'lucide-react'
import ThreeBackground from './ThreeBackground'

function Home() {
  const [hoveredCard, setHoveredCard] = useState(null)
  const [currentTestimonial, setCurrentTestimonial] = useState(0)

  // Static stats - no animation
  const stats = {
    chains: 6,
    projects: 75000,
    developers: 40000,
    lines: 500000000
  }

  // Auto-rotate testimonials
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  const featuredRepos = [
    {
      name: "ethereum/defi-protocol",
      description: "Advanced DeFi protocol with cross-chain yield farming capabilities and automated market making",
      language: "Solidity",
      stars: 2341,
      forks: 456,
      chains: ["Ethereum", "Polygon"],
      badge: "Trending"
    },
    {
      name: "web3/multichain-nft",
      description: "Cross-chain NFT marketplace supporting multiple blockchain networks with zero gas fees",
      language: "TypeScript", 
      stars: 1876,
      forks: 324,
      chains: ["Ethereum", "BSC", "Avalanche"],
      badge: "Popular"
    },
    {
      name: "icp/dao-governance",
      description: "Decentralized governance platform built on Internet Computer with advanced voting mechanisms",
      language: "Motoko",
      stars: 1234,
      forks: 289,
      chains: ["Internet Computer"],
      badge: "Featured"
    }
  ]

  const supportedChains = [
    { name: "Ethereum", icon: "⟠", color: "#627eea" },
    { name: "Internet Computer", icon: "∞", color: "#29abe2" },
    { name: "Polygon", icon: "⬟", color: "#8247e5" },
    { name: "Avalanche", icon: "🔺", color: "#e84142" },
    { name: "BSC", icon: "⬢", color: "#f3ba2f" },
    { name: "Arbitrum", icon: "🔷", color: "#28a0f0" }
  ]

  const features = [
    {
      icon: <Layers size={40} />,
      title: "Multichain Integration",
      description: "Deploy and manage projects across Ethereum, Internet Computer, Polygon, BSC, and more blockchain networks seamlessly",
      color: "#64b5f6"
    },
    {
      icon: <Code size={40} />,
      title: "Smart Contract Suite",
      description: "Complete development environment for Solidity, Motoko, Rust, and other blockchain programming languages",
      color: "#4caf50"
    },
    {
      icon: <Shield size={40} />,
      title: "Cross-Chain Security",
      description: "Advanced security scanning and audit tools that work across all supported blockchain networks",
      color: "#ff9800"
    },
    {
      icon: <LinkIcon size={40} />,
      title: "Interoperability Hub",
      description: "Build applications that seamlessly interact across multiple blockchain ecosystems and protocols",
      color: "#9c27b0"
    },
    {
      icon: <Zap size={40} />,
      title: "Lightning Deployment",
      description: "One-click deployment to multiple networks with optimized gas costs and performance monitoring",
      color: "#ffeb3b"
    },
    {
      icon: <Users size={40} />,
      title: "Web3 Community",
      description: "Connect with developers from all blockchain ecosystems and collaborate on cross-chain innovations",
      color: "#e91e63"
    }
  ]

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "DeFi Protocol Lead",
      company: "Blockchain Labs",
      quote: "OpenKey transformed our development workflow. We can now deploy across 6 different chains simultaneously without any complexity.",
      avatar: "SC"
    },
    {
      name: "Marcus Rodriguez",
      role: "Smart Contract Developer",
      company: "Web3 Ventures",
      quote: "The multichain deployment feature saved us months of development time. It's a game-changer for cross-chain projects.",
      avatar: "MR"
    },
    {
      name: "Emily Zhang",
      role: "CTO",
      company: "DeFi Solutions",
      quote: "OpenKey's security tools caught vulnerabilities that traditional auditors missed. It's essential for any serious Web3 project.",
      avatar: "EZ"
    }
  ]

  const partners = [
    { name: "Ethereum Foundation", logo: "⟠" },
    { name: "Internet Computer", logo: "∞" },
    { name: "Polygon", logo: "⬟" },
    { name: "Avalanche", logo: "🔺" },
    { name: "Binance Smart Chain", logo: "⬢" },
    { name: "Arbitrum", logo: "🔷" }
  ]

  const formatNumber = (num) => {
    if (num >= 1000000000) return `${(num / 1000000000).toFixed(0)}B`
    if (num >= 1000000) return `${(num / 1000000).toFixed(0)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(0)}K`
    return num.toString()
  }

  return (
    <div className="home">
      <ThreeBackground />
      
      {/* Enhanced Hero Section */}
      <section className="hero enhanced-hero">
        <div className="hero-particles"></div>
        <div className="container">
          <div className="hero-content">
            <div className="hero-text">
              <div className="hero-badge">
                <Globe size={16} />
                <span>Multichain • Cross-Platform • Decentralized</span>
                <div className="badge-glow"></div>
              </div>
              <h1 className="hero-title">
                The Ultimate
                <span className="gradient-text"> Multichain Development</span>
                Platform
              </h1>
              <p className="hero-description">
                OpenKey is the world's first multichain development platform that seamlessly connects 
                Ethereum, Internet Computer, Polygon, BSC, Avalanche, and beyond. Build, deploy, and 
                collaborate across all major blockchain networks from a single unified interface.
              </p>

              <div className="hero-buttons">
                <Link to="/repositories" className="btn-primary enhanced-btn">
                  <Github size={20} />
                  Explore Multichain Projects
                  <ArrowRight size={16} />
                  <div className="btn-glow"></div>
                </Link>
              </div>
              
              <div className="hero-stats">
                <div className="stat">
                  <span className="stat-number">{stats.chains}+</span>
                  <span className="stat-label">Blockchain Networks</span>
                </div>
                <div className="stat">
                  <span className="stat-number">{formatNumber(stats.projects)}+</span>
                  <span className="stat-label">Cross-Chain Projects</span>
                </div>
                <div className="stat">
                  <span className="stat-number">{formatNumber(stats.developers)}+</span>
                  <span className="stat-label">Web3 Developers</span>
                </div>
                <div className="stat">
                  <span className="stat-number">{formatNumber(stats.lines)}+</span>
                  <span className="stat-label">Lines of Code</span>
                </div>
              </div>
            </div>
            
            <div className="hero-visual">
              <div className="floating-card enhanced-card">
                <div className="card-content">
                  <div className="card-icon">
                    <Layers size={48} />
                  </div>
                  <h3>Multichain Ready</h3>
                  <p>Deploy everywhere at once</p>
                  <div className="card-chains">
                    {supportedChains.slice(0, 4).map((chain, index) => (
                      <span key={index} className="mini-chain" style={{ color: chain.color }}>
                        {chain.icon}
                      </span>
                    ))}
                  </div>
                  <div className="card-pulse"></div>
                </div>
                <div className="card-glow"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Features Section */}
      <section className="features enhanced-features">
        <div className="container">
          <div className="section-header-center">
            <h2 className="section-title">Why Choose OpenKey?</h2>
            <p className="section-subtitle">
              The most comprehensive multichain development platform for building the future of Web3
            </p>
          </div>
          <div className="features-grid">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="feature-card enhanced-feature-card"
                onMouseEnter={() => setHoveredCard(index)}
                onMouseLeave={() => setHoveredCard(null)}
                style={{ '--feature-color': feature.color }}
              >
                <div className="feature-icon" style={{ color: feature.color }}>{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
                <div className="feature-overlay" />
                <div className="feature-border-glow"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Latest Repositories */}
      <section className="latest-repos enhanced-repos">
        <div className="container">
          <div className="section-header">
            <h2>
              <TrendingUp size={32} />
              Trending Multichain Projects
            </h2>
            <Link to="/repositories" className="view-all-btn">
              View All Projects
              <ArrowRight size={16} />
            </Link>
          </div>
          <div className="repos-preview">
            {featuredRepos.map((repo, index) => (
              <div key={index} className="repo-card-preview enhanced-repo-card">
                <div className="repo-badge">{repo.badge}</div>
                <h4>{repo.name}</h4>
                <p>{repo.description}</p>
                <div className="repo-chains">
                  {repo.chains.map((chain, chainIndex) => (
                    <span key={chainIndex} className="chain-tag">
                      {supportedChains.find(c => c.name === chain)?.icon} {chain}
                    </span>
                  ))}
                </div>
                <div className="repo-meta">
                  <span className="language">{repo.language}</span>
                  <span><Star size={14} /> {repo.stars}</span>
                  <span><GitFork size={14} /> {repo.forks}</span>
                </div>
                <div className="repo-glow"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* New Testimonials Section */}
      <section className="testimonials">
        <div className="container">
          <div className="section-header-center">
            <h2 className="section-title">Trusted by Web3 Leaders</h2>
            <p className="section-subtitle">
              See what developers and companies are saying about OpenKey
            </p>
          </div>
          <div className="testimonials-carousel">
            <div className="testimonial-card">
              <div className="testimonial-content">
                <div className="quote-icon">"</div>
                <p>{testimonials[currentTestimonial].quote}</p>
                <div className="testimonial-author">
                  <div className="author-avatar">
                    {testimonials[currentTestimonial].avatar}
                  </div>
                  <div className="author-info">
                    <h4>{testimonials[currentTestimonial].name}</h4>
                    <p>{testimonials[currentTestimonial].role} at {testimonials[currentTestimonial].company}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="testimonial-dots">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  className={`dot ${index === currentTestimonial ? 'active' : ''}`}
                  onClick={() => setCurrentTestimonial(index)}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Multichain Stats */}
      <section className="multichain-stats enhanced-stats">
        <div className="container">
          <div className="stats-header">
            <h2>Powering Web3 Development Across All Chains</h2>
            <p>Join thousands of developers building the multichain future</p>
          </div>
          <div className="stats-grid">
            <div className="stat-card enhanced-stat-card">
              <div className="stat-icon">⟠</div>
              <div className="stat-info">
                <span className="stat-number">25K+</span>
                <span className="stat-label">Ethereum Projects</span>
              </div>
              <div className="stat-glow"></div>
            </div>
            <div className="stat-card enhanced-stat-card">
              <div className="stat-icon">∞</div>
              <div className="stat-info">
                <span className="stat-number">15K+</span>
                <span className="stat-label">Internet Computer Canisters</span>
              </div>
              <div className="stat-glow"></div>
            </div>
            <div className="stat-card enhanced-stat-card">
              <div className="stat-icon">⬟</div>
              <div className="stat-info">
                <span className="stat-number">18K+</span>
                <span className="stat-label">Polygon DApps</span>
              </div>
              <div className="stat-glow"></div>
            </div>
            <div className="stat-card enhanced-stat-card">
              <div className="stat-icon">🔺</div>
              <div className="stat-info">
                <span className="stat-number">12K+</span>
                <span className="stat-label">Avalanche Projects</span>
              </div>
              <div className="stat-glow"></div>
            </div>
          </div>
        </div>
      </section>

      {/* New Partners Section */}
      <section className="partners">
        <div className="container">
          <div className="section-header-center">
            <h2 className="section-title">Powered by Leading Blockchain Networks</h2>
          </div>
          <div className="partners-grid">
            {partners.map((partner, index) => (
              <div key={index} className="partner-card">
                <div className="partner-logo">{partner.logo}</div>
                <span className="partner-name">{partner.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Call to Action */}
      <section className="cta enhanced-cta">
        <div className="container">
          <div className="cta-content">
            <div className="cta-badge">
              <Rocket size={16} />
              <span>Start Building Today</span>
            </div>
            <h2>Ready to Build Across All Chains?</h2>
            <p>
              Join the multichain revolution and create applications that work seamlessly 
              across Ethereum, Internet Computer, Polygon, BSC, Avalanche, and beyond.
            </p>
            <div className="hero-buttons">
              <Link to="/repositories" className="btn-primary enhanced-btn">
                <Code size={20} />
                Start Building
                <ArrowRight size={16} />
                <div className="btn-glow"></div>
              </Link>
              <Link to="/community" className="btn-secondary enhanced-btn">
                <Users size={16} />
                Join Community
                <div className="btn-glow"></div>
              </Link>
            </div>
            <div className="cta-features">
              <div className="cta-feature">
                <CheckCircle size={16} />
                <span>Free forever</span>
              </div>
              <div className="cta-feature">
                <CheckCircle size={16} />
                <span>No credit card required</span>
              </div>
              <div className="cta-feature">
                <CheckCircle size={16} />
                <span>Deploy in seconds</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home 