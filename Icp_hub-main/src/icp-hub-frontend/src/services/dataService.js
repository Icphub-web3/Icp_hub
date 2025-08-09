import apiService from './api'

// Data Service optimized for main.mo API layer architecture
class DataService {
  constructor() {
    this.cache = {
      repositories: new Map(),
      users: new Map(),
      files: new Map(),
      searches: new Map()
    }
    this.cacheExpiry = 5 * 60 * 1000 // 5 minutes
    this.pendingRequests = new Map() // Prevent duplicate API calls
    this.batchQueue = {
      repositories: [],
      users: [],
      files: []
    }
    this.batchTimeout = null
  }

  // Enhanced cache management for API layer efficiency
  setCacheItem(type, key, data, customExpiry = null) {
    this.cache[type].set(key, {
      data,
      timestamp: Date.now(),
      expiry: customExpiry || this.cacheExpiry
    })
  }

  getCacheItem(type, key) {
    const item = this.cache[type].get(key)
    if (!item) return null
    
    if (Date.now() - item.timestamp > item.expiry) {
      this.cache[type].delete(key)
      return null
    }
    
    return item.data
  }

  clearCache(type = null) {
    if (type) {
      this.cache[type].clear()
    } else {
      Object.keys(this.cache).forEach(key => {
        this.cache[key].clear()
      })
    }
  }

  // Prevent duplicate API calls to main.mo
  async withRequestDeduplication(key, apiCall) {
    if (this.pendingRequests.has(key)) {
      return this.pendingRequests.get(key)
    }

    const promise = apiCall()
    this.pendingRequests.set(key, promise)

    try {
      const result = await promise
      return result
    } finally {
      this.pendingRequests.delete(key)
    }
  }

  // Optimized repository operations for API layer
  async createRepository(repoData) {
    try {
      const result = await apiService.createRepository(repoData)
      if (result.success) {
        // Cache the new repository with longer expiry since it's fresh
        this.setCacheItem('repositories', result.data.id, result.data, 15 * 60 * 1000)
        // Invalidate user repository lists
        this.invalidateUserRepositoryCache(result.data.owner)
        // Clear search cache since new repo affects search results
        this.clearCache('searches')
      }
      return result
    } catch (error) {
      console.error('Failed to create repository:', error)
      return { success: false, error: this.parseApiError(error) }
    }
  }

  async getRepository(repositoryId, useCache = true) {
    const requestKey = `repo_${repositoryId}`
    
    return this.withRequestDeduplication(requestKey, async () => {
      try {
        // Check cache first
        if (useCache) {
          const cached = this.getCacheItem('repositories', repositoryId)
          if (cached) return { success: true, data: cached }
        }

        const result = await apiService.getRepository(repositoryId)
        if (result.success) {
          this.setCacheItem('repositories', repositoryId, result.data)
        }
        return result
      } catch (error) {
        console.error('Failed to get repository:', error)
        return { success: false, error: this.parseApiError(error) }
      }
    })
  }

  async listRepositories(owner, pagination = null, useCache = true) {
    const requestKey = `repos_${owner.toString()}_${JSON.stringify(pagination)}`
    const cacheKey = requestKey
    
    return this.withRequestDeduplication(requestKey, async () => {
      try {
        // Check cache first
        if (useCache) {
          const cached = this.getCacheItem('repositories', cacheKey)
          if (cached) return { success: true, data: cached }
        }

        const result = await apiService.listRepositories(owner, pagination)
        if (result.success) {
          this.setCacheItem('repositories', cacheKey, result.data)
          // Cache individual repositories for faster access
          result.data.repositories.forEach(repo => {
            this.setCacheItem('repositories', repo.id, repo)
          })
        }
        return result
      } catch (error) {
        console.error('Failed to list repositories:', error)
        return { success: false, error: this.parseApiError(error) }
      }
    })
  }

  async updateRepository(repositoryId, updateData) {
    try {
      const result = await apiService.updateRepository(repositoryId, updateData)
      if (result.success) {
        // Update cache with longer expiry
        this.setCacheItem('repositories', repositoryId, result.data, 15 * 60 * 1000)
        // Invalidate related caches
        this.invalidateRepositoryRelatedCache(repositoryId)
      }
      return result
    } catch (error) {
      console.error('Failed to update repository:', error)
      return { success: false, error: this.parseApiError(error) }
    }
  }

