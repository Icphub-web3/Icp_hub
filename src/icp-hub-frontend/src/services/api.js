import { Actor, HttpAgent } from '@dfinity/agent'
import { AuthClient } from '@dfinity/auth-client'
import { Principal } from '@dfinity/principal'

// Backend canister ID - use your actual canister ID
const BACKEND_CANISTER_ID = import.meta.env.VITE_BACKEND_CANISTER_ID || 'uxrrr-q7777-77774-qaaaq-cai'

// Manual IDL Interface that matches your Motoko backend
const idlFactory = ({ IDL }) => {
  // Define all the types from your backend
  const Error = IDL.Variant({
    'NotFound': IDL.Text,
    'Unauthorized': IDL.Text,
    'BadRequest': IDL.Text,
    'InternalError': IDL.Text,
    'Conflict': IDL.Text,
    'Forbidden': IDL.Text,
  })

  const UserProfile = IDL.Record({
    'displayName': IDL.Opt(IDL.Text),
    'bio': IDL.Opt(IDL.Text),
    'avatar': IDL.Opt(IDL.Text),
    'location': IDL.Opt(IDL.Text),
    'website': IDL.Opt(IDL.Text),
    'socialLinks': IDL.Record({
      'twitter': IDL.Opt(IDL.Text),
      'github': IDL.Opt(IDL.Text),
      'linkedin': IDL.Opt(IDL.Text),
    }),
  })

  const User = IDL.Record({
    'principal': IDL.Principal,
    'username': IDL.Text,
    'email': IDL.Opt(IDL.Text),
    'profile': UserProfile,
    'repositories': IDL.Vec(IDL.Text),
    'createdAt': IDL.Int,
    'updatedAt': IDL.Int,
  })

  const RepositoryVisibility = IDL.Variant({
    'Public': IDL.Null,
    'Private': IDL.Null,
    'Internal': IDL.Null,
  })

  const RepositorySettings = IDL.Record({
    'defaultBranch': IDL.Text,
    'allowForking': IDL.Bool,
    'allowIssues': IDL.Bool,
    'allowWiki': IDL.Bool,
    'allowProjects': IDL.Bool,
    'visibility': RepositoryVisibility,
    'license': IDL.Opt(IDL.Text),
    'topics': IDL.Vec(IDL.Text),
  })

  // Add BlockchainType definition
  const BlockchainType = IDL.Variant({
    'ICP': IDL.Null,
    'Ethereum': IDL.Null,
    'Solana': IDL.Null,
    'Bitcoin': IDL.Null,
    'Polygon': IDL.Null,
    'Arbitrum': IDL.Null,
    'BinanceSmartChain': IDL.Null,
    'Avalanche': IDL.Null,
    'Near': IDL.Null,
    'Cosmos': IDL.Null,
    'Polkadot': IDL.Null,
  })

  // Add ProjectType definition
  const ProjectType = IDL.Variant({
    'DeFi': IDL.Null,
    'NFT': IDL.Null,
    'DAO': IDL.Null,
    'Gaming': IDL.Null,
    'Infrastructure': IDL.Null,
    'CrossChain': IDL.Null,
    'Other': IDL.Text,
  })

  const CollaboratorPermission = IDL.Variant({
    'Read': IDL.Null,
    'Write': IDL.Null,
    'Admin': IDL.Null,
    'Owner': IDL.Null,
  })

  const Collaborator = IDL.Record({
    'principal': IDL.Principal,
    'permission': CollaboratorPermission,
    'addedAt': IDL.Int,
    'addedBy': IDL.Principal,
  })

  const FileEntry = IDL.Record({
    'path': IDL.Text,
    'content': IDL.Vec(IDL.Nat8),
    'size': IDL.Nat,
    'hash': IDL.Text,
    'version': IDL.Nat,
    'lastModified': IDL.Int,
    'author': IDL.Principal,
    'commitMessage': IDL.Opt(IDL.Text),
  })

  const Commit = IDL.Record({
    'id': IDL.Text,
    'message': IDL.Text,
    'author': IDL.Principal,
    'timestamp': IDL.Int,
    'parentCommits': IDL.Vec(IDL.Text),
    'changedFiles': IDL.Vec(IDL.Text),
    'hash': IDL.Text,
  })

  const Branch = IDL.Record({
    'name': IDL.Text,
    'commitId': IDL.Text,
    'isDefault': IDL.Bool,
    'createdAt': IDL.Int,
    'createdBy': IDL.Principal,
  })

  const SerializableRepository = IDL.Record({
    'id': IDL.Text,
    'name': IDL.Text,
    'description': IDL.Opt(IDL.Text),
    'owner': IDL.Principal,
    'collaborators': IDL.Vec(IDL.Tuple(IDL.Principal, Collaborator)),
    'isPrivate': IDL.Bool,
    'settings': RepositorySettings,
    'createdAt': IDL.Int,
    'updatedAt': IDL.Int,
    'files': IDL.Vec(IDL.Tuple(IDL.Text, FileEntry)),
    'commits': IDL.Vec(Commit),
    'branches': IDL.Vec(Branch),
    'stars': IDL.Nat,
    'forks': IDL.Nat,
    'language': IDL.Opt(IDL.Text),
    'size': IDL.Nat,
  })

  const Result = (ok, err) => IDL.Variant({
    'Ok': ok,
    'Err': err,
  })

  const CreateUserRequest = IDL.Record({
    'username': IDL.Text,
    'email': IDL.Opt(IDL.Text),
    'profile': UserProfile,
  })

  // Updated CreateRepositoryRequest to match backend
  const CreateRepositoryRequest = IDL.Record({
    'name': IDL.Text,
    'description': IDL.Opt(IDL.Text),
    'isPrivate': IDL.Bool,
    'initializeWithReadme': IDL.Bool,
    'license': IDL.Opt(IDL.Text),
    'gitignoreTemplate': IDL.Opt(IDL.Text),
    'targetChains': IDL.Vec(BlockchainType),
    'projectType': ProjectType,
    'autoDeployEnabled': IDL.Bool,
  })

  const UpdateRepositoryRequest = IDL.Record({
    'description': IDL.Opt(IDL.Text),
    'settings': IDL.Opt(RepositorySettings),
  })

  const UploadFileRequest = IDL.Record({
    'repositoryId': IDL.Text,
    'path': IDL.Text,
    'content': IDL.Vec(IDL.Nat8),
    'commitMessage': IDL.Text,
    'branch': IDL.Opt(IDL.Text),
  })

  const PaginationParams = IDL.Record({
    'page': IDL.Nat,
    'limit': IDL.Nat,
  })

  const RepositoryListResponse = IDL.Record({
    'repositories': IDL.Vec(SerializableRepository),
    'totalCount': IDL.Nat,
    'hasMore': IDL.Bool,
  })

  const FileListResponse = IDL.Record({
    'files': IDL.Vec(FileEntry),
    'totalCount': IDL.Nat,
    'path': IDL.Text,
  })

  const SearchScope = IDL.Variant({
    'All': IDL.Null,
    'Repositories': IDL.Null,
    'Users': IDL.Null,
    'Files': IDL.Null,
    'Code': IDL.Null,
  })

  const SearchRequest = IDL.Record({
    'searchQuery': IDL.Text,
    'scope': SearchScope,
    'pagination': IDL.Opt(PaginationParams),
  })

  const SearchResults = IDL.Record({
    'repositories': IDL.Vec(IDL.Record({
      'repository': SerializableRepository,
      'score': IDL.Float64,
      'matchedFields': IDL.Vec(IDL.Text),
    })),
    'users': IDL.Vec(IDL.Record({
      'user': User,
      'score': IDL.Float64,
      'matchedFields': IDL.Vec(IDL.Text),
    })),
    'totalCount': IDL.Nat,
    'hasMore': IDL.Bool,
  })

  // FIXED: Use IDL.Rec instead of IDL.Recursive
  const FileTreeNode = IDL.Rec()
  FileTreeNode.fill(
    IDL.Record({
      'path': IDL.Text,
      'name': IDL.Text,
      'isFolder': IDL.Bool,
      'size': IDL.Opt(IDL.Nat),
      'lastModified': IDL.Opt(IDL.Int),
      'children': IDL.Opt(IDL.Vec(FileTreeNode))
    })
  )

  const FileTreeResponse = IDL.Record({
    'nodes': IDL.Vec(FileTreeNode),
    'rootPath': IDL.Text
  })

  return IDL.Service({
    // User Management
    'registerUser': IDL.Func([CreateUserRequest], [Result(User, Error)], []),
    'getUser': IDL.Func([IDL.Principal], [Result(User, Error)], ['query']),
    'updateUser': IDL.Func([IDL.Record({
      'displayName': IDL.Opt(IDL.Text),
      'bio': IDL.Opt(IDL.Text),
      'avatar': IDL.Opt(IDL.Text),
      'location': IDL.Opt(IDL.Text),
      'website': IDL.Opt(IDL.Text),
    })], [Result(User, Error)], []),

    // Authentication
    'login': IDL.Func([], [Result(IDL.Text, Error)], []),
    'logout': IDL.Func([IDL.Text], [Result(IDL.Bool, Error)], []),
    'getAuthContext': IDL.Func([], [IDL.Record({
      'isAuthenticated': IDL.Bool,
      'principal': IDL.Principal,
      'method': IDL.Variant({
        'InternetIdentity': IDL.Null,
        'NFID': IDL.Null,
        'Plug': IDL.Null,
      }),
      'permissions': IDL.Vec(IDL.Variant({
        'ViewPublicRepositories': IDL.Null,
        'CreateRepository': IDL.Null,
        'ManageOwnRepositories': IDL.Null,
      }))
    })], ['query']),

    // Repository Management
    'createRepository': IDL.Func([CreateRepositoryRequest], [Result(SerializableRepository, Error)], []),
    'getRepository': IDL.Func([IDL.Text], [Result(SerializableRepository, Error)], ['query']),
    'listRepositories': IDL.Func([IDL.Principal, IDL.Opt(PaginationParams)], [Result(RepositoryListResponse, Error)], ['query']),
    'updateRepository': IDL.Func([IDL.Text, UpdateRepositoryRequest], [Result(SerializableRepository, Error)], []),
    'deleteRepository': IDL.Func([IDL.Text], [Result(IDL.Bool, Error)], []),

    // File Management
    'uploadFile': IDL.Func([UploadFileRequest], [Result(FileEntry, Error)], []),
    'getFile': IDL.Func([IDL.Text, IDL.Text], [Result(FileEntry, Error)], ['query']),
    'listFiles': IDL.Func([IDL.Text, IDL.Opt(IDL.Text)], [Result(FileListResponse, Error)], ['query']),
    'deleteFile': IDL.Func([IDL.Text, IDL.Text], [Result(IDL.Bool, Error)], []),
    
    // File Tree
    'getFileTree': IDL.Func(
      [IDL.Text, IDL.Opt(IDL.Text)], 
      [Result(FileTreeResponse, Error)], 
      ['query']
    ),

    // Search Methods
    'search': IDL.Func([SearchRequest], [Result(SearchResults, Error)], []),
    'searchSuggestions': IDL.Func([IDL.Text, IDL.Opt(IDL.Nat)], [Result(IDL.Vec(IDL.Text), Error)], ['query']),
    'searchRepository': IDL.Func([IDL.Text, IDL.Text, IDL.Opt(PaginationParams)], [Result(FileListResponse, Error)], []),

    // System
    'health': IDL.Func([], [IDL.Bool], ['query']),
    
    // Public Repository Methods
    'listPublicRepositories': IDL.Func(
      [IDL.Opt(PaginationParams)], 
      [Result(RepositoryListResponse, Error)], 
      ['query']
    ),
    
    'searchPublicRepositories': IDL.Func(
      [IDL.Text, IDL.Opt(PaginationParams)], 
      [Result(RepositoryListResponse, Error)], 
      ['query']
    ),
    
    'getRepositoryStats': IDL.Func(
      [], 
      [IDL.Record({
        'totalRepositories': IDL.Nat,
        'publicRepositories': IDL.Nat,
        'totalUsers': IDL.Nat,
        'totalStars': IDL.Nat,
        'totalForks': IDL.Nat,
      })], 
      ['query']
    ),
    
    'getGlobalStats': IDL.Func(
      [], 
      [IDL.Record({
        'totalRepositories': IDL.Nat,
        'publicRepositories': IDL.Nat,
        'totalUsers': IDL.Nat,
        'totalStars': IDL.Nat,
        'totalForks': IDL.Nat,
      })], 
      ['query']
    ),
    
    // Repository specific stats
    'getRepositoryDetailsStats': IDL.Func(
      [IDL.Text], 
      [Result(IDL.Record({
        'totalCommits': IDL.Nat,
        'totalBranches': IDL.Nat,
        'totalFiles': IDL.Nat,
        'contributors': IDL.Vec(IDL.Principal),
        'languages': IDL.Vec(IDL.Text),
      }), Error)], 
      ['query']
    )
  })
}

