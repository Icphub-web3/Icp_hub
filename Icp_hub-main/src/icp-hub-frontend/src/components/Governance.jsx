import { useState } from 'react'
import { mockProposals, mockUser } from '../data/dummyData'
import { 
  Vote, 
  Clock, 
  User, 
  TrendingUp, 
  Check, 
  X, 
  Minus,
  Calendar,
  Users,
  DollarSign,
  AlertCircle,
  CheckCircle,
  Info,
  Plus
} from 'lucide-react'

function Governance() {
  const [proposals] = useState(mockProposals)
  const [user] = useState(mockUser)
  const [selectedTab, setSelectedTab] = useState('active')
  const [selectedProposal, setSelectedProposal] = useState(null)
  const [voteChoice, setVoteChoice] = useState('')
  const [votingPower, setVotingPower] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)

  const filteredProposals = proposals.filter(proposal => {
    switch (selectedTab) {
      case 'active':
        return proposal.status === 'active'
      case 'pending':
        return proposal.status === 'pending'
      case 'executed':
        return proposal.status === 'executed'
      default:
        return true
    }
  })

  const formatTimeLeft = (endTime) => {
    const now = new Date()
    const end = new Date(endTime)
    const diff = end - now
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    
    if (diff <= 0) return 'Voting ended'
    if (days > 0) return `${days}d ${hours}h left`
    return `${hours}h left`
  }

  const getVotingProgress = (proposal) => {
    const total = parseInt(proposal.totalVotes)
    const threshold = parseInt(proposal.threshold)
    return Math.min((total / threshold) * 100, 100)
  }

  const getVotePercentage = (votes, total) => {
    if (total === 0) return 0
    return ((parseInt(votes) / parseInt(total)) * 100).toFixed(1)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-100'
      case 'pending':
        return 'text-blue-600 bg-blue-100'
      case 'executed':
        return 'text-gray-600 bg-gray-100'
      case 'failed':
        return 'text-red-600 bg-red-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getCategoryColor = (category) => {
    switch (category) {
      case 'protocol':
        return 'text-purple-600 bg-purple-100'
      case 'treasury':
        return 'text-yellow-600 bg-yellow-100'
      case 'integration':
        return 'text-blue-600 bg-blue-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const handleVote = (proposal) => {
    if (voteChoice && votingPower) {
      console.log(`Voting ${voteChoice} on proposal ${proposal.id} with ${votingPower} voting power`)
      setSelectedProposal(null)
      setVoteChoice('')
      setVotingPower('')
    }
  }

  const renderProposalCard = (proposal) => (
    <div key={proposal.id} className="proposal-card">
      <div className="proposal-header">
        <div className="proposal-title-section">
          <h3 className="proposal-title">{proposal.title}</h3>
          <div className="proposal-badges">
            <span className={`badge ${getStatusColor(proposal.status)}`}>
              {proposal.status}
            </span>
            <span className={`badge ${getCategoryColor(proposal.category)}`}>
              {proposal.category}
            </span>
          </div>
        </div>
        <div className="proposal-id">#{proposal.id.split('_')[1]}</div>
      </div>

      <p className="proposal-description">{proposal.description}</p>

      <div className="proposal-meta">
        <div className="meta-item">
          <User size={14} />
          <span>Proposed by {proposal.proposer}</span>
        </div>
        <div className="meta-item">
          <Calendar size={14} />
          <span>{formatTimeLeft(proposal.endTime)}</span>
        </div>
        <div className="meta-item">
          <Users size={14} />
          <span>{parseInt(proposal.totalVotes).toLocaleString()} votes</span>
        </div>
      </div>

      {/* Voting Progress */}
      <div className="voting-section">
        <div className="voting-progress">
          <div className="progress-header">
            <span>Voting Progress</span>
            <span>{getVotingProgress(proposal).toFixed(1)}% of threshold</span>
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ width: `${getVotingProgress(proposal)}%` }}
            ></div>
          </div>
        </div>

        <div className="vote-breakdown">
          <div className="vote-option for">
            <div className="vote-header">
              <Check size={16} />
              <span>For</span>
              <span>{getVotePercentage(proposal.votes.for, proposal.totalVotes)}%</span>
            </div>
            <div className="vote-bar">
              <div 
                className="vote-fill for"
                style={{ width: `${getVotePercentage(proposal.votes.for, proposal.totalVotes)}%` }}
              ></div>
            </div>
            <span className="vote-count">{parseInt(proposal.votes.for).toLocaleString()} votes</span>
          </div>

          <div className="vote-option against">
            <div className="vote-header">
              <X size={16} />
              <span>Against</span>
              <span>{getVotePercentage(proposal.votes.against, proposal.totalVotes)}%</span>
            </div>
            <div className="vote-bar">
              <div 
                className="vote-fill against"
                style={{ width: `${getVotePercentage(proposal.votes.against, proposal.totalVotes)}%` }}
              ></div>
            </div>
            <span className="vote-count">{parseInt(proposal.votes.against).toLocaleString()} votes</span>
          </div>

          <div className="vote-option abstain">
            <div className="vote-header">
              <Minus size={16} />
              <span>Abstain</span>
              <span>{getVotePercentage(proposal.votes.abstain, proposal.totalVotes)}%</span>
            </div>
            <div className="vote-bar">
              <div 
                className="vote-fill abstain"
                style={{ width: `${getVotePercentage(proposal.votes.abstain, proposal.totalVotes)}%` }}
              ></div>
            </div>
            <span className="vote-count">{parseInt(proposal.votes.abstain).toLocaleString()} votes</span>
          </div>
        </div>
      </div>

      <div className="proposal-actions">
        <button className="btn-outline">
          View Details
        </button>
        {proposal.status === 'active' && (
          <button 
            className="btn-primary"
            onClick={() => setSelectedProposal(proposal)}
          >
            <Vote size={16} />
            Vote
          </button>
        )}
      </div>
    </div>
  )

  const renderVotingModal = () => {
    if (!selectedProposal) return null

    return (
      <div className="modal-overlay" onClick={() => setSelectedProposal(null)}>
        <div className="modal-content voting-modal" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h3>Vote on Proposal</h3>
            <button onClick={() => setSelectedProposal(null)}>×</button>
          </div>

          <div className="modal-body">
            <div className="proposal-summary">
              <h4>{selectedProposal.title}</h4>
              <p>{selectedProposal.description}</p>
            </div>

            <div className="voting-form">
              <div className="form-group">
                <label>Your Vote</label>
                <div className="vote-options">
                  <label className={`vote-option-label ${voteChoice === 'for' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="vote"
                      value="for"
                      checked={voteChoice === 'for'}
                      onChange={(e) => setVoteChoice(e.target.value)}
                    />
                    <Check size={16} />
                    For
                  </label>
                  <label className={`vote-option-label ${voteChoice === 'against' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="vote"
                      value="against"
                      checked={voteChoice === 'against'}
                      onChange={(e) => setVoteChoice(e.target.value)}
                    />
                    <X size={16} />
                    Against
                  </label>
                  <label className={`vote-option-label ${voteChoice === 'abstain' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="vote"
                      value="abstain"
                      checked={voteChoice === 'abstain'}
                      onChange={(e) => setVoteChoice(e.target.value)}
                    />
                    <Minus size={16} />
                    Abstain
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label>Voting Power</label>
                <div className="input-with-suffix">
                  <input
                    type="number"
                    placeholder="0"
                    value={votingPower}
                    onChange={(e) => setVotingPower(e.target.value)}
                    max={user.stakedTokens}
                    className="form-input"
                  />
                  <span className="input-suffix">OKY</span>
                </div>
                <span className="form-hint">
                  Available: {user.stakedTokens} OKY
                </span>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button 
              className="btn-outline"
              onClick={() => setSelectedProposal(null)}
            >
              Cancel
            </button>
            <button 
              className="btn-primary"
              onClick={() => handleVote(selectedProposal)}
              disabled={!voteChoice || !votingPower}
            >
              <Vote size={16} />
              Submit Vote
            </button>
          </div>
        </div>
      </div>
    )
  }

  const renderCreateProposalForm = () => (
    <div className="create-proposal-form">
      <div className="form-header">
        <h3>Create New Proposal</h3>
        <button 
          className="btn-outline"
          onClick={() => setShowCreateForm(false)}
        >
          Cancel
        </button>
      </div>

      <div className="form-content">
        <div className="form-group">
          <label>Proposal Title *</label>
          <input
            type="text"
            placeholder="Brief description of the proposal"
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label>Detailed Description *</label>
          <textarea
            placeholder="Provide comprehensive details about the proposal, including rationale and implementation details"
            className="form-textarea"
            rows="6"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Category *</label>
            <select className="form-select">
              <option value="">Select category</option>
              <option value="protocol">Protocol</option>
              <option value="treasury">Treasury</option>
              <option value="integration">Integration</option>
              <option value="governance">Governance</option>
            </select>
          </div>

          <div className="form-group">
            <label>Voting Duration *</label>
            <select className="form-select">
              <option value="7">7 days</option>
              <option value="14">14 days</option>
              <option value="21">21 days</option>
              <option value="30">30 days</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label>Minimum Voting Threshold</label>
          <div className="input-with-suffix">
            <input
              type="number"
              placeholder="500000"
              className="form-input"
            />
            <span className="input-suffix">OKY</span>
          </div>
          <span className="form-hint">
            Minimum total votes required for the proposal to be valid
          </span>
        </div>

        <div className="form-actions">
          <button className="btn-secondary">
            Save as Draft
          </button>
          <button className="btn-primary">
            <Plus size={16} />
            Submit Proposal
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="governance-page">
      <div className="container">
        <div className="page-header">
          <div className="header-content">
            <h1>Governance</h1>
            <p>Participate in OpenKey's decentralized governance by voting on proposals</p>
          </div>
          <button 
            className="btn-primary"
            onClick={() => setShowCreateForm(true)}
          >
            <Plus size={16} />
            Create Proposal
          </button>
        </div>

        {showCreateForm ? renderCreateProposalForm() : (
          <>
            {/* Governance Stats */}
            <div className="governance-stats">
              <div className="stat-card">
                <div className="stat-icon">
                  <TrendingUp size={24} />
                </div>
                <div className="stat-content">
                  <h3>Your Voting Power</h3>
                  <p className="stat-value">{user.stakedTokens} OKY</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">
                  <Vote size={24} />
                </div>
                <div className="stat-content">
                  <h3>Active Proposals</h3>
                  <p className="stat-value">{proposals.filter(p => p.status === 'active').length}</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">
                  <CheckCircle size={24} />
                </div>
                <div className="stat-content">
                  <h3>Proposals Passed</h3>
                  <p className="stat-value">{proposals.filter(p => p.status === 'executed').length}</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">
                  <DollarSign size={24} />
                </div>
                <div className="stat-content">
                  <h3>Treasury Value</h3>
                  <p className="stat-value">$2.5M</p>
                </div>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="tab-navigation">
              <button 
                className={`tab ${selectedTab === 'active' ? 'active' : ''}`}
                onClick={() => setSelectedTab('active')}
              >
                <Vote size={16} />
                Active ({proposals.filter(p => p.status === 'active').length})
              </button>
              <button 
                className={`tab ${selectedTab === 'pending' ? 'active' : ''}`}
                onClick={() => setSelectedTab('pending')}
              >
                <Clock size={16} />
                Pending ({proposals.filter(p => p.status === 'pending').length})
              </button>
              <button 
                className={`tab ${selectedTab === 'executed' ? 'active' : ''}`}
                onClick={() => setSelectedTab('executed')}
              >
                <CheckCircle size={16} />
                Executed ({proposals.filter(p => p.status === 'executed').length})
              </button>
            </div>

            {/* Proposals List */}
            <div className="proposals-content">
              {filteredProposals.length === 0 ? (
                <div className="empty-state">
                  <AlertCircle size={48} />
                  <h3>No proposals found</h3>
                  <p>No {selectedTab} proposals at the moment</p>
                </div>
              ) : (
                <div className="proposals-list">
                  {filteredProposals.map(renderProposalCard)}
                </div>
              )}
            </div>
          </>
        )}

        {renderVotingModal()}
      </div>
    </div>
  )
}

export default Governance 