  async deleteRepository(repositoryId) {
    try {
      const result = await apiService.deleteRepository(repositoryId)
      if (result.success) {
        // Remove from all related caches
        this.cache.repositories.delete(repositoryId)
        this.clearCache('searches') // Affects search results
        this.clearCache('users') // Affects user repository lists
      }
      return result
    } catch (error) {
      console.error('Failed to delete repository:', error)
      return { success: false, error: this.parseApiError(error) }
    }
  }

  // Enhanced user operations
  async getUser(principal, useCache = true) {
    const principalStr = principal.toString()
    const requestKey = `user_${principalStr}`
    
    return this.withRequestDeduplication(requestKey, async () => {
      try {
        // Check cache first
        if (useCache) {
          const cached = this.getCacheItem('users', principalStr)
          if (cached) return { success: true, data: cached }
        }

        const result = await apiService.getUser(principal)
        if (result.success) {
          this.setCacheItem('users', principalStr, result.data)
        }
        return result
      } catch (error) {
        console.error('Failed to get user:', error)
        return { success: false, error: this.parseApiError(error) }
      }
    })
  }

  async getUserByUsername(username) {
    const requestKey = `user_username_${username}`
    
    return this.withRequestDeduplication(requestKey, async () => {
      try {
        // Check if we have this user cached by username
        const cached = this.getCacheItem('users', `username_${username}`)
        if (cached) return { success: true, data: cached }

        // Use the search API which main.mo delegates to search.mo
        const searchResult = await this.search({
          searchQuery: username,
          scope: { Users: null },
          pagination: { page: 0, limit: 1 }
        }, false) // Don't cache search results here

        if (searchResult.success && searchResult.data.users.length > 0) {
          const user = searchResult.data.users[0].user
          // Cache under both principal and username
          this.setCacheItem('users', user.principal.toString(), user)
          this.setCacheItem('users', `username_${username}`, user)
          return { success: true, data: user }
        } else {
          return { success: false, error: { NotFound: 'User not found' } }
        }
      } catch (error) {
        console.error('Failed to get user by username:', error)
        return { success: false, error: this.parseApiError(error) }
      }
    })
  }

  // File operations optimized for API routing
  async uploadFile(fileData) {
    try {
      const result = await apiService.uploadFile(fileData)
      if (result.success) {
        // Invalidate related caches efficiently
        this.invalidateRepositoryRelatedCache(fileData.repositoryId)
      }
      return result
    } catch (error) {
      console.error('Failed to upload file:', error)
      return { success: false, error: this.parseApiError(error) }
    }
  }

  async getFile(repositoryId, path, useCache = true) {
    const cacheKey = `${repositoryId}_${path}`
    const requestKey = `file_${cacheKey}`
    
    return this.withRequestDeduplication(requestKey, async () => {
      try {
        // Check cache first
        if (useCache) {
          const cached = this.getCacheItem('files', cacheKey)
          if (cached) return { success: true, data: cached }
        }

        const result = await apiService.getFile(repositoryId, path)
        if (result.success) {
          this.setCacheItem('files', cacheKey, result.data)
        }
        return result
      } catch (error) {
        console.error('Failed to get file:', error)
        return { success: false, error: this.parseApiError(error) }
      }
    })
  }

  async listFiles(repositoryId, path = null, useCache = true) {
    const cacheKey = `${repositoryId}_files_${path || 'root'}`
    const requestKey = `files_${cacheKey}`
    
    return this.withRequestDeduplication(requestKey, async () => {
      try {
        // Check cache first
        if (useCache) {
          const cached = this.getCacheItem('files', cacheKey)
          if (cached) return { success: true, data: cached }
        }

        const result = await apiService.listFiles(repositoryId, path)
        if (result.success) {
          this.setCacheItem('files', cacheKey, result.data)
        }
        return result
      } catch (error) {
        console.error('Failed to list files:', error)
        return { success: false, error: this.parseApiError(error) }
      }
    })
  }