class ApiService {
  constructor() {
    this.authClient = null
    this.actor = null
    this.isAuthenticated = false
    this.currentUser = null
    this.agent = null
    this.isBackendAvailable = false
  }

  async init() {
    try {
      this.authClient = await AuthClient.create()
      this.isAuthenticated = await this.authClient.isAuthenticated()
      
      // Try to setup actor and check backend availability
      try {
        if (this.isAuthenticated) {
          await this.setupActor()
        } else {
          // Create anonymous actor for public operations
          await this.setupAnonymousActor()
        }
        
        // Test backend connectivity
        await this.checkBackendAvailability()
      } catch (actorError) {
        console.warn('Failed to setup actor or backend not available:', actorError)
        this.isBackendAvailable = false
        // Continue with mock mode
      }
      
      return true
    } catch (error) {
      console.error('Failed to initialize API service:', error)
      // Set backend as unavailable and continue with mock mode
      this.isBackendAvailable = false
      return true // Don't throw, allow mock mode to work
    }
  }

  async setupActor() {
    try { 
      const identity = this.authClient.getIdentity()
      const host = import.meta.env.VITE_DFX_NETWORK === 'local' 
        ? 'http://localhost:8000' 
        : 'https://ic0.app'

      // Create a new HttpAgent with the current identity
      this.agent = new HttpAgent({
        identity,
        host,
        verifyQuerySignatures: false // Disable for local development
      })

      // Fetch root key for certificate validation in development
      if (import.meta.env.VITE_DFX_NETWORK === 'local') {
        try {
          await this.agent.fetchRootKey()
          console.log('Root key fetched successfully')
        } catch (error) {
          console.warn('Failed to fetch root key:', error)
          // Continue anyway for local development
        }
      }

      // Create actor with the new agent
      this.actor = Actor.createActor(idlFactory, {
        agent: this.agent,
        canisterId: BACKEND_CANISTER_ID,
      })
      
      console.log('Actor setup completed with identity:', identity.getPrincipal().toString())
    } catch (error) {
      console.error('Failed to setup actor:', error)
      throw error
    }
  }

