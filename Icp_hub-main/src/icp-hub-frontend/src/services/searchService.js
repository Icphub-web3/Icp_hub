// src/services/searchService.js
import dataService from './dataService'

class SearchService {
  constructor() {
    this.searchCache = new Map()
    this.suggestionsCache = new Map()
    this.cacheTimeout = 2 * 60 * 1000 
    this.debounceTimeout = 300 
    this.pendingSearches = new Map()
  }

  // Debounced search to prevent too many API calls
  debounceSearch(searchFn, delay = this.debounceTimeout) {
    return (...args) => {
      const key = JSON.stringify(args)
      
      if (this.pendingSearches.has(key)) {
        clearTimeout(this.pendingSearches.get(key))
      }
      
      return new Promise((resolve) => {
        const timeoutId = setTimeout(async () => {
          this.pendingSearches.delete(key)
          const result = await searchFn(...args)
          resolve(result)
        }, delay)
        
        this.pendingSearches.set(key, timeoutId)
      })
    }
  }

  // Cache management
  getCachedSearch(key) {
    const cached = this.searchCache.get(key)
    if (!cached) return null
    
    if (Date.now() - cached.timestamp > this.cacheTimeout) {
      this.searchCache.delete(key)
      return null
    }
    
    return cached.data
  }

  setCachedSearch(key, data) {
    this.searchCache.set(key, {
      data,
      timestamp: Date.now()
    })
  }

  // Universal search across all content types
  async universalSearch(query, options = {}) {
    const {
      scope = { All: null },
      filters = null,
      sortBy = { Relevance: null },
      pagination = { page: 0, limit: 20 }
    } = options

    const cacheKey = JSON.stringify({ query, scope, filters, sortBy, pagination })
    const cached = this.getCachedSearch(cacheKey)
    if (cached) return cached

    try {
      const searchRequest = {
        searchQuery: query,
        scope,
        filters,
        sortBy,
        pagination
      }

      const result = await dataService.search(searchRequest)
      
      if (result.success) {
        this.setCachedSearch(cacheKey, result)
        return result
      } else {
        return { success: false, error: result.error }
      }
    } catch (error) {
      console.error('Universal search failed:', error)
      return { success: false, error: { InternalError: error.message } }
    }
  }

  // Repository-specific search
  async searchRepositories(query, filters = {}) {
    const searchFilters = {
      language: filters.language || null,
      isPrivate: filters.isPrivate !== undefined ? filters.isPrivate : null,
      owner: filters.owner || null,
      minSize: filters.minSize || null,
      maxSize: filters.maxSize || null,
      createdAfter: filters.createdAfter || null,
      createdBefore: filters.createdBefore || null
    }

    const sortBy = filters.sortBy ? { [filters.sortBy]: null } : { Relevance: null }

    return this.universalSearch(query, {
      scope: { Repositories: null },
      filters: Object.keys(searchFilters).some(key => searchFilters[key] !== null) ? searchFilters : null,
      sortBy,
      pagination: filters.pagination || { page: 0, limit: 20 }
    })
  }

  // User-specific search
  async searchUsers(query, filters = {}) {
    return this.universalSearch(query, {
      scope: { Users: null },
      pagination: filters.pagination || { page: 0, limit: 20 }
    })
  }

  // File-specific search
  async searchFiles(query, repositoryId = null, filters = {}) {
    if (repositoryId) {
      // Search within a specific repository
      try {
        const result = await dataService.searchRepository(
          repositoryId, 
          query, 
          filters.pagination || { page: 0, limit: 20 }
        )
        return result
      } catch (error) {
        console.error('Repository file search failed:', error)
        return { success: false, error: { InternalError: error.message } }
      }
    } else {
      // Search files across all repositories
      return this.universalSearch(query, {
        scope: { Files: null },
        pagination: filters.pagination || { page: 0, limit: 20 }
      })
    }
  }

  // Code-specific search
  async searchCode(query, filters = {}) {
    return this.universalSearch(query, {
      scope: { Code: null },
      filters: filters.searchFilters || null,
      pagination: filters.pagination || { page: 0, limit: 20 }
    })
  }

  // Search suggestions
  async getSearchSuggestions(query, maxSuggestions = 5) {
    if (!query || query.length < 2) return { success: true, data: [] }

    const cacheKey = `suggestions_${query}_${maxSuggestions}`
    const cached = this.suggestionsCache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < 30000) { // 30 second cache
      return { success: true, data: cached.data }
    }

