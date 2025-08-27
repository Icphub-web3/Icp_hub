import React, { useState, useRef, useCallback } from 'react'
import './FileUploadModal.css'

interface FileUploadModalProps {
  isOpen: boolean
  onClose: () => void
  onUpload: (files: File[]) => Promise<void>
  currentPath: string
}

interface FileWithStatus {
  file: File
  status: 'pending' | 'uploading' | 'success' | 'error'
  progress: number
  error?: string
}

const FileUploadModal: React.FC<FileUploadModalProps> = ({
  isOpen,
  onClose,
  onUpload,
  currentPath
}) => {
  const [files, setFiles] = useState<FileWithStatus[]>([])
  const [commitMessage, setCommitMessage] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dropZoneRef = useRef<HTMLDivElement>(null)

  if (!isOpen) return null

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const newFiles = Array.from(e.dataTransfer.files).map(file => ({
        file,
        status: 'pending' as const,
        progress: 0
      }))
      setFiles(prev => [...prev, ...newFiles])
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const newFiles = Array.from(event.target.files).map(file => ({
        file,
        status: 'pending' as const,
        progress: 0
      }))
      setFiles(prev => [...prev, ...newFiles])
    }
  }

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const validateFiles = (): boolean => {
    if (files.length === 0) {
      alert('Please select at least one file to upload')
      return false
    }

    if (!commitMessage.trim()) {
      alert('Please enter a commit message')
      return false
    }

    // Check for invalid characters in filenames
    const invalidFiles = files.filter(fileWithStatus => {
      const fileName = fileWithStatus.file.name
      return /[\\/:*?"<>|]/.test(fileName)
    })

    if (invalidFiles.length > 0) {
      alert('Some files have invalid names. Please rename them before uploading.')
      return false
    }

    return true
  }

  const handleUpload = async () => {
    if (!validateFiles()) return

    setIsUploading(true)
    
    try {
      // Extract just the File objects for upload
      const fileList = files.map(f => f.file)
      await onUpload(fileList)
      
      // Reset form after successful upload
      setFiles([])
      setCommitMessage('')
      onClose()
    } catch (error) {
      console.error('Upload failed:', error)
      alert('Upload failed. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (fileName: string): string => {
    const extension = fileName.split('.').pop()?.toLowerCase()
    switch (extension) {
      case 'js':
      case 'jsx':
        return '📜'
      case 'ts':
      case 'tsx':
        return '🔷'
      case 'mo':
        return '🔵'
      case 'rs':
        return '🦀'
      case 'py':
        return '🐍'
      case 'json':
        return '📋'
      case 'md':
        return '📝'
      case 'html':
        return '🌐'
      case 'css':
      case 'scss':
        return '🎨'
      case 'png':
      case 'jpg':
      case 'jpeg':
      case 'gif':
        return '🖼️'
      case 'svg':
        return '🎭'
      case 'pdf':
        return '📕'
      case 'zip':
      case 'tar':
      case 'gz':
        return '📦'
      default:
        return '📄'
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="file-upload-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Upload Files</h2>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>

        <div className="modal-body">
          {/* Upload Path Display */}
          <div className="upload-path">
            <label>Upload to:</label>
            <div className="path-display">
              /{currentPath ? `${currentPath}/` : ''}
            </div>
          </div>

          {/* Drag & Drop Zone */}
          <div
            ref={dropZoneRef}
            className={`drop-zone ${dragActive ? 'drag-active' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <div className="drop-zone-content">
              <div className="drop-icon">📁</div>
              <p>Drag and drop files here, or</p>
              <button
                className="btn-select-files"
                onClick={() => fileInputRef.current?.click()}
                type="button"
              >
                Select Files
              </button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />
            </div>
          </div>

          {/* File List */}
          {files.length > 0 && (
            <div className="file-list">
              <h3>Selected Files ({files.length})</h3>
              {files.map((fileWithStatus, index) => (
                <div key={index} className="file-item">
                  <div className="file-info">
                    <span className="file-icon">{getFileIcon(fileWithStatus.file.name)}</span>
                    <div className="file-details">
                      <span className="file-name">{fileWithStatus.file.name}</span>
                      <span className="file-size">{formatFileSize(fileWithStatus.file.size)}</span>
                    </div>
                  </div>
                  <button
                    className="remove-file-btn"
                    onClick={() => removeFile(index)}
                    type="button"
                    disabled={isUploading}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Commit Message */}
          <div className="form-group">
            <label htmlFor="commitMessage">Commit Message</label>
            <textarea
              id="commitMessage"
              value={commitMessage}
              onChange={(e) => setCommitMessage(e.target.value)}
              placeholder="Describe the changes you're uploading..."
              rows={3}
              required
              disabled={isUploading}
            />
          </div>

          {/* Upload Tips */}
          <div className="upload-tips">
            <div className="tip-title">Upload Guidelines</div>
            <ul>
              <li>Files will be uploaded to the current directory</li>
              <li>Large files may take longer to upload</li>
              <li>Supported file types: All common development files</li>
              <li>Maximum file size: 100MB per file</li>
            </ul>
          </div>
        </div>

        <div className="modal-footer">
          <button
            type="button"
            className="btn-cancel"
            onClick={onClose}
            disabled={isUploading}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn-upload"
            onClick={handleUpload}
            disabled={isUploading || files.length === 0 || !commitMessage.trim()}
          >
            {isUploading ? 'Uploading...' : `Upload ${files.length} File${files.length !== 1 ? 's' : ''}`}
          </button>
        </div>
      </div>
    </div>
  )
}

export default FileUploadModal