  async setupAnonymousActor() {
    try {
      this.agent = new HttpAgent({
        host: import.meta.env.VITE_DFX_NETWORK === 'local' 
        ? 'http://localhost:8000' 
        : 'https://ic0.app',
        verifyQuerySignatures: false // Disable for local development
      })

      if (import.meta.env.VITE_DFX_NETWORK === 'local') {
        try {
          await this.agent.fetchRootKey()
          console.log('Root key fetched successfully')
        } catch (error) {
          console.warn('Failed to fetch root key:', error)
          // Continue anyway for local development
        }
      }

      this.actor = Actor.createActor(idlFactory, {
        agent: this.agent,
        canisterId: BACKEND_CANISTER_ID,
      })
      console.log('Anonymous actor setup complete')
    } catch(error) {
      console.error('Failed to setup anonymous actor:', error)
      throw error
    }
  }

  async login() {
    try {
      // Use LOCAL Internet Identity for development with local backend
      const identityProvider = import.meta.env.VITE_DFX_NETWORK === 'local'
        ? `http://rdmx6-jaaaa-aaaaa-aaadq-cai.localhost:8000/`
        : 'https://identity.ic0.app'

      console.log('Logging in with Internet Identity at:', identityProvider)

      return new Promise((resolve) => {
        this.authClient.login({
          identityProvider,
          maxTimeToLive: BigInt(7 * 24 * 60 * 60 * 1000 * 1000 * 1000), // 7 days
          onSuccess: async () => {
            console.log('Login successful')
            this.isAuthenticated = true
            
            // CRITICAL: Re-setup actor with new authenticated identity
            await this.setupActor()
            
            resolve(true)
          },
          onError: (err) => {
            console.error('Login error:', err)
            resolve(false)
          }
        })
      })
    } catch (error) {
      console.error('Login failed:', error)
      return false
    }
  }

