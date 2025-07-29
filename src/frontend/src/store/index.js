/**
 * @fileoverview Zustand State Management Stores for ICPHub
 * 
 * This file contains all the state management stores using Zustand for the ICPHub application.
 * Each store manages a specific domain of the application:
 * - Repository management and Git operations
 * - File management and code editor state
 * - Build and test system state
 * - Real-time collaboration features
 * - System statistics and analytics
 * 
 * @author ICPHub Team
 * @version 1.0.0
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

/**
 * Repository Store - Manages Git repositories and project state
 * 
 * Handles all repository-related operations including CRUD operations,
 * current repository selection, and persistent storage of repository data.
 * Uses persistence middleware to maintain data across browser sessions.
 * 
 * @typedef {Object} Repository
 * @property {string} id - Unique repository identifier
 * @property {string} name - Repository display name
 * @property {string} description - Repository description
 * @property {string} owner - Repository owner principal
 * @property {Date} createdAt - Creation timestamp
 * @property {Date} updatedAt - Last update timestamp
 * @property {boolean} isPrivate - Privacy setting
 * @property {string[]} collaborators - List of collaborator principals
 */
export const useRepoStore = create(
  devtools(
    persist(
      (set, get) => ({
        // State
        repositories: [],        // Array of user's repositories
        currentRepo: null,       // Currently selected repository
        isLoading: false,        // Loading state for async operations
        
        // Actions
        
        /**
         * Set the complete list of repositories
         * @param {Repository[]} repos - Array of repository objects
         */
        setRepositories: (repos) => set({ repositories: repos }),
        
        /**
         * Set the currently active repository
         * @param {Repository|null} repo - Repository object or null
         */
        setCurrentRepo: (repo) => set({ currentRepo: repo }),
        
        /**
         * Set the loading state for repository operations
         * @param {boolean} loading - Loading state
         */
        setLoading: (loading) => set({ isLoading: loading }),
        
        /**
         * Add a new repository to the store
         * @param {Repository} repo - Repository object to add
         */
        addRepository: (repo) => set((state) => ({
          repositories: [...state.repositories, repo]
        })),
        
        /**
         * Update an existing repository
         * @param {string} repoId - Repository ID to update
         * @param {Partial<Repository>} updates - Partial repository object with updates
         */
        updateRepository: (repoId, updates) => set((state) => ({
          repositories: state.repositories.map(repo =>
            repo.id === repoId ? { ...repo, ...updates } : repo
          ),
          currentRepo: state.currentRepo?.id === repoId 
            ? { ...state.currentRepo, ...updates } 
            : state.currentRepo
        })),
        
        /**
         * Delete a repository from the store
         * @param {string} repoId - Repository ID to delete
         */
        deleteRepository: (repoId) => set((state) => ({
          repositories: state.repositories.filter(repo => repo.id !== repoId),
          currentRepo: state.currentRepo?.id === repoId ? null : state.currentRepo
        }))
      }),
      {
        name: 'repo-storage',
        // Only persist repositories, not loading states
        partialize: (state) => ({ repositories: state.repositories })
      }
    ),
    {
      name: 'repository-store' // DevTools store name
    }
  )
);

// File Management Store
export const useFileStore = create(
  devtools((set, get) => ({
    files: {},
    openFiles: [],
    activeFile: null,
    fileTree: null,
    isLoading: false,
    
    setFiles: (files) => set({ files }),
    setFileTree: (tree) => set({ fileTree: tree }),
    setLoading: (loading) => set({ isLoading: loading }),
    
    openFile: (file) => set((state) => {
      const isAlreadyOpen = state.openFiles.some(f => f.path === file.path);
      return {
        openFiles: isAlreadyOpen ? state.openFiles : [...state.openFiles, file],
        activeFile: file
      };
    }),
    
    closeFile: (filePath) => set((state) => {
      const newOpenFiles = state.openFiles.filter(f => f.path !== filePath);
      return {
        openFiles: newOpenFiles,
        activeFile: state.activeFile?.path === filePath 
          ? (newOpenFiles[0] || null) 
          : state.activeFile
      };
    }),
    
    setActiveFile: (file) => set({ activeFile: file }),
    
    updateFileContent: (filePath, content) => set((state) => ({
      files: {
        ...state.files,
        [filePath]: { ...state.files[filePath], content }
      }
    }))
  }))
);

// Build & Test Store
export const useBuildStore = create(
  devtools((set, get) => ({
    builds: [],
    tests: [],
    currentBuild: null,
    isBuilding: false,
    isTesting: false,
    
    setBuilds: (builds) => set({ builds }),
    setTests: (tests) => set({ tests }),
    setCurrentBuild: (build) => set({ currentBuild: build }),
    setBuilding: (building) => set({ isBuilding: building }),
    setTesting: (testing) => set({ isTesting: testing }),
    
    addBuild: (build) => set((state) => ({
      builds: [build, ...state.builds]
    })),
    
    addTest: (test) => set((state) => ({
      tests: [test, ...state.tests]
    }))
  }))
);

// Collaboration Store
export const useCollabStore = create(
  devtools((set, get) => ({
    activeUsers: [],
    comments: [],
    notifications: [],
    
    setActiveUsers: (users) => set({ activeUsers: users }),
    setComments: (comments) => set({ comments }),
    setNotifications: (notifications) => set({ notifications }),
    
    addActiveUser: (user) => set((state) => ({
      activeUsers: [...state.activeUsers.filter(u => u.id !== user.id), user]
    })),
    
    removeActiveUser: (userId) => set((state) => ({
      activeUsers: state.activeUsers.filter(u => u.id !== userId)
    })),
    
    addComment: (comment) => set((state) => ({
      comments: [...state.comments, comment]
    })),
    
    addNotification: (notification) => set((state) => ({
      notifications: [notification, ...state.notifications]
    })),
    
    markNotificationRead: (notificationId) => set((state) => ({
      notifications: state.notifications.map(n =>
        n.id === notificationId ? { ...n, read: true } : n
      )
    }))
  }))
);

// System Stats Store
export const useStatsStore = create(
  devtools((set, get) => ({
    stats: {
      totalProjects: 0,
      totalUsers: 0,
      totalCommits: 0,
      activeUsers: 0,
      buildSuccess: 0,
      testSuccess: 0
    },
    isLoading: false,
    
    setStats: (stats) => set({ stats }),
    setLoading: (loading) => set({ isLoading: loading }),
    
    updateStat: (key, value) => set((state) => ({
      stats: { ...state.stats, [key]: value }
    }))
  }))
);
