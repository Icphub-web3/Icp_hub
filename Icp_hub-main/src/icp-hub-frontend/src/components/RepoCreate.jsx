import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supportedChains } from '../data/dummyData'
import { 
  Github, 
  Settings, 
  Zap, 
  ChevronRight, 
  Check, 
  X,
  Info,
  Plus,
  Trash2
} from 'lucide-react'

function RepoCreate() {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 4

  // Form state
  const [repoData, setRepoData] = useState({
    name: '',
    description: '',
    isPrivate: false,
    language: 'solidity',
    template: 'blank'
  })

  const [selectedChains, setSelectedChains] = useState([])
  const [deploySettings, setDeploySettings] = useState({})
  const [incentivesConfig, setIncentivesConfig] = useState({
    enabled: false,
    rewardPerCommit: '10',
    rewardPerPR: '25',
    totalPool: '1000',
    currency: 'OKY'
  })

  const templates = [
    { id: 'blank', name: 'Blank Repository', description: 'Start from scratch' },
    { id: 'defi', name: 'DeFi Protocol', description: 'ERC-20, DEX, Lending protocols' },
    { id: 'nft', name: 'NFT Collection', description: 'ERC-721, marketplace integration' },
    { id: 'dao', name: 'DAO Governance', description: 'Voting, proposals, treasury' },
    { id: 'dapp', name: 'Full DApp', description: 'Frontend + Smart contracts' }
  ]

  const languages = [
    'Solidity', 'Rust', 'Motoko', 'TypeScript', 'JavaScript', 'Python', 'Go'
  ]

  const handleChainToggle = (chainId) => {
    setSelectedChains(prev => 
      prev.includes(chainId) 
        ? prev.filter(id => id !== chainId)
        : [...prev, chainId]
    )
  }

  const handleDeploySettingChange = (chainId, setting, value) => {
    setDeploySettings(prev => ({
      ...prev,
      [chainId]: {
        ...prev[chainId],
        [setting]: value
      }
    }))
  }

  const handleSubmit = () => {
    // Simulate repository creation
    console.log('Creating repository:', {
      ...repoData,
      selectedChains,
      deploySettings,
      incentivesConfig
    })
    
    // Navigate to the new repository
    navigate('/dashboard')
  }

  const renderStepIndicator = () => (
    <div className="step-indicator">
      {[1, 2, 3, 4].map((step) => (
        <div key={step} className={`step ${currentStep >= step ? 'completed' : ''}`}>
          <div className="step-number">
            {currentStep > step ? <Check size={16} /> : step}
          </div>
          <span className="step-label">
            {step === 1 && 'Basic Info'}
            {step === 2 && 'Blockchain Networks'}
            {step === 3 && 'Deploy Settings'}
            {step === 4 && 'Incentives'}
          </span>
        </div>
      ))}
    </div>
  )

  const renderStep1 = () => (
    <div className="form-step">
      <h2>Repository Information</h2>
      <p>Set up your new repository with basic information and template</p>

      <div className="form-group">
        <label>Repository Name *</label>
        <input
          type="text"
          placeholder="my-awesome-project"
          value={repoData.name}
          onChange={(e) => setRepoData(prev => ({ ...prev, name: e.target.value }))}
          className="form-input"
        />
      </div>

      <div className="form-group">
        <label>Description</label>
        <textarea
          placeholder="Describe your project..."
          value={repoData.description}
          onChange={(e) => setRepoData(prev => ({ ...prev, description: e.target.value }))}
          className="form-textarea"
          rows="3"
        />
      </div>

      <div className="form-group">
        <label>Primary Language</label>
        <select
          value={repoData.language}
          onChange={(e) => setRepoData(prev => ({ ...prev, language: e.target.value }))}
          className="form-select"
        >
          {languages.map(lang => (
            <option key={lang} value={lang.toLowerCase()}>{lang}</option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label>Project Template</label>
        <div className="template-grid">
          {templates.map(template => (
            <div
              key={template.id}
              className={`template-card ${repoData.template === template.id ? 'selected' : ''}`}
              onClick={() => setRepoData(prev => ({ ...prev, template: template.id }))}
            >
              <h4>{template.name}</h4>
              <p>{template.description}</p>
              {repoData.template === template.id && (
                <div className="template-check">
                  <Check size={16} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="form-group">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={repoData.isPrivate}
            onChange={(e) => setRepoData(prev => ({ ...prev, isPrivate: e.target.checked }))}
          />
          <span className="checkbox-custom"></span>
          Make this repository private
        </label>
      </div>
    </div>
  )

  const renderStep2 = () => (
    <div className="form-step">
      <h2>Blockchain Networks</h2>
      <p>Select the blockchain networks you want to deploy to</p>

      <div className="chains-grid">
        {supportedChains.map(chain => (
          <div
            key={chain.id}
            className={`chain-card ${selectedChains.includes(chain.id) ? 'selected' : ''}`}
            onClick={() => handleChainToggle(chain.id)}
          >
            <div className="chain-header">
              <span className="chain-icon" style={{ color: chain.color }}>
                {chain.icon}
              </span>
              <h4>{chain.name}</h4>
              {selectedChains.includes(chain.id) && (
                <div className="chain-check">
                  <Check size={16} />
                </div>
              )}
            </div>
            <div className="chain-details">
              <p>Symbol: {chain.symbol}</p>
              <p>Gas: {chain.gasPrice}</p>
            </div>
          </div>
        ))}
      </div>

      {selectedChains.length === 0 && (
        <div className="info-message">
          <Info size={16} />
          <span>Select at least one blockchain network to continue</span>
        </div>
      )}
    </div>
  )

  const renderStep3 = () => (
    <div className="form-step">
      <h2>Deployment Settings</h2>
      <p>Configure deployment settings for each selected network</p>

      {selectedChains.length === 0 ? (
        <div className="info-message">
          <Info size={16} />
          <span>Please select blockchain networks in the previous step</span>
        </div>
      ) : (
        <div className="deploy-settings">
          {selectedChains.map(chainId => {
            const chain = supportedChains.find(c => c.id === chainId)
            return (
              <div key={chainId} className="deploy-setting-card">
                <div className="deploy-header">
                  <span className="chain-icon" style={{ color: chain.color }}>
                    {chain.icon}
                  </span>
                  <h4>{chain.name}</h4>
                </div>
                
                <div className="deploy-options">
                  <div className="form-group">
                    <label>Auto-deploy on commit</label>
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={deploySettings[chainId]?.autoDeploy || false}
                        onChange={(e) => handleDeploySettingChange(chainId, 'autoDeploy', e.target.checked)}
                      />
                      <span className="checkbox-custom"></span>
                      Enable automatic deployment
                    </label>
                  </div>

                  <div className="form-group">
                    <label>Gas Limit</label>
                    <input
                      type="text"
                      placeholder="3000000"
                      value={deploySettings[chainId]?.gasLimit || ''}
                      onChange={(e) => handleDeploySettingChange(chainId, 'gasLimit', e.target.value)}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label>Constructor Arguments</label>
                    <textarea
                      placeholder="Enter constructor arguments (JSON format)"
                      value={deploySettings[chainId]?.constructorArgs || ''}
                      onChange={(e) => handleDeploySettingChange(chainId, 'constructorArgs', e.target.value)}
                      className="form-textarea"
                      rows="2"
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )

  const renderStep4 = () => (
    <div className="form-step">
      <h2>Developer Incentives</h2>
      <p>Set up rewards for contributors and collaborators</p>

      <div className="form-group">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={incentivesConfig.enabled}
            onChange={(e) => setIncentivesConfig(prev => ({ ...prev, enabled: e.target.checked }))}
          />
          <span className="checkbox-custom"></span>
          Enable developer incentives
        </label>
      </div>

      {incentivesConfig.enabled && (
        <div className="incentives-config">
          <div className="form-row">
            <div className="form-group">
              <label>Reward per Commit</label>
              <div className="input-with-suffix">
                <input
                  type="number"
                  value={incentivesConfig.rewardPerCommit}
                  onChange={(e) => setIncentivesConfig(prev => ({ ...prev, rewardPerCommit: e.target.value }))}
                  className="form-input"
                />
                <span className="input-suffix">OKY</span>
              </div>
            </div>

            <div className="form-group">
              <label>Reward per Pull Request</label>
              <div className="input-with-suffix">
                <input
                  type="number"
                  value={incentivesConfig.rewardPerPR}
                  onChange={(e) => setIncentivesConfig(prev => ({ ...prev, rewardPerPR: e.target.value }))}
                  className="form-input"
                />
                <span className="input-suffix">OKY</span>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label>Total Reward Pool</label>
            <div className="input-with-suffix">
              <input
                type="number"
                value={incentivesConfig.totalPool}
                onChange={(e) => setIncentivesConfig(prev => ({ ...prev, totalPool: e.target.value }))}
                className="form-input"
              />
              <span className="input-suffix">OKY</span>
            </div>
          </div>

          <div className="incentives-preview">
            <h4>Incentive Summary</h4>
            <div className="preview-grid">
              <div className="preview-item">
                <span>Per Commit</span>
                <span>{incentivesConfig.rewardPerCommit} OKY</span>
              </div>
              <div className="preview-item">
                <span>Per Pull Request</span>
                <span>{incentivesConfig.rewardPerPR} OKY</span>
              </div>
              <div className="preview-item">
                <span>Total Pool</span>
                <span>{incentivesConfig.totalPool} OKY</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return repoData.name.trim() !== ''
      case 2:
        return selectedChains.length > 0
      case 3:
        return true // Deploy settings are optional
      case 4:
        return true // Incentives are optional
      default:
        return false
    }
  }

  return (
    <div className="repo-create">
      <div className="container">
        <div className="create-header">
          <h1>Create New Repository</h1>
          <p>Set up a new multichain development project</p>
        </div>

        {renderStepIndicator()}

        <div className="create-form">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}

          <div className="form-actions">
            {currentStep > 1 && (
              <button
                className="btn-secondary"
                onClick={() => setCurrentStep(prev => prev - 1)}
              >
                Previous
              </button>
            )}
            
            <div className="actions-right">
              <button
                className="btn-outline"
                onClick={() => navigate('/dashboard')}
              >
                Cancel
              </button>
              
              {currentStep < totalSteps ? (
                <button
                  className="btn-primary"
                  onClick={() => setCurrentStep(prev => prev + 1)}
                  disabled={!canProceed()}
                >
                  Next
                  <ChevronRight size={16} />
                </button>
              ) : (
                <button
                  className="btn-primary"
                  onClick={handleSubmit}
                  disabled={!canProceed()}
                >
                  <Github size={16} />
                  Create Repository
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RepoCreate 