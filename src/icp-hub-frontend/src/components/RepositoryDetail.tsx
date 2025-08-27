// src/icp-hub-frontend/src/components/RepositoryDetail.tsx

import { useState, useEffect } from 'react'
import type { Repository } from '../types/repository'
import { repositoryService } from '../services/repositoryService'
import fileService, { type FileUploadProgress } from '../services/fileService'
import PageLayout from './PageLayout'
import ProfileModal from './ProfileModal'
import FileExplorer from './FileExplorer'
import CreateFolderModal from './CreateFolderModal'
import FileUploadModal from './FileUploadModal'
import FileStatusDisplay, { type FileOperation } from './FileStatusDisplay'
import './RepositoryDetail.css'

// Import the FileNode type from your types
interface FileNode {
  path: string
  name: string
  isFolder: boolean
  size?: number
  lastModified?: string | number
  children?: FileNode[]
}

interface RepositoryDetailProps {
  repositoryId: string
  onBack: () => void
}

function RepositoryDetail({ repositoryId, onBack }: RepositoryDetailProps) {
  const [repository, setRepository] = useState<Repository | null>(null)
  const [creator, setCreator] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'files' | 'commits' | 'collaborators' | 'settings'>('files')
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  
  // File management states
  const [selectedFile, setSelectedFile] = useState<FileNode | null>(null)
  const [fileContent, setFileContent] = useState<string>('')
  const [showFileViewer, setShowFileViewer] = useState(false)
  const [showCreateFolder, setShowCreateFolder] = useState(false)
  const [showFileUpload, setShowFileUpload] = useState(false)
  const [currentPath, setCurrentPath] = useState<string>('')
  const [breadcrumbs, setBreadcrumbs] = useState<string[]>([])
  const [fileOperations, setFileOperations] = useState<FileOperation[]>([])
  const [fileExplorerRefresh, setFileExplorerRefresh] = useState(0)

  // Helper function to safely format dates
  const formatDate = (date: string | number | undefined): string => {
    if (!date) return 'Unknown'
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : new Date(date)
      return dateObj.toLocaleDateString()
    } catch {
      return 'Unknown'
    }
  }

  useEffect(() => {
    const fetchRepositoryDetail = async () => {
      try {
        setLoading(true)
        setError(null)
        
        console.log('Fetching repository with ID:', repositoryId)
        const repoData = await repositoryService.getRepository(repositoryId)
        
        // Ensure all required fields have default values
        const normalizedRepo = {
          ...repoData,
          watchers: repoData.watchers || 0,
          issues: repoData.issues || 0,
          visibility: repoData.visibility || ((repoData as any).isPrivate ? 'private' : 'public'),
          chains: repoData.chains || (repoData as any).supportedChains || [],
          createdAt: typeof repoData.createdAt === 'string' ? repoData.createdAt : new Date(repoData.createdAt).toISOString(),
          updatedAt: typeof repoData.updatedAt === 'string' ? repoData.updatedAt : new Date(repoData.updatedAt).toISOString(),
        } as Repository
        
        setRepository(normalizedRepo)
        
        // Fetch creator profile (mock data for now)
        setCreator({
          principal: repoData.owner || '2vxsx-fae',
          name: 'OpenKeyHub Developer',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=developer',
          bio: 'Building the future of Web3 development',
          location: 'Internet Computer',
          website: 'https://openkeyhub.com',
          twitter: '@openkeyhub',
          github: 'openkeyhub',
          joinedDate: '2024-01-15',
          repositories: 12,
          followers: 156,
          following: 89,
          contributions: 234
        })
      } catch (err) {
        console.error('Error fetching repository:', err)
        setError(err instanceof Error ? err.message : 'Failed to load repository details')
      } finally {
        setLoading(false)
      }
    }

    if (repositoryId) {
      fetchRepositoryDetail()
    } else {
      setError('No repository ID provided')
      setLoading(false)
    }
  }, [repositoryId])

  // Update breadcrumbs when path changes
  useEffect(() => {
    if (currentPath) {
      setBreadcrumbs(currentPath.split('/').filter(Boolean))
    } else {
      setBreadcrumbs([])
    }
  }, [currentPath])

  // File management functions
  const handleFileSelect = async (file: FileNode) => {
    if (!file.isFolder) {
      setSelectedFile(file)
      try {
        const content = await fileService.getFileContent(repositoryId, file.path)
        setFileContent(content)
        setShowFileViewer(true)
      } catch (err) {
        console.error('Failed to load file content:', err)
      }
    } else {
      setCurrentPath(file.path)
    }
  }

  const handleFileUpload = async (files: File[]) => {
    // Create operation for each file
    const operations: FileOperation[] = files.map((file, index) => ({
      id: `upload-${Date.now()}-${index}`,
      type: 'upload',
      status: 'pending',
      message: `Uploading ${file.name}`,
      details: `To ${currentPath ? `${currentPath}/` : ''}`,
      timestamp: new Date(),
      progress: 0
    }))

    setFileOperations(prev => [...prev, ...operations])

    try {
      const uploadedFiles = await fileService.uploadMultipleFiles(
        repositoryId,
        files,
        currentPath,
        (fileName: string, progress: FileUploadProgress) => {
          // Update operation progress
          setFileOperations(prev => prev.map(op => 
            op.message === `Uploading ${fileName}` 
              ? { ...op, progress: progress.percentage }
              : op
          ))
        }
      )
      
      // Update operations to success
      setFileOperations(prev => prev.map(op => 
        op.type === 'upload' && op.status === 'pending'
          ? { ...op, status: 'success', message: `Uploaded ${op.message.replace('Uploading ', '')}` }
          : op
      ))
      
      console.log('Files uploaded successfully:', uploadedFiles)
      
      // Refresh file explorer
      refreshFileExplorer()
      
    } catch (err) {
      console.error('Failed to upload files:', err)
      
      // Update operations to error
      setFileOperations(prev => prev.map(op => 
        op.type === 'upload' && op.status === 'pending'
          ? { ...op, status: 'error', message: `Failed to upload ${op.message.replace('Uploading ', '')}` }
          : op
      ))
    }
  }

  const handleCreateFolder = async (folderName: string) => {
    const operation: FileOperation = {
      id: `create-folder-${Date.now()}`,
      type: 'create-folder',
      status: 'pending',
      message: `Creating folder ${folderName}`,
      details: `In ${currentPath ? `${currentPath}/` : ''}`,
      timestamp: new Date()
    }

    setFileOperations(prev => [...prev, operation])

    try {
      await fileService.createFolder(repositoryId, currentPath, folderName)
      setShowCreateFolder(false)
      
      // Update operation to success
      setFileOperations(prev => prev.map(op => 
        op.id === operation.id 
          ? { ...op, status: 'success', message: `Created folder ${folderName}` }
          : op
      ))
      
      // Refresh file explorer
      refreshFileExplorer()
      
    } catch (err) {
      console.error('Failed to create folder:', err)
      
      // Update operation to error
      setFileOperations(prev => prev.map(op => 
        op.id === operation.id 
          ? { ...op, status: 'error', message: `Failed to create folder ${folderName}` }
          : op
      ))
    }
  }

  const navigateToBreadcrumb = (index: number) => {
    if (index === -1) {
      setCurrentPath('')
    } else {
      const newPath = breadcrumbs.slice(0, index + 1).join('/')
      setCurrentPath(newPath)
    }
  }

  const dismissFileOperation = (id: string) => {
    setFileOperations(prev => prev.filter(op => op.id !== id))
  }

  const clearAllFileOperations = () => {
    setFileOperations([])
  }

  const refreshFileExplorer = () => {
    setFileExplorerRefresh(prev => prev + 1)
  }

  if (loading) {
    return (
      <PageLayout>
        <div className="repository-detail-loading">
          <div className="loading-spinner"></div>
          <p>Loading repository details...</p>
        </div>
      </PageLayout>
    )
  }

  if (error || !repository) {
    return (
      <PageLayout>
        <div className="repository-detail-error">
          <h3>Error Loading Repository</h3>
          <p>{error || 'Repository not found'}</p>
          <button onClick={onBack} className="back-btn">Go Back</button>
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout>
      <div className="repository-detail-page">
        {/* Repository Header */}
        <div className="repository-header">
          <div className="repository-header-content">
            <div className="repository-breadcrumb">
              <button onClick={onBack} className="back-btn">
                ← Back to Repositories
              </button>
              <span className="breadcrumb-separator">/</span>
              <span className="repository-name">{repository.name}</span>
            </div>
            
            <div className="repository-actions">
              <button className="action-btn watch-btn">
                <span>👁️</span>
                <span>Watch</span>
                <span className="count">{repository.watchers || 0}</span>
              </button>
              <button className="action-btn star-btn">
                <span>⭐</span>
                <span>Star</span>
                <span className="count">{repository.stars || 0}</span>
              </button>
              <button className="action-btn fork-btn">
                <span>🍴</span>
                <span>Fork</span>
                <span className="count">{repository.forks || 0}</span>
              </button>
              <button className="action-btn deploy-btn">
                <span>🚀</span>
                <span>Deploy</span>
              </button>
            </div>
          </div>
        </div>

        <div className="repository-detail-container">
          {/* Main Content */}
          <div className="repository-main-content">
            {/* Repository Info */}
            <div className="repository-info">
              <div className="repository-title-section">
                <h1 className="repository-title">{repository.name}</h1>
                <span className={`visibility-badge ${repository.visibility || 'public'}`}>
                  {repository.visibility === 'private' || (repository as any).isPrivate ? '🔒 Private' : '🌐 Public'}
                </span>
              </div>
              
              <p className="repository-description">{repository.description || 'No description provided'}</p>
              
              <div className="repository-meta">
                <div className="meta-item">
                  <span className="meta-label">Created:</span>
                  <span className="meta-value">{formatDate(repository.createdAt)}</span>
                </div>
                <div className="meta-item">
                  <span className="meta-label">Last Updated:</span>
                  <span className="meta-value">{formatDate(repository.updatedAt)}</span>
                </div>
                <div className="meta-item">
                  <span className="meta-label">Language:</span>
                  <span className="meta-value">{repository.language || 'Not specified'}</span>
                </div>
                <div className="meta-item">
                  <span className="meta-label">License:</span>
                  <span className="meta-value">{repository.license || 'Not specified'}</span>
                </div>
              </div>

              <div className="repository-stats">
                <div className="stat-item">
                  <span className="stat-number">{repository.stars || 0}</span>
                  <span className="stat-label">Stars</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">{repository.forks || 0}</span>
                  <span className="stat-label">Forks</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">{repository.watchers || 0}</span>
                  <span className="stat-label">Watchers</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">{repository.issues || 0}</span>
                  <span className="stat-label">Issues</span>
                </div>
              </div>

              <div className="repository-chains">
                <h3>Supported Chains</h3>
                <div className="chain-badges">
                  {(repository.chains || (repository as any).supportedChains || [] as string[]).map((chain: string, index: number) => (
                    <span key={index} className="chain-badge">
                      {chain}
                    </span>
                  ))}
                  {(!repository.chains?.length && !(repository as any).supportedChains?.length) && (
                    <span className="chain-badge">ICP</span>
                  )}
                </div>
              </div>
            </div>

            {/* Tabs Navigation */}
            <div className="repository-tabs">
              <button 
                className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
                onClick={() => setActiveTab('overview')}
              >
                📊 Overview
              </button>
              <button 
                className={`tab-btn ${activeTab === 'files' ? 'active' : ''}`}
                onClick={() => setActiveTab('files')}
              >
                📁 Files
              </button>
              <button 
                className={`tab-btn ${activeTab === 'commits' ? 'active' : ''}`}
                onClick={() => setActiveTab('commits')}
              >
                📝 Commits
              </button>
              <button 
                className={`tab-btn ${activeTab === 'collaborators' ? 'active' : ''}`}
                onClick={() => setActiveTab('collaborators')}
              >
                👥 Collaborators
              </button>
              <button 
                className={`tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
                onClick={() => setActiveTab('settings')}
              >
                ⚙️ Settings
              </button>
            </div>

            {/* Tab Content */}
            <div className="tab-content">
              {activeTab === 'overview' && (
                <div className="overview-tab">
                  <div className="readme-section">
                    <h2>README.md</h2>
                    <div className="readme-content">
                      <p>Welcome to {repository.name}!</p>
                      <p>This is a comprehensive multichain development project built on OpenKeyHub.</p>
                      
                      <h3>Features</h3>
                      <ul>
                        <li>Multi-chain deployment support</li>
                        <li>Smart contract integration</li>
                        <li>Collaborative development tools</li>
                        <li>Advanced governance features</li>
                      </ul>

                      <h3>Getting Started</h3>
                      <pre><code>git clone {(repository as any).cloneUrl || `https://openkeyhub.com/${repository.owner}/${repository.name}.git`}
cd {repository.name}
npm install
npm start</code></pre>
                    </div>
                  </div>

                  <div className="recent-activity">
                    <h3>Recent Activity</h3>
                    <div className="activity-list">
                      <div className="activity-item">
                        <span className="activity-icon">📝</span>
                        <span className="activity-text">Updated README.md</span>
                        <span className="activity-time">2 hours ago</span>
                      </div>
                      <div className="activity-item">
                        <span className="activity-icon">🔧</span>
                        <span className="activity-text">Fixed deployment script</span>
                        <span className="activity-time">1 day ago</span>
                      </div>
                      <div className="activity-item">
                        <span className="activity-icon">✨</span>
                        <span className="activity-text">Added new feature</span>
                        <span className="activity-time">3 days ago</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'files' && (
                <div className="files-tab">
                  <div className="files-header">
                    <div className="files-breadcrumb">
                      <button 
                        className="breadcrumb-item"
                        onClick={() => navigateToBreadcrumb(-1)}
                      >
                        {repository.name}
                      </button>
                      {breadcrumbs.map((crumb, index) => (
                        <span key={index}>
                          <span className="breadcrumb-separator">/</span>
                          <button 
                            className="breadcrumb-item"
                            onClick={() => navigateToBreadcrumb(index)}
                          >
                            {crumb}
                          </button>
                        </span>
                      ))}
                    </div>
                    
                    <div className="files-actions">
                      <button 
                        className="upload-btn"
                        onClick={() => setShowCreateFolder(true)}
                      >
                        📁 New Folder
                      </button>
                      <button 
                        className="upload-btn"
                        onClick={() => setShowFileUpload(true)}
                      >
                        📤 Upload Files
                      </button>
                    </div>
                  </div>



                  {/* File Status Display */}
                  <FileStatusDisplay
                    operations={fileOperations}
                    onDismiss={dismissFileOperation}
                    onClearAll={clearAllFileOperations}
                  />

                  {/* File Explorer Component */}
                  <FileExplorer
                    repositoryId={repositoryId}
                    onFileSelect={handleFileSelect}
                    onFileUpload={() => {/* Refresh callback */}}
                    currentPath={currentPath}
                    refreshTrigger={fileExplorerRefresh}
                  />
                  <div className="commits-list">
                    <div className="commit-item">
                      <div className="commit-info">
                        <span className="commit-hash">a1b2c3d</span>
                        <span className="commit-message">Update README with new features</span>
                      </div>
                      <div className="commit-meta">
                        <span className="commit-author">{creator?.name}</span>
                        <span className="commit-date">2 hours ago</span>
                      </div>
                    </div>
                    <div className="commit-item">
                      <div className="commit-info">
                        <span className="commit-hash">e4f5g6h</span>
                        <span className="commit-message">Fix deployment configuration</span>
                      </div>
                      <div className="commit-meta">
                        <span className="commit-author">{creator?.name}</span>
                        <span className="commit-date">1 day ago</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'collaborators' && (
                <div className="collaborators-tab">
                  <div className="collaborators-header">
                    <h2>Collaborators</h2>
                    <button className="invite-btn">👥 Invite Collaborator</button>
                  </div>
                  <div className="collaborators-list">
                    <div className="collaborator-item">
                      <img src={creator?.avatar} alt={creator?.name} className="collaborator-avatar" />
                      <div className="collaborator-info">
                        <span className="collaborator-name">{creator?.name}</span>
                        <span className="collaborator-role">Owner</span>
                      </div>
                      <div className="collaborator-actions">
                        <button className="role-btn">Admin</button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'settings' && (
                <div className="settings-tab">
                  <h2>Repository Settings</h2>
                  <div className="settings-section">
                    <h3>General</h3>
                    <div className="setting-item">
                      <label>Repository Name</label>
                      <input type="text" value={repository.name} readOnly />
                    </div>
                    <div className="setting-item">
                      <label>Description</label>
                      <textarea value={repository.description || ''} readOnly />
                    </div>
                    <div className="setting-item">
                      <label>Visibility</label>
                      <select value={repository.visibility || 'public'} disabled>
                        <option value="public">Public</option>
                        <option value="private">Private</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="repository-sidebar">
            {/* Creator Profile */}
            <div className="creator-profile">
              <div className="profile-header">
                <img src={creator?.avatar} alt={creator?.name} className="profile-avatar" />
                <div className="profile-info">
                  <h3 className="profile-name">{creator?.name}</h3>
                  <p className="profile-bio">{creator?.bio}</p>
                  <span className="profile-location">📍 {creator?.location}</span>
                  <button className="action-btn" onClick={() => setIsProfileOpen(true)}>View Profile</button>
                </div>
              </div>
              
              <div className="profile-stats">
                <div className="profile-stat">
                  <span className="stat-number">{creator?.repositories}</span>
                  <span className="stat-label">Repositories</span>
                </div>
                <div className="profile-stat">
                  <span className="stat-number">{creator?.followers}</span>
                  <span className="stat-label">Followers</span>
                </div>
                <div className="profile-stat">
                  <span className="stat-number">{creator?.following}</span>
                  <span className="stat-label">Following</span>
                </div>
              </div>

              <div className="profile-links">
                {creator?.website && (
                  <a href={creator.website} target="_blank" rel="noopener noreferrer" className="profile-link">
                    🌐 Website
                  </a>
                )}
                {creator?.twitter && (
                  <a href={`https://twitter.com/${creator.twitter}`} target="_blank" rel="noopener noreferrer" className="profile-link">
                    🐦 Twitter
                  </a>
                )}
                {creator?.github && (
                  <a href={`https://github.com/${creator.github}`} target="_blank" rel="noopener noreferrer" className="profile-link">
                    📚 GitHub
                  </a>
                )}
              </div>

              <div className="profile-details">
                <p><strong>Principal ID:</strong> {creator?.principal}</p>
                <p><strong>Joined:</strong> {creator?.joinedDate ? formatDate(creator.joinedDate) : 'Unknown'}</p>
                <p><strong>Contributions:</strong> {creator?.contributions}</p>
              </div>
            </div>

            {/* Repository Quick Actions */}
            <div className="quick-actions">
              <h3>Quick Actions</h3>
              <button className="quick-action-btn">
                📋 Clone Repository
              </button>
              <button className="quick-action-btn">
                📥 Download ZIP
              </button>
              <button className="quick-action-btn">
                🔗 Share Repository
              </button>
              <button className="quick-action-btn">
                📊 View Analytics
              </button>
            </div>

            {/* Repository Health */}
            <div className="repository-health">
              <h3>Repository Health</h3>
              <div className="health-item">
                <span className="health-label">Code Quality</span>
                <div className="health-bar">
                  <div className="health-fill" style={{ width: '85%' }}></div>
                </div>
                <span className="health-score">85%</span>
              </div>
              <div className="health-item">
                <span className="health-label">Security</span>
                <div className="health-bar">
                  <div className="health-fill" style={{ width: '92%' }}></div>
                </div>
                <span className="health-score">92%</span>
              </div>
              <div className="health-item">
                <span className="health-label">Documentation</span>
                <div className="health-bar">
                  <div className="health-fill" style={{ width: '78%' }}></div>
                </div>
                <span className="health-score">78%</span>
              </div>
            </div>
          </div>
        </div>

        {/* File Viewer Modal */}
        {showFileViewer && selectedFile && (
          <div className="modal-overlay" onClick={() => setShowFileViewer(false)}>
            <div className="file-viewer-modal" onClick={(e) => e.stopPropagation()}>
              <div className="file-viewer-header">
                <h3>{selectedFile.name}</h3>
                <button onClick={() => setShowFileViewer(false)}>✕</button>
              </div>
              <div className="file-viewer-content">
                <pre>
                  <code>{fileContent}</code>
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* Create Folder Modal */}
        {showCreateFolder && (
          <CreateFolderModal
            currentPath={currentPath}
            onClose={() => setShowCreateFolder(false)}
            onCreate={handleCreateFolder}
          />
        )}

        {/* File Upload Modal */}
        {showFileUpload && (
          <FileUploadModal
            isOpen={showFileUpload}
            onClose={() => setShowFileUpload(false)}
            onUpload={handleFileUpload}
            currentPath={currentPath}
          />
        )}

        <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} profile={creator} />
      </div>
    </PageLayout>
  )
}

export default RepositoryDetail