  async deleteFile(repositoryId, path) {
    try {
      const result = await apiService.deleteFile(repositoryId, path)
      if (result.success) {
        // Remove specific file from cache
        this.cache.files.delete(`${repositoryId}_${path}`)
        // Invalidate file listings for this repository
        this.invalidateRepositoryFileCache(repositoryId)
      }
      return result
    } catch (error) {
      console.error('Failed to delete file:', error)
      return { success: false, error: this.parseApiError(error) }
    }
  }

  // Enhanced search operations
  async search(searchRequest, useCache = true) {
    const cacheKey = JSON.stringify(searchRequest)
    const requestKey = `search_${btoa(cacheKey).slice(0, 32)}`
    
    return this.withRequestDeduplication(requestKey, async () => {
      try {
        // Check cache first for search results
        if (useCache) {
          const cached = this.getCacheItem('searches', cacheKey)
          if (cached) return { success: true, data: cached }
        }

        const result = await apiService.search(searchRequest)
        if (result.success && useCache) {
          // Cache search results with shorter expiry since they change frequently
          this.setCacheItem('searches', cacheKey, result.data, 2 * 60 * 1000)
        }
        return result
      } catch (error) {
        console.error('Failed to search:', error)
        return { success: false, error: this.parseApiError(error) }
      }
    })
  }

  async searchSuggestions(query, limit = 5) {
    const requestKey = `suggestions_${query}_${limit}`
    
    return this.withRequestDeduplication(requestKey, async () => {
      try {
        const result = await apiService.searchSuggestions(query, limit)
        return result
      } catch (error) {
        console.error('Failed to get search suggestions:', error)
        return { success: false, error: this.parseApiError(error) }
      }
    })
  }

  async searchRepository(repositoryId, query, pagination = null) {
    try {
      return await apiService.searchRepository(repositoryId, query, pagination)
    } catch (error) {
      console.error('Repository search failed:', error)
      return { success: false, error: error.message }
    }
  }

  // Cache invalidation helpers
  invalidateUserRepositoryCache(ownerPrincipal) {
    const principalStr = ownerPrincipal.toString()
    // Remove all cached repository lists for this user
    for (const [key] of this.cache.repositories) {
      if (key.startsWith(`${principalStr}_`)) {
        this.cache.repositories.delete(key)
      }
    }
  }

  invalidateRepositoryRelatedCache(repositoryId) {
    // Remove repository-specific file caches
    this.invalidateRepositoryFileCache(repositoryId)
    // Clear search cache since repo changes affect search
    this.clearCache('searches')
  }

  invalidateRepositoryFileCache(repositoryId) {
    for (const [key] of this.cache.files) {
      if (key.startsWith(`${repositoryId}_`)) {
        this.cache.files.delete(key)
      }
    }
  }

  // Enhanced error handling for API layer responses
  parseApiError(error) {
    if (typeof error === 'object' && error !== null) {
      // Handle Motoko Result.Err responses from main.mo
      if (error.NotFound) return `Resource not found: ${error.NotFound}`
      if (error.Unauthorized) return `Unauthorized: ${error.Unauthorized}`
      if (error.BadRequest) return `Bad request: ${error.BadRequest}`
      if (error.Conflict) return `Conflict: ${error.Conflict}`
      if (error.Forbidden) return `Forbidden: ${error.Forbidden}`
      if (error.InternalError) return `Internal error: ${error.InternalError}`
    }
    return error.message || 'An unexpected error occurred'
  }

  // Health check for main.mo API layer
  async healthCheck() {
    try {
      const result = await apiService.health()
      return { success: result, online: result }
    } catch (error) {
      console.error('Health check failed:', error)
      return { success: false, online: false, error: error.message }
    }
  }

