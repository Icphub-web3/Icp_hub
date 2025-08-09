import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { 
  Star, GitFork, Eye, Code, GitBranch, Shield, Settings, 
  Download, File, Folder, ChevronRight, Calendar, User,
  Copy, ExternalLink, AlertCircle, GitPullRequest, Play,
  BarChart3, Book, Tag, Users, Search, Filter, Clock,
  CheckCircle, XCircle, ArrowUpRight, MapPin, Building2,
  Mail, Twitter, Globe, Award, GitCommit
} from 'lucide-react'

function RepositoryDetail() {
  const { owner, repo } = useParams()
  const [currentPath, setCurrentPath] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)
  const [activeTab, setActiveTab] = useState('code')
  const [selectedBranch, setSelectedBranch] = useState('main')
  const [showOwnerProfile, setShowOwnerProfile] = useState(false)

  // Mock repository data
  const repository = {
    name: repo,
    owner: owner,
    description: "Advanced yield farming protocol with automated compounding strategies for DeFi",
    isPrivate: false,
    language: "Solidity",
    languageColor: "#3C3C3D",
    stars: 234,
    forks: 45,
    watchers: 23,
    issues: 12,
    pullRequests: 3,
    defaultBranch: "main",
    branches: ["main", "develop", "feature/optimization", "hotfix/security"],
    lastCommit: {
      message: "Add liquidity pool optimization",
      author: "alex-chen",
      date: "2 hours ago",
      hash: "abc123f"
    },
    topics: ["defi", "yield-farming", "smart-contracts", "ethereum", "solidity"],
    license: "MIT",
    size: "2.3 MB",
    createdAt: "March 15, 2024",
    updatedAt: "2 hours ago",
    homepage: "https://defi-yield.com",
    releases: 5,
    contributors: 8,
    commits: 147
  }

  // Mock owner profile data
  const ownerProfile = {
    username: owner,
    name: "Alex Chen",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
    bio: "Full-stack Web3 developer passionate about DeFi protocols and smart contract security.",
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
    achievements: ["Web3 Pioneer", "Smart Contract Auditor", "DeFi Expert"],
    languages: ["Solidity", "TypeScript", "Rust", "JavaScript"],
    organizations: ["DeFi Labs", "Ethereum Foundation", "OpenZeppelin"]
  }

  // Mock issues data
  const issues = [
    {
      id: 1,
      title: "Add support for multiple LP tokens",
      number: 23,
      state: "open",
      author: "jane-doe",
      labels: ["enhancement", "defi"],
      comments: 5,
      createdAt: "2 days ago",
      assignee: "alex-chen"
    },
    {
      id: 2,
      title: "Gas optimization for harvest function",
      number: 22,
      state: "open",
      author: "dev-user",
      labels: ["optimization", "gas"],
      comments: 3,
      createdAt: "3 days ago",
      assignee: null
    },
    {
      id: 3,
      title: "Security audit findings",
      number: 21,
      state: "closed",
      author: "security-expert",
      labels: ["security", "bug"],
      comments: 12,
      createdAt: "1 week ago",
      assignee: "alex-chen"
    }
  ]

  // Mock pull requests data
  const pullRequests = [
    {
      id: 1,
      title: "Implement automated rebalancing",
      number: 15,
      state: "open",
      author: "contributor-1",
      labels: ["feature"],
      comments: 8,
      createdAt: "1 day ago",
      mergeable: true,
      checks: { passing: 3, failing: 0 }
    },
    {
      id: 2,
      title: "Fix calculation bug in rewards",
      number: 14,
      state: "merged",
      author: "alex-chen",
      labels: ["bugfix"],
      comments: 4,
      createdAt: "3 days ago",
      mergedAt: "2 days ago",
      checks: { passing: 3, failing: 0 }
    }
  ]

  // Mock actions/workflows data
  const workflows = [
    {
      name: "CI/CD Pipeline",
      status: "success",
      lastRun: "2 hours ago",
      duration: "3m 24s",
      branch: "main"
    },
    {
      name: "Security Scan",
      status: "success",
      lastRun: "4 hours ago",
      duration: "1m 47s",
      branch: "main"
    },
    {
      name: "Deploy to Testnet",
      status: "running",
      lastRun: "running",
      duration: "2m 15s",
      branch: "develop"
    }
  ]

  // Mock insights data
  const insights = {
    traffic: {
      views: 1234,
      uniqueVisitors: 567,
      clones: 89
    },
    commits: {
      thisWeek: 12,
      thisMonth: 45,
      contributors: ["alex-chen", "jane-doe", "dev-user", "contributor-1"]
    },
    codeFrequency: [
      { week: "Week 1", additions: 1200, deletions: 300 },
      { week: "Week 2", additions: 800, deletions: 150 },
      { week: "Week 3", additions: 1500, deletions: 400 },
      { week: "Week 4", additions: 900, deletions: 200 }
    ]
  }

  // Existing file structure and content (keeping the same as before)
  const fileStructure = {
    '': {
      type: 'directory',
      files: [
        { name: '.github', type: 'directory', size: '-' },
        { name: 'contracts', type: 'directory', size: '-' },
        { name: 'scripts', type: 'directory', size: '-' },
        { name: 'test', type: 'directory', size: '-' },
        { name: '.gitignore', type: 'file', size: '2.1 KB' },
        { name: 'README.md', type: 'file', size: '4.2 KB' },
        { name: 'hardhat.config.js', type: 'file', size: '1.8 KB' },
        { name: 'package.json', type: 'file', size: '892 B' },
        { name: 'yarn.lock', type: 'file', size: '125 KB' }
      ]
    },
    'contracts': {
      type: 'directory',
      files: [
        { name: 'YieldFarm.sol', type: 'file', size: '8.4 KB' },
        { name: 'LiquidityPool.sol', type: 'file', size: '6.2 KB' },
        { name: 'RewardToken.sol', type: 'file', size: '3.1 KB' },
        { name: 'interfaces', type: 'directory', size: '-' }
      ]
    },
    'scripts': {
      type: 'directory',
      files: [
        { name: 'deploy.js', type: 'file', size: '2.3 KB' },
        { name: 'verify.js', type: 'file', size: '1.1 KB' }
      ]
    }
  }

  const fileContents = {
    'README.md': `# DeFi Yield Farming Protocol

A decentralized yield farming protocol built on Ethereum that enables users to earn rewards by providing liquidity.

## Features

- 🌾 **Automated Yield Farming**: Stake your tokens and earn rewards automatically
- 💰 **Compound Interest**: Rewards are automatically reinvested for maximum yield
- 🔒 **Secure Smart Contracts**: Audited contracts with battle-tested security
- ⚡ **Gas Optimized**: Minimal transaction costs with optimized contract design

## Quick Start

\`\`\`bash
# Install dependencies
npm install

# Compile contracts
npx hardhat compile

# Run tests
npx hardhat test

# Deploy to local network
npx hardhat run scripts/deploy.js --network localhost
\`\`\`

## Architecture

The protocol consists of three main components:

1. **YieldFarm.sol** - Main farming contract that handles staking and rewards
2. **LiquidityPool.sol** - Manages liquidity provision and LP tokens
3. **RewardToken.sol** - ERC-20 token used for farming rewards

## Security

This protocol has been audited by leading security firms:
- ✅ ConsenSys Diligence
- ✅ Trail of Bits
- ✅ OpenZeppelin

## License

MIT License - see [LICENSE](LICENSE) for details.`,
    
    'contracts/YieldFarm.sol': `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title YieldFarm
 * @dev A yield farming contract that allows users to stake tokens and earn rewards
 */
contract YieldFarm is ReentrancyGuard, Ownable {
    IERC20 public stakingToken;
    IERC20 public rewardToken;
    
    uint256 public rewardRate = 100; // 100 tokens per second
    uint256 public lastUpdateTime;
    uint256 public rewardPerTokenStored;
    
    mapping(address => uint256) public userRewardPerTokenPaid;
    mapping(address => uint256) public rewards;
    mapping(address => uint256) public balances;
    
    uint256 private _totalSupply;
    
    event Staked(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);
    event RewardPaid(address indexed user, uint256 reward);
    
    constructor(address _stakingToken, address _rewardToken) {
        stakingToken = IERC20(_stakingToken);
        rewardToken = IERC20(_rewardToken);
    }
    
    function rewardPerToken() public view returns (uint256) {
        if (_totalSupply == 0) {
            return rewardPerTokenStored;
        }
        return
            rewardPerTokenStored +
            (((block.timestamp - lastUpdateTime) * rewardRate * 1e18) / _totalSupply);
    }
    
    function earned(address account) public view returns (uint256) {
        return
            ((balances[account] *
                (rewardPerToken() - userRewardPerTokenPaid[account])) / 1e18) +
            rewards[account];
    }
    
    modifier updateReward(address account) {
        rewardPerTokenStored = rewardPerToken();
        lastUpdateTime = block.timestamp;
        
        if (account != address(0)) {
            rewards[account] = earned(account);
            userRewardPerTokenPaid[account] = rewardPerTokenStored;
        }
        _;
    }
    
    function stake(uint256 _amount) external nonReentrant updateReward(msg.sender) {
        require(_amount > 0, "Cannot stake 0");
        _totalSupply += _amount;
        balances[msg.sender] += _amount;
        stakingToken.transferFrom(msg.sender, address(this), _amount);
        emit Staked(msg.sender, _amount);
    }
    
    function withdraw(uint256 _amount) external nonReentrant updateReward(msg.sender) {
        require(_amount > 0, "Cannot withdraw 0");
        require(balances[msg.sender] >= _amount, "Insufficient balance");
        _totalSupply -= _amount;
        balances[msg.sender] -= _amount;
        stakingToken.transfer(msg.sender, _amount);
        emit Withdrawn(msg.sender, _amount);
    }
    
    function getReward() external nonReentrant updateReward(msg.sender) {
        uint256 reward = rewards[msg.sender];
        if (reward > 0) {
            rewards[msg.sender] = 0;
            rewardToken.transfer(msg.sender, reward);
            emit RewardPaid(msg.sender, reward);
        }
    }
    
    function exit() external {
        withdraw(balances[msg.sender]);
        getReward();
    }
}`
  }

  const currentFiles = fileStructure[currentPath]?.files || []

  const handleFileClick = (file) => {
    if (file.type === 'directory') {
      const newPath = currentPath ? `${currentPath}/${file.name}` : file.name
      setCurrentPath(newPath)
      setSelectedFile(null)
    } else {
      setSelectedFile({
        name: file.name,
        path: currentPath ? `${currentPath}/${file.name}` : file.name,
        content: fileContents[currentPath ? `${currentPath}/${file.name}` : file.name] || '// File content would be loaded here...'
      })
    }
  }

  const getPathBreadcrumbs = () => {
    if (!currentPath) return []
    return currentPath.split('/')
  }

  const navigateToPath = (index) => {
    if (index === -1) {
      setCurrentPath('')
    } else {
      const newPath = currentPath.split('/').slice(0, index + 1).join('/')
      setCurrentPath(newPath)
    }
    setSelectedFile(null)
  }

  const formatFileContent = (content) => {
    return content.split('\n').map((line, index) => (
      <div key={index} className="code-line">
        <span className="line-number">{index + 1}</span>
        <span className="line-content">{line}</span>
      </div>
    ))
  }

  const copyRepoUrl = () => {
    const url = `https://github.com/${owner}/${repo}.git`
    navigator.clipboard.writeText(url)
  }

  return (
    <div className="repository-detail">
      <div className="container">
        {/* Repository Header */}
        <div className="repo-header-section">
          <div className="repo-title-area">
            <div className="repo-path">
              <button 
                className="repo-owner-link"
                onClick={() => setShowOwnerProfile(true)}
              >
                {owner}
              </button>
              <span className="path-separator">/</span>
              <h1 className="repo-name">{repository.name}</h1>
              <span className="repo-visibility">{repository.isPrivate ? 'Private' : 'Public'}</span>
            </div>
            <div className="repo-actions">
              <button className="action-btn">
                <Eye size={16} />
                Watch
                <span className="count">{repository.watchers}</span>
              </button>
              <button className="action-btn">
                <Star size={16} />
                Star
                <span className="count">{repository.stars}</span>
              </button>
              <button className="action-btn">
                <GitFork size={16} />
                Fork
                <span className="count">{repository.forks}</span>
              </button>
            </div>
          </div>

          <p className="repo-description">{repository.description}</p>

          <div className="repo-meta">
            <div className="repo-stats">
              <span className="meta-item">
                <span className="language-dot" style={{ backgroundColor: repository.languageColor }}></span>
                {repository.language}
              </span>
              <span className="meta-item">
                <Star size={14} />
                {repository.stars}
              </span>
              <span className="meta-item">
                <GitFork size={14} />
                {repository.forks}
              </span>
              <span className="meta-item">
                <Shield size={14} />
                {repository.license}
              </span>
              <span className="meta-item">
                <Calendar size={14} />
                Updated {repository.updatedAt}
              </span>
            </div>

            <div className="repo-topics">
              {repository.topics.map(topic => (
                <span key={topic} className="topic-tag">{topic}</span>
              ))}
            </div>
          </div>

          {/* Repository Quick Stats */}
          <div className="repo-quick-stats">
            <div className="quick-stat">
              <GitCommit size={16} />
              <span>{repository.commits} commits</span>
            </div>
            <div className="quick-stat">
              <GitBranch size={16} />
              <span>{repository.branches.length} branches</span>
            </div>
            <div className="quick-stat">
              <Tag size={16} />
              <span>{repository.releases} releases</span>
            </div>
            <div className="quick-stat">
              <Users size={16} />
              <span>{repository.contributors} contributors</span>
            </div>
          </div>
        </div>

        {/* Repository Navigation */}
        <div className="repo-nav">
          <div className="repo-tabs">
            <button 
              className={`repo-tab ${activeTab === 'code' ? 'active' : ''}`}
              onClick={() => setActiveTab('code')}
            >
              <Code size={16} />
              Code
            </button>
            <button 
              className={`repo-tab ${activeTab === 'issues' ? 'active' : ''}`}
              onClick={() => setActiveTab('issues')}
            >
              <AlertCircle size={16} />
              Issues
              <span className="tab-count">{repository.issues}</span>
            </button>
            <button 
              className={`repo-tab ${activeTab === 'pulls' ? 'active' : ''}`}
              onClick={() => setActiveTab('pulls')}
            >
              <GitPullRequest size={16} />
              Pull requests
              <span className="tab-count">{repository.pullRequests}</span>
            </button>
            <button 
              className={`repo-tab ${activeTab === 'actions' ? 'active' : ''}`}
              onClick={() => setActiveTab('actions')}
            >
              <Play size={16} />
              Actions
            </button>
            <button 
              className={`repo-tab ${activeTab === 'insights' ? 'active' : ''}`}
              onClick={() => setActiveTab('insights')}
            >
              <BarChart3 size={16} />
              Insights
            </button>
            <button 
              className={`repo-tab ${activeTab === 'security' ? 'active' : ''}`}
              onClick={() => setActiveTab('security')}
            >
              <Shield size={16} />
              Security
            </button>
          </div>

          <div className="repo-tools">
            <select 
              className="branch-selector"
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
            >
              {repository.branches.map(branch => (
                <option key={branch} value={branch}>
                  <GitBranch size={14} /> {branch}
                </option>
              ))}
            </select>
            <button className="tool-btn primary" onClick={copyRepoUrl}>
              <Download size={16} />
              Code
            </button>
            <button className="tool-btn">
              <Settings size={16} />
            </button>
          </div>
        </div>

        {/* Repository Content */}
        {activeTab === 'code' && (
          <div className="repo-content">
            {/* Branch and Commit Info */}
            <div className="commit-info">
              <div className="commit-details">
                <GitBranch size={16} />
                <span className="branch-name">{selectedBranch}</span>
                <span className="commit-separator">•</span>
                <span className="commit-count">{repository.commits} commits</span>
              </div>
              <div className="latest-commit">
                <User size={16} />
                <span className="commit-author">{repository.lastCommit.author}</span>
                <span className="commit-message">{repository.lastCommit.message}</span>
                <span className="commit-time">{repository.lastCommit.date}</span>
                <span className="commit-hash">{repository.lastCommit.hash}</span>
              </div>
            </div>

            {/* File Browser */}
            <div className="file-browser">
              {/* Path Navigation */}
              {(currentPath || getPathBreadcrumbs().length > 0) && (
                <div className="path-navigation">
                  <button 
                    className="path-item"
                    onClick={() => navigateToPath(-1)}
                  >
                    {repository.name}
                  </button>
                  {getPathBreadcrumbs().map((path, index) => (
                    <span key={index}>
                      <ChevronRight size={16} className="path-separator" />
                      <button 
                        className="path-item"
                        onClick={() => navigateToPath(index)}
                      >
                        {path}
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* File List */}
              {!selectedFile && (
                <div className="file-list">
                  {currentFiles.map((file, index) => (
                    <div 
                      key={index} 
                      className="file-item"
                      onClick={() => handleFileClick(file)}
                    >
                      <div className="file-info">
                        {file.type === 'directory' ? (
                          <Folder size={16} className="file-icon folder" />
                        ) : (
                          <File size={16} className="file-icon file" />
                        )}
                        <span className="file-name">{file.name}</span>
                      </div>
                      <div className="file-meta">
                        <span className="file-size">{file.size}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* File Content */}
              {selectedFile && (
                <div className="file-viewer">
                  <div className="file-header">
                    <div className="file-path">
                      <File size={16} />
                      <span>{selectedFile.name}</span>
                    </div>
                    <div className="file-actions">
                      <button className="file-action-btn">
                        <Copy size={16} />
                      </button>
                      <button className="file-action-btn">
                        <ExternalLink size={16} />
                      </button>
                      <button className="file-action-btn" onClick={() => setSelectedFile(null)}>
                        ✕
                      </button>
                    </div>
                  </div>
                  <div className="file-content">
                    {selectedFile.name.endsWith('.md') ? (
                      <div className="markdown-content">
                        <pre>{selectedFile.content}</pre>
                      </div>
                    ) : (
                      <div className="code-content">
                        {formatFileContent(selectedFile.content)}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* README Display */}
              {!selectedFile && currentPath === '' && (
                <div className="readme-section">
                  <div className="readme-header">
                    <File size={16} />
                    <span>README.md</span>
                  </div>
                  <div className="readme-content">
                    <pre>{fileContents['README.md']}</pre>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Issues Tab */}
        {activeTab === 'issues' && (
          <div className="tab-content">
            <div className="issues-section">
              <div className="issues-header">
                <div className="issues-filters">
                  <button className="filter-btn active">
                    <AlertCircle size={16} />
                    Open ({issues.filter(i => i.state === 'open').length})
                  </button>
                  <button className="filter-btn">
                    <CheckCircle size={16} />
                    Closed ({issues.filter(i => i.state === 'closed').length})
                  </button>
                </div>
                <button className="btn-primary">
                  New Issue
                </button>
              </div>
              
              <div className="issues-list">
                {issues.map(issue => (
                  <div key={issue.id} className="issue-item">
                    <div className="issue-icon">
                      {issue.state === 'open' ? (
                        <AlertCircle size={16} className="open" />
                      ) : (
                        <CheckCircle size={16} className="closed" />
                      )}
                    </div>
                    <div className="issue-content">
                      <div className="issue-title">
                        <span className="issue-number">#{issue.number}</span>
                        <span className="issue-name">{issue.title}</span>
                      </div>
                      <div className="issue-meta">
                        <span>opened {issue.createdAt} by {issue.author}</span>
                        {issue.assignee && <span>• assigned to {issue.assignee}</span>}
                      </div>
                      <div className="issue-labels">
                        {issue.labels.map(label => (
                          <span key={label} className="label">{label}</span>
                        ))}
                      </div>
                    </div>
                    <div className="issue-comments">
                      <span>{issue.comments} comments</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Pull Requests Tab */}
        {activeTab === 'pulls' && (
          <div className="tab-content">
            <div className="pulls-section">
              <div className="pulls-header">
                <div className="pulls-filters">
                  <button className="filter-btn active">
                    <GitPullRequest size={16} />
                    Open ({pullRequests.filter(pr => pr.state === 'open').length})
                  </button>
                  <button className="filter-btn">
                    <CheckCircle size={16} />
                    Merged ({pullRequests.filter(pr => pr.state === 'merged').length})
                  </button>
                </div>
                <button className="btn-primary">
                  New Pull Request
                </button>
              </div>
              
              <div className="pulls-list">
                {pullRequests.map(pr => (
                  <div key={pr.id} className="pull-item">
                    <div className="pull-icon">
                      {pr.state === 'open' ? (
                        <GitPullRequest size={16} className="open" />
                      ) : (
                        <CheckCircle size={16} className="merged" />
                      )}
                    </div>
                    <div className="pull-content">
                      <div className="pull-title">
                        <span className="pull-number">#{pr.number}</span>
                        <span className="pull-name">{pr.title}</span>
                      </div>
                      <div className="pull-meta">
                        <span>opened {pr.createdAt} by {pr.author}</span>
                        {pr.mergedAt && <span>• merged {pr.mergedAt}</span>}
                      </div>
                      <div className="pull-labels">
                        {pr.labels.map(label => (
                          <span key={label} className="label">{label}</span>
                        ))}
                      </div>
                      {pr.checks && (
                        <div className="pull-checks">
                          <CheckCircle size={14} className="success" />
                          <span>{pr.checks.passing} checks passing</span>
                          {pr.checks.failing > 0 && (
                            <>
                              <XCircle size={14} className="failure" />
                              <span>{pr.checks.failing} checks failing</span>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="pull-comments">
                      <span>{pr.comments} comments</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Actions Tab */}
        {activeTab === 'actions' && (
          <div className="tab-content">
            <div className="actions-section">
              <div className="actions-header">
                <h2>Workflows</h2>
                <button className="btn-primary">
                  New Workflow
                </button>
              </div>
              
              <div className="workflows-list">
                {workflows.map((workflow, index) => (
                  <div key={index} className="workflow-item">
                    <div className="workflow-status">
                      {workflow.status === 'success' && (
                        <CheckCircle size={16} className="success" />
                      )}
                      {workflow.status === 'running' && (
                        <Clock size={16} className="running" />
                      )}
                      {workflow.status === 'failure' && (
                        <XCircle size={16} className="failure" />
                      )}
                    </div>
                    <div className="workflow-content">
                      <div className="workflow-name">{workflow.name}</div>
                      <div className="workflow-meta">
                        <span>Last run: {workflow.lastRun}</span>
                        <span>• Duration: {workflow.duration}</span>
                        <span>• Branch: {workflow.branch}</span>
                      </div>
                    </div>
                    <div className="workflow-actions">
                      <button className="workflow-btn">
                        <Play size={14} />
                        Run workflow
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Insights Tab */}
        {activeTab === 'insights' && (
          <div className="tab-content">
            <div className="insights-section">
              <div className="insights-grid">
                <div className="insight-card">
                  <h3>Traffic</h3>
                  <div className="insight-stats">
                    <div className="insight-stat">
                      <span className="stat-number">{insights.traffic.views}</span>
                      <span className="stat-label">Views</span>
                    </div>
                    <div className="insight-stat">
                      <span className="stat-number">{insights.traffic.uniqueVisitors}</span>
                      <span className="stat-label">Unique visitors</span>
                    </div>
                    <div className="insight-stat">
                      <span className="stat-number">{insights.traffic.clones}</span>
                      <span className="stat-label">Clones</span>
                    </div>
                  </div>
                </div>
                
                <div className="insight-card">
                  <h3>Commits</h3>
                  <div className="insight-stats">
                    <div className="insight-stat">
                      <span className="stat-number">{insights.commits.thisWeek}</span>
                      <span className="stat-label">This week</span>
                    </div>
                    <div className="insight-stat">
                      <span className="stat-number">{insights.commits.thisMonth}</span>
                      <span className="stat-label">This month</span>
                    </div>
                  </div>
                  <div className="contributors-list">
                    <h4>Top contributors</h4>
                    {insights.commits.contributors.map(contributor => (
                      <div key={contributor} className="contributor-item">
                        <span>{contributor}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="insight-card full-width">
                  <h3>Code frequency</h3>
                  <div className="code-frequency-chart">
                    {insights.codeFrequency.map((week, index) => (
                      <div key={index} className="frequency-bar">
                        <div className="frequency-week">{week.week}</div>
                        <div className="frequency-stats">
                          <div className="additions" style={{ height: `${week.additions / 20}px` }}>
                            +{week.additions}
                          </div>
                          <div className="deletions" style={{ height: `${week.deletions / 20}px` }}>
                            -{week.deletions}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <div className="tab-content">
            <div className="security-section">
              <div className="security-overview">
                <h2>Security overview</h2>
                <p>Keep your repository secure with these security features</p>
              </div>
              
              <div className="security-features">
                <div className="security-feature">
                  <div className="feature-icon">
                    <Shield size={24} />
                  </div>
                  <div className="feature-content">
                    <h3>Security advisories</h3>
                    <p>Privately discuss, fix, and publish information about security vulnerabilities</p>
                    <button className="feature-btn">View advisories</button>
                  </div>
                  <div className="feature-status enabled">
                    <CheckCircle size={16} />
                    Enabled
                  </div>
                </div>
                
                <div className="security-feature">
                  <div className="feature-icon">
                    <Search size={24} />
                  </div>
                  <div className="feature-content">
                    <h3>Dependency scanning</h3>
                    <p>Automatically scan dependencies for known vulnerabilities</p>
                    <button className="feature-btn">Configure scanning</button>
                  </div>
                  <div className="feature-status enabled">
                    <CheckCircle size={16} />
                    Enabled
                  </div>
                </div>
                
                <div className="security-feature">
                  <div className="feature-icon">
                    <Code size={24} />
                  </div>
                  <div className="feature-content">
                    <h3>Code scanning</h3>
                    <p>Find security vulnerabilities in your code</p>
                    <button className="feature-btn">Set up code scanning</button>
                  </div>
                  <div className="feature-status disabled">
                    <XCircle size={16} />
                    Not configured
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Owner Profile Modal */}
      {showOwnerProfile && (
        <div className="modal-overlay" onClick={() => setShowOwnerProfile(false)}>
          <div className="modal-content owner-profile-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Repository Owner</h2>
              <button 
                className="modal-close"
                onClick={() => setShowOwnerProfile(false)}
              >
                ✕
              </button>
            </div>
            <div className="owner-profile">
              <div className="owner-avatar-section">
                <img src={ownerProfile.avatar} alt={ownerProfile.name} className="owner-avatar-large" />
                <div className="owner-basic-info">
                  <h3>{ownerProfile.name}</h3>
                  <p className="owner-username">@{ownerProfile.username}</p>
                  <p className="owner-bio">{ownerProfile.bio}</p>
                </div>
              </div>
              
              <div className="owner-details">
                <div className="owner-stats">
                  <div className="owner-stat">
                    <strong>{ownerProfile.followers}</strong>
                    <span>followers</span>
                  </div>
                  <div className="owner-stat">
                    <strong>{ownerProfile.following}</strong>
                    <span>following</span>
                  </div>
                  <div className="owner-stat">
                    <strong>{ownerProfile.publicRepos}</strong>
                    <span>repositories</span>
                  </div>
                  <div className="owner-stat">
                    <strong>{ownerProfile.contributions}</strong>
                    <span>contributions</span>
                  </div>
                </div>
                
                <div className="owner-contact">
                  {ownerProfile.company && (
                    <div className="contact-item">
                      <Building2 size={16} />
                      <span>{ownerProfile.company}</span>
                    </div>
                  )}
                  {ownerProfile.location && (
                    <div className="contact-item">
                      <MapPin size={16} />
                      <span>{ownerProfile.location}</span>
                    </div>
                  )}
                  {ownerProfile.website && (
                    <div className="contact-item">
                      <Globe size={16} />
                      <a href={ownerProfile.website} target="_blank" rel="noopener noreferrer">
                        {ownerProfile.website}
                      </a>
                    </div>
                  )}
                  {ownerProfile.twitter && (
                    <div className="contact-item">
                      <Twitter size={16} />
                      <a href={`https://twitter.com/${ownerProfile.twitter.substring(1)}`} target="_blank" rel="noopener noreferrer">
                        {ownerProfile.twitter}
                      </a>
                    </div>
                  )}
                  {ownerProfile.email && (
                    <div className="contact-item">
                      <Mail size={16} />
                      <a href={`mailto:${ownerProfile.email}`}>{ownerProfile.email}</a>
                    </div>
                  )}
                </div>
                
                <div className="owner-achievements">
                  <h4>
                    <Award size={16} />
                    Achievements
                  </h4>
                  <div className="achievements-badges">
                    {ownerProfile.achievements.map((achievement, index) => (
                      <span key={index} className="achievement-badge">
                        {achievement}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="owner-languages">
                  <h4>
                    <Code size={16} />
                    Languages
                  </h4>
                  <div className="languages-list">
                    {ownerProfile.languages.map((language, index) => (
                      <span key={index} className="language-badge">
                        {language}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="owner-organizations">
                  <h4>
                    <Users size={16} />
                    Organizations
                  </h4>
                  <div className="organizations-list">
                    {ownerProfile.organizations.map((org, index) => (
                      <span key={index} className="org-badge">
                        {org}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="owner-actions">
                  <Link to={`/user/${ownerProfile.username}`} className="btn-primary">
                    View Full Profile
                    <ArrowUpRight size={16} />
                  </Link>
                  <button className="btn-secondary">
                    Follow
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default RepositoryDetail 