  async logout() {
    try {
      await this.authClient.logout()
      this.isAuthenticated = false
      this.currentUser = null
      this.actor = null
      this.agent = null
      await this.setupAnonymousActor()
      return true
    } catch (error) {
      console.error('Logout failed:', error)
      return false
    }
  }

  getPrincipal() {
    if (!this.isAuthenticated) return null
    return this.authClient.getIdentity().getPrincipal()
  }

  async backendLogin() {
    try {
      const result = await this.actor.login()
      
      if ('Ok' in result) {
        return { success: true, data: result.Ok }
      } else {
        return { success: false, error: result.Err }
      }
    } catch (error) {
      console.error('Backend login failed:', error)
      return { success: false, error: { InternalError: error.message } }
    }
  }

  async getAuthContext() {
    try {
      const result = await this.actor.getAuthContext()
      return { success: true, data: result }
    } catch (error) {
      console.error('Failed to get auth context:', error)
      return { success: false, error: { InternalError: error.message } }
    }
  }

  async getCurrentUser() {
    if (!this.isAuthenticated) return null
    
    try {
      const principal = this.getPrincipal()
      console.log('Getting user for principal:', principal.toString())
      
      // Add a small delay to ensure actor is properly set up
      await new Promise(resolve => setTimeout(resolve, 100))
      
      const result = await this.actor.getUser(principal)
      
      if ('Ok' in result) {
        this.currentUser = result.Ok
        console.log('Current user loaded:', this.currentUser)
        return this.currentUser
      } else {
        console.log('User not found, needs registration:', result.Err)
        return null
      }
    } catch (error) {
      console.warn('Failed to get current user (this is often normal for new users):', error.message || error)
      return null
    }
  }