  // Data transformation methods for frontend display (existing methods remain...)
  transformRepositoryForDisplay(repo) {
    if (!repo) return null
    
    return {
      id: repo.id,
      name: repo.name,
      description: repo.description || '',
      owner: repo.owner,
      isPrivate: repo.settings?.visibility?.Private !== undefined,
      language: repo.primaryLanguage || 'Unknown',
      stars: repo.starCount || 0,
      forks: repo.forkCount || 0,
      size: repo.size || 0,
      createdAt: new Date(Number(repo.createdAt) / 1000000), // Convert from nanoseconds
      updatedAt: new Date(Number(repo.updatedAt) / 1000000),
      defaultBranch: repo.settings?.defaultBranch || 'main',
      topics: repo.settings?.topics || [],
      license: repo.settings?.license,
      url: `/repositories/${repo.id}`,
      cloneUrl: `https://github.com/${repo.owner}/${repo.name}.git` // Placeholder
    }
  }

  transformUserForDisplay(user) {
    if (!user) return null
    
    return {
      principal: user.principal,
      username: user.username,
      email: user.email,
      displayName: user.profile?.displayName || user.username,
      bio: user.profile?.bio || '',
      avatar: user.profile?.avatar || `https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face`,
      location: user.profile?.location,
      website: user.profile?.website,
      social: user.profile?.socialLinks || {},
      repositoryCount: user.repositories?.length || 0,
      createdAt: new Date(Number(user.createdAt) / 1000000),
      updatedAt: new Date(Number(user.updatedAt) / 1000000)
    }
  }

  transformFileForDisplay(file) {
    if (!file) return null
    
    return {
      path: file.path,
      name: this.getFileName(file.path),
      extension: this.getFileExtension(file.path),
      size: file.size,
      type: this.getFileType(file.path),
      content: file.content,
      hash: file.hash,
      version: file.version,
      lastModified: new Date(Number(file.lastModified) / 1000000),
      author: file.author,
      commitMessage: file.commitMessage,
      isImage: this.isImageFile(file.path),
      isCode: this.isCodeFile(file.path)
    }
  }

  // Utility methods (existing methods remain unchanged...)
  getFileName(path) {
    return path.split('/').pop() || ''
  }

  getFileExtension(path) {
    const fileName = this.getFileName(path)
    const lastDot = fileName.lastIndexOf('.')
    return lastDot > 0 ? fileName.substring(lastDot + 1).toLowerCase() : ''
  }

  getFileType(path) {
    const extension = this.getFileExtension(path)
    const codeExtensions = ['js', 'ts', 'jsx', 'tsx', 'py', 'rs', 'go', 'java', 'cpp', 'c', 'h', 'mo', 'sol']
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp']
    const documentExtensions = ['md', 'txt', 'json', 'yaml', 'yml', 'xml', 'csv']
    
    if (codeExtensions.includes(extension)) return 'code'
    if (imageExtensions.includes(extension)) return 'image'
    if (documentExtensions.includes(extension)) return 'document'
    return 'other'
  }

  isImageFile(path) {
    return this.getFileType(path) === 'image'
  }

  isCodeFile(path) {
    return this.getFileType(path) === 'code'
  }

  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  formatDate(date) {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  formatRelativeTime(date) {
    const now = new Date()
    const diffInMilliseconds = now - date
    const diffInSeconds = Math.floor(diffInMilliseconds / 1000)
    const diffInMinutes = Math.floor(diffInSeconds / 60)
    const diffInHours = Math.floor(diffInMinutes / 60)
    const diffInDays = Math.floor(diffInHours / 24)

    if (diffInSeconds < 60) return 'just now'
    if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`
    if (diffInDays < 30) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`
    
    return this.formatDate(date)
  }

  // Mock data generators for development (can be removed in production)
  generateMockRepositories(count = 10) {
    // ... existing mock data methods
    return []
  }

  generateMockUsers(count = 5) {
    // ... existing mock data methods  
    return []
  }
  
  async getCurrentUser() {
    try {
      if (!apiService.isAuthenticated) {
        return { success: false, error: { Unauthorized: 'Not authenticated' } }
      }
      
      const user = await apiService.getCurrentUser()
      if (user) {
        return { success: true, data: user }
      } else {
        return { success: false, error: { NotFound: 'User not found' } }
      }
    } catch (error) {
      console.error('Failed to get current user:', error)
      return { success: false, error: { InternalError: error.message } }
    }
  }
}

// Export singleton instance
const dataService = new DataService()
export default dataService 