// src/services/fileService.ts

import apiService from './api.js'
import type { 
  FileEntry, 
  FileNode, 
  FileTreeResponse, 
  UploadFileRequest 
} from '../types/repository'

// Define ApiService extensions for missing methods
declare module './api.js' {
  interface ApiService {
    actor: any;
    init(): Promise<void>;
    listFiles(repositoryId: string, path?: string): Promise<{success: boolean, data?: any, error?: any}>;
    uploadFile(request: UploadFileRequest): Promise<{success: boolean, data?: any, error?: any}>;
    deleteFile(repositoryId: string, path: string): Promise<{success: boolean, data?: boolean, error?: any}>;
    getFile(repositoryId: string, path: string): Promise<{success: boolean, data?: any, error?: any}>;
    getPrincipal(): any;
  }
}

export interface FileUploadProgress {
  loaded: number
  total: number
  percentage: number
}

class FileService {
  private getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message
    }
    if (typeof error === 'string') {
      return error
    }
    if (error && typeof error === 'object' && 'message' in error) {
      return String((error as any).message)
    }
    return 'Unknown error occurred'
  }

  /**
   * Get file tree for a repository
   */
  async getFileTree(repositoryId: string, path?: string): Promise<FileTreeResponse> {
    try {
      if (!apiService.actor) {
        await apiService.init()
      }

      console.log('Fetching file tree for repository:', repositoryId, 'path:', path)
      
      // Try to fetch from backend
      const result = await apiService.listFiles(repositoryId, path)
      
      if (result.success && result.data) {
        // Transform backend response to FileTreeResponse
        return this.transformToFileTree(result.data, repositoryId)
      } else {
        // Fall back to mock data
        return this.getMockFileTree(repositoryId)
      }
    } catch (error) {
      console.error('Get file tree error:', this.getErrorMessage(error))
      // Return mock data for development if backend is not available
      return this.getMockFileTree(repositoryId)
    }
  }

    /**
   * Create a new folder
   */
  async createFolder(repositoryId: string, parentPath: string, folderName: string): Promise<FileEntry> {
    try {
      if (!apiService.actor) {
        await apiService.init()
      }

      const result = await apiService.createFolder(repositoryId, parentPath, folderName);
      
      if (result.success && result.data) {
        return this.transformFileEntry(result.data);
      }
      
      // Create the folder entry for response
      const fullPath = parentPath ? `${parentPath}/${folderName}` : folderName;
      return {
        path: fullPath,
        name: folderName,
        content: new Uint8Array(),
        size: 0,
        hash: '',
        version: 1,
        lastModified: Date.now(),
        author: apiService.getPrincipal()?.toString() || 'anonymous',
        isFolder: true,
        commitMessage: `Created folder ${folderName}`
      };
    } catch (error) {
      console.error('Create folder error:', error);
      throw error;
    }
  }

  /**
   * Upload a file to a specific folder
   */
  async uploadFile(
      repositoryId: string, 
      file: File, 
      folderPath?: string,
      commitMessage?: string,
      onProgress?: (progress: FileUploadProgress) => void
    ): Promise<FileEntry> {
      try {
        if (!apiService.actor) {
          await apiService.init()
        }

        const arrayBuffer = await this.readFileAsArrayBuffer(file, onProgress);
        const content = Array.from(new Uint8Array(arrayBuffer));
        const path = folderPath ? `${folderPath}/${file.name}` : file.name;
        
        const uploadRequest: UploadFileRequest = {
          repositoryId,
          path,
          content,
          commitMessage: commitMessage || `Upload ${file.name}`,
          branch: 'main'
        };

        const result = await apiService.uploadFile(uploadRequest);
        
        if (result.success && result.data) {
          return this.transformFileEntry(result.data);
        }
        
        throw new Error('Upload failed: ' + (result.error || 'Unknown error'));
      } catch (error) {
        console.error('Upload file error:', error);
        throw error;
      }
  }

  /**
   * Upload multiple files with proper typing
   */
  async uploadMultipleFiles(
    repositoryId: string,
    files: FileList | File[],
    folderPath?: string,
    onProgress?: (fileName: string, progress: FileUploadProgress) => void
  ): Promise<FileEntry[]> {
    const uploadedFiles: FileEntry[] = []
    const fileArray = Array.from(files)

    for (const file of fileArray) {
      try {
        const uploaded = await this.uploadFile(
          repositoryId,
          file,
          folderPath,
          `Upload ${file.name}`,
          (progress: FileUploadProgress) => {
            if (onProgress) {
              onProgress(file.name, progress)
            }
          }
        )
        uploadedFiles.push(uploaded)
      } catch (error) {
        console.error(`Failed to upload ${file.name}:`, error)
        // Continue with other files even if one fails
      }
    }

    return uploadedFiles
  }

  /**
   * Delete a file
   */
  async deleteFile(repositoryId: string, filePath: string): Promise<boolean> {
    try {
      if (!apiService.actor) {
        await apiService.init()
      }

      console.log('Deleting file:', { repositoryId, filePath })
      
      const result = await apiService.deleteFile(repositoryId, filePath)
      
      if (result.success) {
        console.log('File deleted successfully')
        return true
      } else {
        return false
      }
    } catch (error) {
      console.error('Delete file error:', this.getErrorMessage(error))
      return false
    }
  }

  /**
   * Delete a folder and all its contents
   */
  async deleteFolder(repositoryId: string, folderPath: string): Promise<boolean> {
    try {
      // For now, just use deleteFile since backend might not have deleteFolder
      return await this.deleteFile(repositoryId, folderPath)
    } catch (error) {
      console.error('Delete folder error:', this.getErrorMessage(error))
      return false
    }
  }

  /**
   * Get file content
   */
  async getFileContent(repositoryId: string, filePath: string): Promise<string> {
    try {
      if (!apiService.actor) {
        await apiService.init()
      }

      console.log('Fetching file content:', { repositoryId, filePath })
      
      const result = await apiService.getFile(repositoryId, filePath)
      
      if (result.success && result.data) {
        const fileEntry = result.data
        
        // Convert content based on type
        if (typeof fileEntry.content === 'string') {
          return fileEntry.content
        } else if (Array.isArray(fileEntry.content)) {
          // Convert number array to string
          const uint8Array = new Uint8Array(fileEntry.content)
          return new TextDecoder().decode(uint8Array)
        } else {
          return 'File content cannot be displayed'
        }
      } else {
        // Return mock content
        return `// File: ${filePath}\n// This is mock content for development\n\nconsole.log('Hello from ${filePath}');`
      }
    } catch (error) {
      console.error('Get file content error:', this.getErrorMessage(error))
      // Return mock content
      return `// File: ${filePath}\n// Mock content (backend not available)\n\nfunction example() {\n  return 'Hello World';\n}`
    }
  }

  // Helper methods

  private readFileAsArrayBuffer(
    file: File, 
    onProgress?: (progress: FileUploadProgress) => void
  ): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      
      reader.onload = () => {
        if (reader.result instanceof ArrayBuffer) {
          resolve(reader.result)
        } else {
          reject(new Error('Failed to read file'))
        }
      }
      
      reader.onerror = () => {
        reject(new Error('Failed to read file'))
      }
      
      reader.onprogress = (event) => {
        if (event.lengthComputable && onProgress) {
          onProgress({
            loaded: event.loaded,
            total: event.total,
            percentage: Math.round((event.loaded / event.total) * 100)
          })
        }
      }
      
      reader.readAsArrayBuffer(file)
    })
  }

  private transformFileEntry(entry: any): FileEntry {
    return {
      path: entry.path,
      name: entry.name || entry.path.split('/').pop() || '',
      content: entry.content,
      size: Number(entry.size || 0),
      hash: entry.hash || '',
      version: Number(entry.version || 1),
      lastModified: Number(entry.lastModified) / 1000000, // Convert from nanoseconds
      author: entry.author?.toString() || 'anonymous',
      commitMessage: entry.commitMessage?.[0],
      isFolder: entry.isFolder || false,
      mimeType: entry.mimeType?.[0],
      parentPath: entry.parentPath?.[0]
    }
  }

  private transformToFileTree(data: any, repositoryId: string): FileTreeResponse {
    // Transform backend response to file tree structure
    const files = data.files || []
    const tree: FileNode[] = this.buildTreeFromFiles(files)
    
    return {
      repositoryId,
      tree,
      totalFiles: files.filter((f: any) => !f.isFolder).length,
      totalFolders: files.filter((f: any) => f.isFolder).length,
      totalSize: files.reduce((sum: number, f: any) => sum + (Number(f.size) || 0), 0)
    }
  }

  private buildTreeFromFiles(files: any[]): FileNode[] {
    const tree: FileNode[] = []
    const nodeMap: { [key: string]: FileNode } = {}

    // First pass: create all nodes
    files.forEach((file: any) => {
      const node: FileNode = {
        path: file.path,
        name: file.name || file.path.split('/').pop() || '',
        isFolder: file.isFolder || false,
        size: Number(file.size || 0),
        lastModified: Number(file.lastModified) / 1000000,
        children: file.isFolder ? [] : undefined
      }
      nodeMap[file.path] = node
    })

    // Second pass: build tree structure
    Object.values(nodeMap).forEach(node => {
      const parentPath = node.path.substring(0, node.path.lastIndexOf('/'))
      if (parentPath && nodeMap[parentPath]) {
        if (!nodeMap[parentPath].children) {
          nodeMap[parentPath].children = []
        }
        nodeMap[parentPath].children!.push(node)
      } else {
        tree.push(node)
      }
    })

    return tree
  }

  /**
   * Get file icon based on file extension
   */
  getFileIcon(fileName: string, isFolder: boolean): string {
    if (isFolder) return '📁'
    
    const ext = fileName.split('.').pop()?.toLowerCase()
    
    const iconMap: { [key: string]: string } = {
      // Code files
      'ts': '📘',
      'tsx': '⚛️',
      'js': '📜',
      'jsx': '⚛️',
      'mo': '🔷',
      'rs': '🦀',
      'sol': '💎',
      'py': '🐍',
      'go': '🐹',
      
      // Config files
      'json': '📋',
      'yaml': '📄',
      'yml': '📄',
      'toml': '⚙️',
      'env': '🔐',
      
      // Documentation
      'md': '📝',
      'txt': '📄',
      'pdf': '📕',
      
      // Web files
      'html': '🌐',
      'css': '🎨',
      'scss': '🎨',
      'svg': '🖼️',
      'png': '🖼️',
      'jpg': '🖼️',
      'jpeg': '🖼️',
      'gif': '🖼️',
      
      // Other
      'zip': '📦',
      'tar': '📦',
      'gz': '📦',
      'lock': '🔒'
    }
    
    return iconMap[ext || ''] || '📄'
  }

  /**
   * Get MIME type from file name
   */
  getMimeType(fileName: string): string {
    const ext = fileName.split('.').pop()?.toLowerCase()
    
    const mimeMap: { [key: string]: string } = {
      'txt': 'text/plain',
      'md': 'text/markdown',
      'js': 'text/javascript',
      'ts': 'text/typescript',
      'jsx': 'text/jsx',
      'tsx': 'text/tsx',
      'json': 'application/json',
      'html': 'text/html',
      'css': 'text/css',
      'mo': 'text/x-motoko',
      'png': 'image/png',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'gif': 'image/gif',
      'svg': 'image/svg+xml',
      'pdf': 'application/pdf',
      'zip': 'application/zip'
    }
    
    return mimeMap[ext || ''] || 'application/octet-stream'
  }

  /**
   * Format file size for display
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B'
    
    const units = ['B', 'KB', 'MB', 'GB']
    const k = 1024
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${units[i]}`
  }

  /**
   * Format date for display
   */
  formatDate(timestamp: number | string): string {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    
    const seconds = Math.floor(diff / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)
    
    if (days > 30) {
      return date.toLocaleDateString()
    } else if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''} ago`
    } else if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''} ago`
    } else if (minutes > 0) {
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
    } else {
      return 'Just now'
    }
  }

  // Add mock data method for development
  private getMockFileTree(repositoryId: string): FileTreeResponse {
    return {
      repositoryId,
      tree: [
        {
          path: 'src',
          name: 'src',
          isFolder: true,
          size: 0,
          lastModified: Date.now(),
          children: [
            {
              path: 'src/main.mo',
              name: 'main.mo',
              isFolder: false,
              size: 2048,
              lastModified: Date.now() - 86400000
            },
            {
              path: 'src/types.mo',
              name: 'types.mo',
              isFolder: false,
              size: 1024,
              lastModified: Date.now() - 172800000
            }
          ]
        },
        {
          path: 'README.md',
          name: 'README.md',
          isFolder: false,
          size: 4096,
          lastModified: Date.now() - 3600000
        },
        {
          path: 'dfx.json',
          name: 'dfx.json',
          isFolder: false,
          size: 512,
          lastModified: Date.now() - 7200000
        }
      ],
      totalFiles: 4,
      totalFolders: 1,
      totalSize: 7680
    }
  }
}

export const fileService = new FileService()
export default fileService