    try {
      const result = await dataService.searchSuggestions(query, maxSuggestions)
      
      if (result.success) {
        this.suggestionsCache.set(cacheKey, {
          data: result.data,
          timestamp: Date.now()
        })
      }
      
      return result
    } catch (error) {
      console.error('Search suggestions failed:', error)
      return { success: false, error: { InternalError: error.message } }
    }
  }

  // Bounty-specific search (using universal search with custom filtering)
  async searchBounties(query, filters = {}) {
    // Since bounties might be stored as repositories or separate entities,
    // we'll search repositories and filter by bounty-related criteria
    const searchResult = await this.searchRepositories(query, {
      ...filters,
      // Add bounty-specific filtering logic here
    })

    if (searchResult.success) {
      // Filter results to only bounty-related repositories
      const bountyRepos = searchResult.data.repositories?.filter(repo => 
        repo.repository?.name?.toLowerCase().includes('bounty') ||
        repo.repository?.description?.toLowerCase().includes('bounty') ||
        repo.repository?.topics?.some(topic => topic.toLowerCase().includes('bounty'))
      ) || []

      return {
        success: true,
        data: {
          ...searchResult.data,
          repositories: bountyRepos
        }
      }
    }

    return searchResult
  }

  // Proposal-specific search (similar to bounties)
  async searchProposals(query, filters = {}) {
    const searchResult = await this.searchRepositories(query, {
      ...filters,
    })

    if (searchResult.success) {
      // Filter results to only proposal-related repositories
      const proposalRepos = searchResult.data.repositories?.filter(repo => 
        repo.repository?.name?.toLowerCase().includes('proposal') ||
        repo.repository?.description?.toLowerCase().includes('proposal') ||
        repo.repository?.topics?.some(topic => 
          topic.toLowerCase().includes('proposal') || 
          topic.toLowerCase().includes('governance')
        )
      ) || []

      return {
        success: true,
        data: {
          ...searchResult.data,
          repositories: proposalRepos
        }
      }
    }

    return searchResult
  }

  // Advanced search with multiple filters
  async advancedSearch(searchParams) {
    const {
      query,
      type, // 'repositories', 'users', 'files', 'code', 'all'
      language,
      dateRange,
      sortBy,
      pagination
    } = searchParams

    const scope = type === 'all' ? { All: null } : 
                 type === 'repositories' ? { Repositories: null } :
                 type === 'users' ? { Users: null } :
                 type === 'files' ? { Files: null } :
                 type === 'code' ? { Code: null } : { All: null }

    const filters = {}
    if (language) filters.language = language
    if (dateRange?.start) filters.createdAfter = new Date(dateRange.start).getTime() * 1000000
    if (dateRange?.end) filters.createdBefore = new Date(dateRange.end).getTime() * 1000000

    const sortOption = sortBy ? { [sortBy]: null } : { Relevance: null }

    return this.universalSearch(query, {
      scope,
      filters: Object.keys(filters).length > 0 ? filters : null,
      sortBy: sortOption,
      pagination: pagination || { page: 0, limit: 20 }
    })
  }

  // Clear all search caches
  clearSearchCache() {
    this.searchCache.clear()
    this.suggestionsCache.clear()
  }

  // Format search results for display
  formatSearchResults(searchResult) {
    if (!searchResult.success) return searchResult

    const { repositories = [], users = [], files = [] } = searchResult.data

    return {
      success: true,
      data: {
        repositories: repositories.map(this.formatRepositoryResult),
        users: users.map(this.formatUserResult),
        files: files.map(this.formatFileResult),
        totalCount: searchResult.data.totalCount || 0,
        hasMore: searchResult.data.hasMore || false
      }
    }
  }

  formatRepositoryResult(repoResult) {
    const repo = repoResult.repository
    return {
      id: repo.id,
      name: repo.name,
      owner: repo.owner,
      description: repo.description,
      language: repo.language || 'Unknown',
      stars: repo.stars || 0,
      forks: repo.forks || 0,
      isPrivate: repo.isPrivate,
      updatedAt: repo.updatedAt,
      score: repoResult.score,
      matchedFields: repoResult.matchedFields
    }
  }

  formatUserResult(userResult) {
    const user = userResult.user
    return {
      principal: user.principal,
      username: user.username,
      displayName: user.profile?.displayName || user.username,
      bio: user.profile?.bio || '',
      avatar: user.profile?.avatar,
      repositoryCount: user.repositories?.length || 0,
      score: userResult.score,
      matchedFields: userResult.matchedFields
    }
  }

  formatFileResult(fileResult) {
    const file = fileResult.file
    return {
      path: file.path,
      name: file.path.split('/').pop(),
      repository: fileResult.repository,
      content: file.content,
      score: fileResult.score,
      snippets: fileResult.snippets || []
    }
  }
}

// Create and export singleton instance
const searchService = new SearchService()

// Create debounced search functions
searchService.debouncedUniversalSearch = searchService.debounceSearch(
  searchService.universalSearch.bind(searchService)
)

searchService.debouncedRepositorySearch = searchService.debounceSearch(
  searchService.searchRepositories.bind(searchService)
)

searchService.debouncedUserSearch = searchService.debounceSearch(
  searchService.searchUsers.bind(searchService)
)

searchService.debouncedSuggestions = searchService.debounceSearch(
  searchService.getSearchSuggestions.bind(searchService),
  200 // Faster debounce for suggestions
)

export default searchService