  async registerUser(userData) {
    if (!this.isAuthenticated) throw new Error('Must be authenticated to register')
    
    try {
      // Add a small delay to ensure actor is properly set up
      await new Promise(resolve => setTimeout(resolve, 100))
      
      const result = await this.actor.registerUser(userData)
      
      if ('Ok' in result) {
        this.currentUser = result.Ok
        return { success: true, data: result.Ok }
      } else {
        return { success: false, error: result.Err }
      }
    } catch (error) {
      console.error('Registration failed:', error)
      return { success: false, error: { InternalError: error.message } }
    }
  }

  async updateUserProfile(profileData) {
    if (!this.isAuthenticated) throw new Error('Must be authenticated to update profile')
    
    try {
      const result = await this.actor.updateUser(profileData)
      
      if ('Ok' in result) {
        this.currentUser = result.Ok
        return { success: true, data: result.Ok }
      } else {
        return { success: false, error: result.Err }
      }
    } catch (error) {
      console.error('Profile update failed:', error)
      return { success: false, error: { InternalError: error.message } }
    }
  }

  async getUser(principal) {
    try {
      const result = await this.actor.getUser(principal)
      
      if ('Ok' in result) {
        return { success: true, data: result.Ok }
      } else {
        return { success: false, error: result.Err }
      }
    } catch (error) {
      console.error('Failed to get user:', error)
      return { success: false, error: { InternalError: error.message } }
    }
  }

  async createRepository(repoData) {
    if (!this.isAuthenticated) throw new Error('Must be authenticated to create repository')
    
    try {
      const result = await this.actor.createRepository(repoData)
      
      if ('Ok' in result) {
        return { success: true, data: result.Ok }
      } else {
        return { success: false, error: result.Err }
      }
    } catch (error) {
      console.error('Repository creation failed:', error)
      return { success: false, error: { InternalError: error.message } }
    }
  }

  async getRepository(repositoryId) {
    try {
      const result = await this.actor.getRepository(repositoryId)
      
      if ('Ok' in result) {
        return { success: true, data: result.Ok }
      } else {
        return { success: false, error: result.Err }
      }
    } catch (error) {
      console.error('Failed to get repository:', error)
      return { success: false, error: { InternalError: error.message } }
    }
  }

