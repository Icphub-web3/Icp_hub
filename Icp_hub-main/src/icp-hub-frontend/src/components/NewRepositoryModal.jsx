import { useState } from 'react'
import { useWallet } from '../services/walletService.jsx'
import dataService from '../services/dataService'
import { X, GitBranch, Lock, Globe, FileText, Settings, Loader } from 'lucide-react'

function NewRepositoryModal({ isOpen, onClose, onSuccess }) {
  const { currentUser, isConnected } = useWallet() 
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isPrivate: false,
    initializeWithReadme: true,
    license: '',
    gitignoreTemplate: ''
  })
  
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  const licenseOptions = [
    { value: '', label: 'No license' },
    { value: 'MIT', label: 'MIT License' },
    { value: 'Apache-2.0', label: 'Apache License 2.0' },
    { value: 'GPL-3.0', label: 'GNU GPL v3' },
    { value: 'BSD-3-Clause', label: 'BSD 3-Clause' },
    { value: 'MPL-2.0', label: 'Mozilla Public License 2.0' },
  ]

  const gitignoreTemplates = [
    { value: '', label: 'None' },
    { value: 'Node', label: 'Node.js' },
    { value: 'Python', label: 'Python' },
    { value: 'Rust', label: 'Rust' },
    { value: 'Go', label: 'Go' },
    { value: 'Java', label: 'Java' },
    { value: 'Motoko', label: 'Motoko' },
  ]

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    // Repository name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Repository name is required'
    } else if (formData.name.length < 1 || formData.name.length > 100) {
      newErrors.name = 'Repository name must be between 1 and 100 characters'
    } else if (!/^[a-zA-Z0-9._-]+$/.test(formData.name)) {
      newErrors.name = 'Repository name can only contain alphanumeric characters, periods, hyphens, and underscores'
    } else if (formData.name.startsWith('.') || formData.name.startsWith('-') || formData.name.startsWith('_')) {
      newErrors.name = 'Repository name cannot start with a period, hyphen, or underscore'
    } else if (formData.name.endsWith('.') || formData.name.endsWith('-') || formData.name.endsWith('_')) {
      newErrors.name = 'Repository name cannot end with a period, hyphen, or underscore'
    }
    
    // Description validation (optional)
    if (formData.description && formData.description.length > 500) {
      newErrors.description = 'Description must be less than 500 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    if (!isConnected) {
      setErrors({ general: 'Please connect your wallet first' })
      return
    }

    setIsSubmitting(true)
    setErrors({})
    
    try {
      const repositoryData = {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        isPrivate: formData.isPrivate,
        initializeWithReadme: formData.initializeWithReadme,
        license: formData.license || null,
        gitignoreTemplate: formData.gitignoreTemplate || null,
      }

      console.log('Creating repository with data:', repositoryData)
      const result = await dataService.createRepository(repositoryData)
      
      if (result.success) {
        setSubmitSuccess(true)
        
        // Call onSuccess callback if provided
        if (onSuccess) {
          onSuccess(result.data)
        }
        
        // Show success for a moment, then close
        setTimeout(() => {
          handleClose()
        }, 2000)
      } else {
        // Handle creation error with improved error parsing
        let errorMessage = 'Failed to create repository'
        
        if (result.error) {
          errorMessage = dataService.parseApiError(result.error)
        }
        
        if (errorMessage.toLowerCase().includes('name') && errorMessage.toLowerCase().includes('taken')) {
          setErrors({ name: 'Repository name is already taken' })
        } else if (errorMessage.toLowerCase().includes('unauthorized')) {
          setErrors({ general: 'Please connect your wallet and try again' })
        } else {
          setErrors({ general: errorMessage })
        }
      }
    } catch (error) {
      console.error('Repository creation error:', error)
      setErrors({ general: 'An unexpected error occurred. Please try again.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({
        name: '',
        description: '',
        isPrivate: false,
        initializeWithReadme: true,
        license: '',
        gitignoreTemplate: ''
      })
      setErrors({})
      setSubmitSuccess(false)
      onClose()
    }
  }

  if (!isOpen) return null

  if (submitSuccess) {
    return (
      <div className="modal-overlay">
        <div className="modal-content success-modal">
          <div className="success-content">
            <div className="success-icon">
              <GitBranch size={48} />
            </div>
            <h2>Repository Created!</h2>
            <p>Your repository "{formData.name}" has been successfully created.</p>
            <div className="loading-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>
            <GitBranch size={24} />
            Create a new repository
          </h2>
          <button 
            className="modal-close"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            <X size={20} />
          </button>
        </div>

        {errors.general && (
          <div className="error-message">
            {errors.general}
          </div>
        )}

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-section">
            <div className="form-group">
              <label htmlFor="owner">Owner</label>
              <div className="owner-field">
                <img 
                  src={currentUser?.profile?.avatar || `https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=24&h=24&fit=crop&crop=face`}
                  alt={currentUser?.username || 'User'}
                  className="owner-avatar"
                />
                <span className="owner-name">
                  {currentUser?.username || 'You'}
                </span>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="name">
                Repository name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="my-awesome-project"
                disabled={isSubmitting}
                autoFocus
              />
              {errors.name && (
                <span className="error-text">{errors.name}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="description">
                Description (optional)
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="A short description of your repository"
                rows={3}
                disabled={isSubmitting}
              />
              {errors.description && (
                <span className="error-text">{errors.description}</span>
              )}
            </div>
          </div>

          <div className="form-section">
            <div className="visibility-section">
              <div className="visibility-option">
                <label className="radio-label">
                  <input
                    type="radio"
                    name="isPrivate"
                    value={false}
                    checked={!formData.isPrivate}
                    onChange={(e) => setFormData(prev => ({ ...prev, isPrivate: false }))}
                    disabled={isSubmitting}
                  />
                  <div className="radio-content">
                    <div className="radio-header">
                      <Globe size={16} />
                      <span>Public</span>
                    </div>
                    <p>Anyone on the internet can see this repository</p>
                  </div>
                </label>
              </div>

              <div className="visibility-option">
                <label className="radio-label">
                  <input
                    type="radio"
                    name="isPrivate"
                    value={true}
                    checked={formData.isPrivate}
                    onChange={(e) => setFormData(prev => ({ ...prev, isPrivate: true }))}
                    disabled={isSubmitting}
                  />
                  <div className="radio-content">
                    <div className="radio-header">
                      <Lock size={16} />
                      <span>Private</span>
                    </div>
                    <p>Only you can see and commit to this repository</p>
                  </div>
                </label>
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>
              <Settings size={18} />
              Initialize this repository with:
            </h3>

            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="initializeWithReadme"
                  checked={formData.initializeWithReadme}
                  onChange={handleChange}
                  disabled={isSubmitting}
                />
                <div className="checkbox-content">
                  <div className="checkbox-header">
                    <FileText size={16} />
                    <span>Add a README file</span>
                  </div>
                  <p>This is where you can write a long description for your project</p>
                </div>
              </label>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="gitignoreTemplate">
                  Add .gitignore
                </label>
                <select
                  id="gitignoreTemplate"
                  name="gitignoreTemplate"
                  value={formData.gitignoreTemplate}
                  onChange={handleChange}
                  disabled={isSubmitting}
                >
                  {gitignoreTemplates.map(template => (
                    <option key={template.value} value={template.value}>
                      {template.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="license">
                  Choose a license
                </label>
                <select
                  id="license"
                  name="license"
                  value={formData.license}
                  onChange={handleChange}
                  disabled={isSubmitting}
                >
                  {licenseOptions.map(license => (
                    <option key={license.value} value={license.value}>
                      {license.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button 
              type="button" 
              className="btn-secondary"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn-primary"
              disabled={isSubmitting || !formData.name.trim()}
            >
              {isSubmitting ? (
                <>
                  <Loader size={16} className="spinner" />
                  Creating repository...
                </>
              ) : (
                <>
                  <GitBranch size={16} />
                  Create repository
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default NewRepositoryModal
