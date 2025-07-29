import { useState, useEffect, useCallback, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { authService } from '../services/auth';
import {
  idlFactory,
  canisterId,
} from '../../declarations/icp_hub_backend/index.js';

// Custom hook for ICP Hub backend operations
export const useICPHub = () => {
  const [actor, setActor] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user, isAuthenticated } = useContext(AuthContext);

  // Initialize actor when user is authenticated
  useEffect(() => {
    if (isAuthenticated && canisterId) {
      try {
        const backendActor = authService.createActor(canisterId, idlFactory);
        setActor(backendActor);
      } catch (err) {
        console.log(err); // Log full error object for UserInterrupt debugging
        console.error('Failed to create backend actor:', err);
        setError(err.message);
      }
    } else {
      setActor(null);
    }
  }, [isAuthenticated]);

  // Generic API call wrapper
  const apiCall = useCallback(
    async (operation, ...args) => {
      if (!actor) {
        throw new Error('Backend actor not initialized. Please login first.');
      }

      setLoading(true);
      setError(null);

      try {
        const result = await actor[operation](...args);

        // Handle Motoko Result type
        if (result && typeof result === 'object') {
          if ('Ok' in result) {
            return result.Ok;
          } else if ('Err' in result) {
            const errorMsg =
              typeof result.Err === 'object'
                ? Object.values(result.Err)[0]
                : result.Err;
            throw new Error(errorMsg);
          }
        }

        return result;
      } catch (err) {
        console.log(err); // Log full error object for UserInterrupt debugging
        const errorMessage = err.message || 'An unknown error occurred';
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [actor]
  );

  return {
    actor,
    loading,
    error,
    apiCall,
    isReady: !!actor,
  };
};

// Hook for user operations
export const useUser = () => {
  const { apiCall, loading, error } = useICPHub();
  const [userProfile, setUserProfile] = useState(null);

  const registerUser = useCallback(
    async (username, email, profile = {}) => {
      const result = await apiCall('registerUser', {
        username,
        email: email ? [email] : [],
        profile: {
          displayName: profile.displayName ? [profile.displayName] : [],
          bio: profile.bio ? [profile.bio] : [],
          avatar: profile.avatar ? [profile.avatar] : [],
          location: profile.location ? [profile.location] : [],
          website: profile.website ? [profile.website] : [],
          socialLinks: profile.socialLinks || [],
          externalLinks: profile.externalLinks || [],
          skills: profile.skills || [],
        },
      });
      setUserProfile(result);
      return result;
    },
    [apiCall]
  );

  const getUser = useCallback(
    async principal => {
      const result = await apiCall('getUser', principal);
      setUserProfile(result);
      return result;
    },
    [apiCall]
  );

  const updateProfile = useCallback(
    async profile => {
      const result = await apiCall('updateProfile', {
        displayName: profile.displayName ? [profile.displayName] : [],
        bio: profile.bio ? [profile.bio] : [],
        avatar: profile.avatar ? [profile.avatar] : [],
        location: profile.location ? [profile.location] : [],
        website: profile.website ? [profile.website] : [],
        socialLinks: profile.socialLinks || [],
        externalLinks: profile.externalLinks || [],
        skills: profile.skills || [],
      });
      setUserProfile(result);
      return result;
    },
    [apiCall]
  );

  const linkExternalAccount = useCallback(
    async (platform, accountId) => {
      return await apiCall('linkExternalAccount', platform, accountId);
    },
    [apiCall]
  );

  const getLinkedAccounts = useCallback(async () => {
    return await apiCall('getLinkedAccounts');
  }, [apiCall]);

  return {
    userProfile,
    registerUser,
    getUser,
    updateProfile,
    linkExternalAccount,
    getLinkedAccounts,
    loading,
    error,
  };
};

// Hook for repository operations
export const useRepository = () => {
  const { apiCall, loading, error } = useICPHub();
  const [repositories, setRepositories] = useState([]);
  const [currentRepository, setCurrentRepository] = useState(null);

  const createRepository = useCallback(
    async (name, description, isPrivate = false, license) => {
      const result = await apiCall('createRepository', {
        name,
        description: description ? [description] : [],
        isPrivate,
        license: license ? [license] : [],
      });
      setCurrentRepository(result);
      return result;
    },
    [apiCall]
  );

  const getRepository = useCallback(
    async id => {
      const result = await apiCall('getRepository', id);
      setCurrentRepository(result);
      return result;
    },
    [apiCall]
  );

  const listUserRepositories = useCallback(
    async (username, page = 0, limit = 10) => {
      const result = await apiCall(
        'listUserRepositories',
        username ? [username] : [],
        [
          {
            page: BigInt(page),
            limit: BigInt(limit),
          },
        ]
      );
      setRepositories(result.repositories);
      return result;
    },
    [apiCall]
  );

  const starRepository = useCallback(
    async repositoryId => {
      return await apiCall('starRepository', repositoryId);
    },
    [apiCall]
  );

  const unstarRepository = useCallback(
    async repositoryId => {
      return await apiCall('unstarRepository', repositoryId);
    },
    [apiCall]
  );

  const forkRepository = useCallback(
    async (repositoryId, newName) => {
      const result = await apiCall(
        'forkRepository',
        repositoryId,
        newName ? [newName] : []
      );
      return result;
    },
    [apiCall]
  );

  const addCollaborator = useCallback(
    async (repositoryId, collaboratorPrincipal) => {
      return await apiCall(
        'addCollaborator',
        repositoryId,
        collaboratorPrincipal
      );
    },
    [apiCall]
  );

  const getCollaborators = useCallback(
    async repositoryId => {
      return await apiCall('getCollaborators', repositoryId);
    },
    [apiCall]
  );

  return {
    repositories,
    currentRepository,
    createRepository,
    getRepository,
    listUserRepositories,
    starRepository,
    unstarRepository,
    forkRepository,
    addCollaborator,
    getCollaborators,
    loading,
    error,
  };
};

// Hook for file operations
export const useFiles = () => {
  const { apiCall, loading, error } = useICPHub();
  const [files, setFiles] = useState([]);
  const [currentFile, setCurrentFile] = useState(null);

  const uploadFile = useCallback(
    async (repositoryId, path, content, commitMessage) => {
      // Convert content to Uint8Array if it's not already
      const fileContent =
        content instanceof Uint8Array
          ? content
          : new TextEncoder().encode(content);

      const result = await apiCall('uploadFile', {
        repositoryId,
        path,
        content: fileContent,
        commitMessage,
      });
      setCurrentFile(result);
      return result;
    },
    [apiCall]
  );

  const getFile = useCallback(
    async (repositoryId, path) => {
      const result = await apiCall('getFile', repositoryId, path);
      setCurrentFile(result);
      return result;
    },
    [apiCall]
  );

  const listFiles = useCallback(
    async (repositoryId, path) => {
      const result = await apiCall(
        'listFiles',
        repositoryId,
        path ? [path] : []
      );
      setFiles(result.files);
      return result;
    },
    [apiCall]
  );

  return {
    files,
    currentFile,
    uploadFile,
    getFile,
    listFiles,
    loading,
    error,
  };
};

// Hook for system operations
export const useSystem = () => {
  const { apiCall, loading, error } = useICPHub();
  const [systemStats, setSystemStats] = useState(null);
  const [healthStatus, setHealthStatus] = useState(null);

  const checkHealth = useCallback(async () => {
    const result = await apiCall('health');
    setHealthStatus(result);
    return result;
  }, [apiCall]);

  const getMemoryStats = useCallback(async () => {
    const result = await apiCall('getMemoryStats');
    setSystemStats(result);
    return result;
  }, [apiCall]);

  return {
    systemStats,
    healthStatus,
    checkHealth,
    getMemoryStats,
    loading,
    error,
  };
};

// Combined hook for all operations
export const useICPHubAPI = () => {
  const icpHub = useICPHub();
  const user = useUser();
  const repository = useRepository();
  const files = useFiles();
  const system = useSystem();

  return {
    ...icpHub,
    user,
    repository,
    files,
    system,
  };
};