  async listRepositories(owner, pagination = null) {
    try {
      const ownerPrincipal = typeof owner === 'string' ? Principal.fromText(owner) : owner
      const result = await this.actor.listRepositories(ownerPrincipal, pagination ? [pagination] : [])
      
      if ('Ok' in result) {
        return { success: true, data: result.Ok }
      } else {
        return { success: false, error: result.Err }
      }
    } catch (error) {
      console.error('Failed to list repositories:', error)
      return { success: false, error: { InternalError: error.message } }
    }
  }

  async updateRepository(repositoryId, updateData) {
    if (!this.isAuthenticated) throw new Error('Must be authenticated to update repository')
    
    try {
      const result = await this.actor.updateRepository(repositoryId, updateData)
      
      if ('Ok' in result) {
        return { success: true, data: result.Ok }
      } else {
        return { success: false, error: result.Err }
      }
    } catch (error) {
      console.error('Repository update failed:', error)
      return { success: false, error: { InternalError: error.message } }
    }
  }

  async deleteRepository(repositoryId) {
    if (!this.isAuthenticated) throw new Error('Must be authenticated to delete repository')
    
    try {
      const result = await this.actor.deleteRepository(repositoryId)
      
      if ('Ok' in result) {
        return { success: true, data: result.Ok }
      } else {
        return { success: false, error: result.Err }
      }
    } catch (error) {
      console.error('Repository deletion failed:', error)
      return { success: false, error: { InternalError: error.message } }
    }
  }

  async uploadFile(fileData) {
    if (!this.isAuthenticated) throw new Error('Must be authenticated to upload files')
    
    try {
      const result = await this.actor.uploadFile(fileData)
      
      if ('Ok' in result) {
        return { success: true, data: result.Ok }
      } else {
        return { success: false, error: result.Err }
      }
    } catch (error) {
      console.error('File upload failed:', error)
      return { success: false, error: { InternalError: error.message } }
    }
  }

  async getFile(repositoryId, path) {
    try {
      const result = await this.actor.getFile(repositoryId, path)
      
      if ('Ok' in result) {
        return { success: true, data: result.Ok }
      } else {
        return { success: false, error: result.Err }
      }
    } catch (error) {
      console.error('Failed to get file:', error)
      return { success: false, error: { InternalError: error.message } }
    }
  }

  async listFiles(repositoryId, path = null) {
    try {
      const result = await this.actor.listFiles(repositoryId, path ? [path] : [])
      
      if ('Ok' in result) {
        return { success: true, data: result.Ok }
      } else {
        return { success: false, error: result.Err }
      }
    } catch (error) {
      console.error('Failed to list files:', error)
      return { success: false, error: { InternalError: error.message } }
    }
  }

  async deleteFile(repositoryId, path) {
    if (!this.isAuthenticated) throw new Error('Must be authenticated to delete files')
    
    try {
      const result = await this.actor.deleteFile(repositoryId, path)
      
      if ('Ok' in result) {
        return { success: true, data: result.Ok }
      } else {
        return { success: false, error: result.Err }
      }
    } catch (error) {
      console.error('File deletion failed:', error)
      return { success: false, error: { InternalError: error.message } }
    }
  }

  async getFileTree(repositoryId, path = null) {
    try {
      // Check if backend is available
      if (!this.actor || !this.isBackendAvailable) {
        console.log('Backend not available, returning mock file tree')
        // Return a comprehensive mock file tree for development
        return {
          success: true,
          data: {
            rootPath: path || '',
            nodes: this.getMockFileTree(repositoryId, path)
          }
        }
      }

      // For authenticated users, call the backend
      const result = await this.actor.getFileTree(repositoryId, path ? [path] : [])
      
      if ('Ok' in result) {
        return { success: true, data: result.Ok }
      } else {
        return { success: false, error: result.Err }
      }
    } catch (error) {
      console.error('Failed to get file tree:', error)
      // Return mock data when backend fails
      return {
        success: true,
        data: {
          rootPath: path || '',
          nodes: this.getMockFileTree(repositoryId, path)
        }
      }
    }
  }

