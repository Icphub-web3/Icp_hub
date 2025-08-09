import { useState } from 'react'
import { Link } from 'react-router-dom'
import { mockIPFSFiles } from '../data/dummyData'
import { 
  FileText, 
  Folder, 
  Upload, 
  Download, 
  Eye, 
  Copy,
  ExternalLink,
  Search,
  Filter,
  Calendar,
  User,
  HardDrive,
  Plus,
  Trash2,
  Share,
  Database
} from 'lucide-react'

function Storage() {
  const [files] = useState(mockIPFSFiles)
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [repositoryFilter, setRepositoryFilter] = useState('all')
  const [showUploadForm, setShowUploadForm] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState([])

  const filteredFiles = files.filter(file => {
    const matchesSearch = file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         file.hash.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesType = typeFilter === 'all' || file.type === typeFilter
    const matchesRepo = repositoryFilter === 'all' || file.repository === repositoryFilter
    
    return matchesSearch && matchesType && matchesRepo
  })

  const getFileIcon = (type) => {
    switch (type) {
      case 'solidity':
        return '📄'
      case 'markdown':
        return '📝'
      case 'archive':
        return '📦'
      case 'image':
        return '🖼️'
      case 'video':
        return '🎥'
      case 'audio':
        return '🎵'
      default:
        return '📄'
    }
  }

  const getFileTypeColor = (type) => {
    switch (type) {
      case 'solidity':
        return 'text-purple-600 bg-purple-100'
      case 'markdown':
        return 'text-blue-600 bg-blue-100'
      case 'archive':
        return 'text-orange-600 bg-orange-100'
      case 'image':
        return 'text-green-600 bg-green-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const formatTimeAgo = (timestamp) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diff = now - time
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(hours / 24)
    
    if (days > 0) return `${days}d ago`
    if (hours > 0) return `${hours}h ago`
    return 'Just now'
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    // Show toast notification
    console.log('Copied to clipboard:', text)
  }

  const handleFileSelect = (fileId) => {
    setSelectedFiles(prev => 
      prev.includes(fileId) 
        ? prev.filter(id => id !== fileId)
        : [...prev, fileId]
    )
  }

  const renderFileCard = (file) => (
    <div key={file.id} className={`file-card ${selectedFiles.includes(file.id) ? 'selected' : ''}`}>
      <div className="file-header">
        <div className="file-select">
          <input
            type="checkbox"
            checked={selectedFiles.includes(file.id)}
            onChange={() => handleFileSelect(file.id)}
          />
        </div>
        <div className="file-icon">
          <span className="file-emoji">{getFileIcon(file.type)}</span>
        </div>
        <div className="file-info">
          <h4 className="file-name">{file.name}</h4>
          <span className={`file-type-badge ${getFileTypeColor(file.type)}`}>
            {file.type}
          </span>
        </div>
      </div>

      <div className="file-details">
        <div className="detail-row">
          <span className="label">IPFS Hash:</span>
          <div className="hash-container">
            <code className="hash">{file.hash}</code>
            <button
              className="copy-btn"
              onClick={() => copyToClipboard(file.hash)}
              title="Copy to clipboard"
            >
              <Copy size={14} />
            </button>
          </div>
        </div>
        
        <div className="detail-row">
          <span className="label">Size:</span>
          <span className="value">{file.size}</span>
        </div>

        {file.repository && (
          <div className="detail-row">
            <span className="label">Repository:</span>
            <Link to={`/repo/${file.repository}`} className="repo-link">
              {file.repository}
            </Link>
          </div>
        )}

        <div className="detail-row">
          <span className="label">Uploaded:</span>
          <span className="value">{formatTimeAgo(file.uploadedAt)}</span>
        </div>

        <div className="detail-row">
          <span className="label">Uploader:</span>
          <span className="value">{file.uploader}</span>
        </div>
      </div>

      <div className="file-actions">
        <button className="btn-outline">
          <Eye size={16} />
          Preview
        </button>
        <button className="btn-outline">
          <Download size={16} />
          Download
        </button>
        <button className="btn-outline">
          <Share size={16} />
          Share
        </button>
        <a 
          href={`https://ipfs.io/ipfs/${file.hash}`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-secondary"
        >
          <ExternalLink size={16} />
          View on IPFS
        </a>
      </div>
    </div>
  )

  const renderUploadForm = () => (
    <div className="upload-form">
      <div className="form-header">
        <h3>Upload to IPFS</h3>
        <button 
          className="btn-outline"
          onClick={() => setShowUploadForm(false)}
        >
          Cancel
        </button>
      </div>

      <div className="form-content">
        <div className="upload-area">
          <div className="upload-icon">
            <Upload size={48} />
          </div>
          <h4>Drag & drop files here</h4>
          <p>or click to select files</p>
          <input
            type="file"
            multiple
            className="file-input"
            style={{ display: 'none' }}
          />
          <button className="btn-primary upload-btn">
            Select Files
          </button>
        </div>

        <div className="form-group">
          <label>Associate with Repository (Optional)</label>
          <select className="form-select">
            <option value="">No repository</option>
            <option value="defi-protocol">defi-protocol</option>
            <option value="nft-marketplace">nft-marketplace</option>
            <option value="dao-governance">dao-governance</option>
          </select>
        </div>

        <div className="form-group">
          <label className="checkbox-label">
            <input type="checkbox" />
            <span className="checkbox-custom"></span>
            Pin to IPFS permanently
          </label>
          <span className="form-hint">
            Pinned files are guaranteed to remain available on the network
          </span>
        </div>

        <div className="upload-info">
          <h4>Upload Information</h4>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">Storage Cost:</span>
              <span className="info-value">0.001 ICP per MB</span>
            </div>
            <div className="info-item">
              <span className="info-label">Max File Size:</span>
              <span className="info-value">100 MB</span>
            </div>
            <div className="info-item">
              <span className="info-label">Supported Formats:</span>
              <span className="info-value">All file types</span>
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button className="btn-secondary">
            Add to Queue
          </button>
          <button className="btn-primary">
            <Upload size={16} />
            Upload Files
          </button>
        </div>
      </div>
    </div>
  )

  const getTotalStorageUsed = () => {
    return files.reduce((total, file) => {
      const sizeInMB = parseFloat(file.size.replace(/[^0-9.]/g, ''))
      return total + sizeInMB
    }, 0).toFixed(1)
  }

  const getUniqueRepositories = () => {
    return [...new Set(files.map(f => f.repository).filter(Boolean))]
  }

  return (
    <div className="storage-page">
      <div className="container">
        <div className="page-header">
          <div className="header-content">
            <h1>IPFS Storage</h1>
            <p>Manage your decentralized file storage with IPFS integration</p>
          </div>
          <button 
            className="btn-primary"
            onClick={() => setShowUploadForm(true)}
          >
            <Upload size={16} />
            Upload Files
          </button>
        </div>

        {showUploadForm ? renderUploadForm() : (
          <>
            {/* Storage Stats */}
            <div className="storage-stats">
              <div className="stat-card">
                <div className="stat-icon">
                  <Database size={24} />
                </div>
                <div className="stat-content">
                  <h3>Total Files</h3>
                  <p className="stat-value">{files.length}</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">
                  <HardDrive size={24} />
                </div>
                <div className="stat-content">
                  <h3>Storage Used</h3>
                  <p className="stat-value">{getTotalStorageUsed()} MB</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">
                  <Folder size={24} />
                </div>
                <div className="stat-content">
                  <h3>Repositories</h3>
                  <p className="stat-value">{getUniqueRepositories().length}</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">
                  <ExternalLink size={24} />
                </div>
                <div className="stat-content">
                  <h3>Pinned Files</h3>
                  <p className="stat-value">{Math.floor(files.length * 0.7)}</p>
                </div>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="storage-controls">
              <div className="search-section">
                <div className="search-input">
                  <Search size={18} />
                  <input
                    type="text"
                    placeholder="Search files by name or hash..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div className="filters-section">
                <div className="filter-group">
                  <label>File Type</label>
                  <select 
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="filter-select"
                  >
                    <option value="all">All Types</option>
                    <option value="solidity">Solidity</option>
                    <option value="markdown">Markdown</option>
                    <option value="archive">Archive</option>
                    <option value="image">Image</option>
                  </select>
                </div>

                <div className="filter-group">
                  <label>Repository</label>
                  <select 
                    value={repositoryFilter}
                    onChange={(e) => setRepositoryFilter(e.target.value)}
                    className="filter-select"
                  >
                    <option value="all">All Repositories</option>
                    {getUniqueRepositories().map(repo => (
                      <option key={repo} value={repo}>{repo}</option>
                    ))}
                    <option value="">No repository</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Bulk Actions */}
            {selectedFiles.length > 0 && (
              <div className="bulk-actions">
                <span className="selection-count">
                  {selectedFiles.length} file{selectedFiles.length !== 1 ? 's' : ''} selected
                </span>
                <div className="bulk-buttons">
                  <button className="btn-outline">
                    <Download size={16} />
                    Download Selected
                  </button>
                  <button className="btn-outline">
                    <Share size={16} />
                    Share Selected
                  </button>
                  <button className="btn-outline danger">
                    <Trash2 size={16} />
                    Delete Selected
                  </button>
                </div>
              </div>
            )}

            {/* Files Grid */}
            <div className="storage-content">
              {filteredFiles.length === 0 ? (
                <div className="empty-state">
                  <Database size={48} />
                  <h3>No files found</h3>
                  <p>Upload your first file to IPFS to get started</p>
                  <button 
                    className="btn-primary"
                    onClick={() => setShowUploadForm(true)}
                  >
                    <Upload size={16} />
                    Upload First File
                  </button>
                </div>
              ) : (
                <div className="files-grid">
                  {filteredFiles.map(renderFileCard)}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default Storage 