  // Enhanced mock file tree generator
  getMockFileTree(repositoryId, path = null) {
    const baseFiles = [
      {
        path: 'README.md',
        name: 'README.md',
        isFolder: false,
        size: 2048,
        lastModified: Date.now(),
      },
      {
        path: 'src',
        name: 'src',
        isFolder: true,
        children: [
          {
            path: 'src/main.mo',
            name: 'main.mo',
            isFolder: false,
            size: 4096,
            lastModified: Date.now() - 86400000,
          },
          {
            path: 'src/types.mo',
            name: 'types.mo',
            isFolder: false,
            size: 2048,
            lastModified: Date.now() - 172800000,
          },
          {
            path: 'src/utils.mo',
            name: 'utils.mo',
            isFolder: false,
            size: 3072,
            lastModified: Date.now() - 259200000,
          }
        ]
      },
      {
        path: 'assets',
        name: 'assets',
        isFolder: true,
        children: [
          {
            path: 'assets/logo.png',
            name: 'logo.png',
            isFolder: false,
            size: 15360,
            lastModified: Date.now() - 3600000,
          },
          {
            path: 'assets/icon.svg',
            name: 'icon.svg',
            isFolder: false,
            size: 2048,
            lastModified: Date.now() - 7200000,
          }
        ]
      },
      {
        path: 'dfx.json',
        name: 'dfx.json',
        isFolder: false,
        size: 1024,
        lastModified: Date.now() - 7200000,
      },
      {
        path: 'package.json',
        name: 'package.json',
        isFolder: false,
        size: 512,
        lastModified: Date.now() - 10800000,
      },
      {
        path: 'mops.toml',
        name: 'mops.toml',
        isFolder: false,
        size: 256,
        lastModified: Date.now() - 14400000,
      }
    ]

    // If a specific path is requested, filter and return relevant files
    if (path) {
      const filteredFiles = baseFiles.filter(file => 
        file.path.startsWith(path) || file.path === path
      )
      return filteredFiles
    }

    return baseFiles
  }

  async search(searchRequest) {
    try {
      const result = await this.actor.search(searchRequest)
      
      if ('Ok' in result) {
        return { success: true, data: result.Ok }
      } else {
        return { success: false, error: result.Err }
      }
    } catch (error) {
      console.error('Search failed:', error)
      return { success: false, error: { InternalError: error.message } }
    }
  }

  async searchSuggestions(query, maxSuggestions = null) {
    try {
      const result = await this.actor.searchSuggestions(query, maxSuggestions ? [maxSuggestions] : [])
      
      if ('Ok' in result) {
        return { success: true, data: result.Ok }
      } else {
        return { success: false, error: result.Err }
      }
    } catch (error) {
      console.error('Search suggestions failed:', error)
      return { success: false, error: { InternalError: error.message } }
    }
  }

  async searchRepository(repositoryId, query, pagination = null) {
    try {
      const result = await this.actor.searchRepository(repositoryId, query, pagination ? [pagination] : [])
      
      if ('Ok' in result) {
        return { success: true, data: result.Ok }
      } else {
        return { success: false, error: result.Err }
      }
    } catch (error) {
      console.error('Repository search failed:', error)
      return { success: false, error: { InternalError: error.message } }
    }
  }

  async health() {
    try {
      if (!this.actor) await this.setupAnonymousActor()
      return await this.actor.health()
    } catch (error) {
      return false
    }
  }

  fileToUint8Array(file) {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const arrayBuffer = e.target.result
        const uint8Array = new Uint8Array(arrayBuffer)
        resolve(Array.from(uint8Array))
      }
      reader.readAsArrayBuffer(file)
    })
  }

  uint8ArrayToString(uint8Array) {
    return new TextDecoder().decode(new Uint8Array(uint8Array))
  }

  stringToUint8Array(str) {
    return Array.from(new TextEncoder().encode(str))
  }

  formatTimestamp(timestamp) {
    return new Date(Number(timestamp) / 1000000).toLocaleString()
  }

  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  getErrorMessage(error) {
    if (typeof error === 'string') {
      return error
    }
    
    if (error && typeof error === 'object') {
      // Handle Motoko Result.Err responses
      if (error.NotFound) return `Not found: ${error.NotFound}`
      if (error.Unauthorized) return `Unauthorized: ${error.Unauthorized}`
      if (error.BadRequest) return `Bad request: ${error.BadRequest}`
      if (error.Conflict) return `Conflict: ${error.Conflict}`
      if (error.Forbidden) return `Forbidden: ${error.Forbidden}`
      if (error.InternalError) return `Internal error: ${error.InternalError}`
      
      // Handle network errors
      if (error.message) {
        if (error.message.includes('ERR_CONNECTION_REFUSED')) {
          return 'Backend connection failed. Please ensure DFX is running with: dfx start'
        }
        if (error.message.includes('Failed to fetch')) {
          return 'Network error. Please check your connection and try again.'
        }
        return error.message
      }
    }
    
    return 'An unexpected error occurred'
  }

  async isAuthenticationValid() {
    try {
      if (!this.isAuthenticated || !this.actor) {
        return false
      }
      
      // Try a simple query to verify the connection
      const result = await this.actor.health()
      return result === true
    } catch (error) {
      console.error('Authentication validation failed:', error)
      return false
    }
  }

  async checkBackendAvailability() {
    try {
      if (!this.actor) {
        this.isBackendAvailable = false
        return false
      }
      
      // Try a simple health check
      const result = await this.actor.health()
      this.isBackendAvailable = result === true
      
      if (this.isBackendAvailable) {
        console.log('✅ Backend is available and responding')
      } else {
        console.log('⚠️ Backend health check failed')
      }
      
      return this.isBackendAvailable
    } catch (error) {
      console.warn('Backend not available, switching to mock mode:', error.message)
      this.isBackendAvailable = false
      return false
    }
  }

  async retryRequest(requestFn, maxRetries = 3, delay = 1000) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const result = await requestFn()
        return result
      } catch (error) {
        console.warn(`Request attempt ${attempt} failed:`, error)
        
        if (attempt === maxRetries) {
          throw error
        }
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, delay * attempt))
      }
    }
  }

  async listPublicRepositories(pagination = null) {
    try {
      const result = await this.actor.listPublicRepositories(pagination ? [pagination] : [])
      
      if ('Ok' in result) {
        return { success: true, data: result.Ok }
      } else {
        return { success: false, error: result.Err }
      }
    } catch (error) {
      console.error('Failed to list public repositories:', error)
      return { success: false, error: { InternalError: error.message } }
    }
  }

  async searchPublicRepositories(searchQuery, pagination = null) {
    try {
      const result = await this.actor.searchPublicRepositories(searchQuery, pagination ? [pagination] : [])
      
      if ('Ok' in result) {
        return { success: true, data: result.Ok }
      } else {
        return { success: false, error: result.Err }
      }
    } catch (error) {
      console.error('Failed to search public repositories:', error)
      return { success: false, error: { InternalError: error.message } }
    }
  }

  async getRepositoryStats() {
    try {
      const stats = await this.actor.getRepositoryStats()
      return { success: true, data: stats }
    } catch (error) {
      console.error('Failed to get repository stats:', error)
      return { success: false, error: { InternalError: error.message } }
    }
  }

  async getGlobalStats() {
    try {
      const stats = await this.actor.getGlobalStats()
      return { success: true, data: stats }
    } catch (error) {
      console.error('Failed to get global stats:', error)
      return { success: false, error: { InternalError: error.message } }
    }
  }

  async getRepositoryDetailsStats(repositoryId) {
    try {
      const result = await this.actor.getRepositoryDetailsStats(repositoryId)
      
      if ('Ok' in result) {
        return { success: true, data: result.Ok }
      } else {
        return { success: false, error: result.Err }
      }
    } catch (error) {
      console.error('Failed to get repository details stats:', error)
      return { success: false, error: { InternalError: error.message } }
    }
  }

  async getFileTree(repositoryId, path = null) {
    try {
      if (!this.actor) {
        await this.init();
      }
      
      const result = await this.actor.getFileTree(repositoryId, path || '');
      return {
        success: true,
        data: {
          nodes: result.Ok ? result.Ok.files : []
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async createFolder(repositoryId, parentPath, folderName) {
    try {
      if (!this.actor) {
        await this.init();
      }
      
      const fullPath = parentPath ? `${parentPath}/${folderName}` : folderName;
      const result = await this.actor.createFolder(repositoryId, fullPath);
      
      return {
        success: result.Ok !== undefined,
        data: result.Ok
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async uploadFile(request) {
    try {
      if (!this.actor) {
        await this.init();
      }
      
      const result = await this.actor.uploadFile(
        request.repositoryId,
        request.path,
        request.content,
        request.commitMessage
      );
      
      return {
        success: result.Ok !== undefined,
        data: result.Ok
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

// Create and export a singleton instance
const apiService = new ApiService()

export default apiService
