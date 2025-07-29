import { useCallback } from 'react';
import { useRepoStore } from '../store';
import { v4 as uuidv4 } from 'uuid';
import toast from 'react-hot-toast';

export const useRepo = () => {
  const {
    repositories,
    currentRepo,
    isLoading,
    setRepositories,
    setCurrentRepo,
    setLoading,
    addRepository,
    updateRepository,
    deleteRepository
  } = useRepoStore();

  const createRepository = useCallback(async (repoData) => {
    setLoading(true);
    try {
      const newRepo = {
        id: uuidv4(),
        name: repoData.name,
        description: repoData.description || '',
        isPrivate: repoData.isPrivate || false,
        language: repoData.language || 'JavaScript',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        owner: repoData.owner,
        collaborators: [repoData.owner],
        branches: ['main'],
        defaultBranch: 'main',
        stars: 0,
        forks: 0,
        size: 0,
        files: [],
        commits: [],
        issues: [],
        pullRequests: []
      };

      addRepository(newRepo);
      toast.success(`Repository "${newRepo.name}" created successfully!`);
      return newRepo;
    } catch (error) {
      console.error('Failed to create repository:', error);
      toast.error('Failed to create repository');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [addRepository, setLoading]);

  const cloneRepository = useCallback(async (repoUrl, targetName) => {
    setLoading(true);
    try {
      // Simulate cloning process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const clonedRepo = {
        id: uuidv4(),
        name: targetName || repoUrl.split('/').pop().replace('.git', ''),
        description: `Cloned from ${repoUrl}`,
        isPrivate: false,
        language: 'Unknown',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        originalUrl: repoUrl,
        owner: 'current-user', // This should be the current user
        collaborators: ['current-user'],
        branches: ['main'],
        defaultBranch: 'main',
        stars: 0,
        forks: 0,
        size: 0,
        files: [],
        commits: [],
        issues: [],
        pullRequests: []
      };

      addRepository(clonedRepo);
      toast.success(`Repository cloned successfully!`);
      return clonedRepo;
    } catch (error) {
      console.error('Failed to clone repository:', error);
      toast.error('Failed to clone repository');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [addRepository, setLoading]);

  const updateRepoDetails = useCallback(async (repoId, updates) => {
    setLoading(true);
    try {
      const updatedData = {
        ...updates,
        updatedAt: new Date().toISOString()
      };
      
      updateRepository(repoId, updatedData);
      toast.success('Repository updated successfully!');
    } catch (error) {
      console.error('Failed to update repository:', error);
      toast.error('Failed to update repository');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [updateRepository, setLoading]);

  const deleteRepo = useCallback(async (repoId) => {
    setLoading(true);
    try {
      deleteRepository(repoId);
      toast.success('Repository deleted successfully!');
    } catch (error) {
      console.error('Failed to delete repository:', error);
      toast.error('Failed to delete repository');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [deleteRepository, setLoading]);

  const forkRepository = useCallback(async (originalRepo) => {
    setLoading(true);
    try {
      const forkedRepo = {
        ...originalRepo,
        id: uuidv4(),
        name: `${originalRepo.name}-fork`,
        description: `Fork of ${originalRepo.name}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        originalRepo: originalRepo.id,
        owner: 'current-user', // This should be the current user
        collaborators: ['current-user'],
        forks: 0
      };

      // Update original repo fork count
      updateRepository(originalRepo.id, {
        forks: (originalRepo.forks || 0) + 1
      });

      addRepository(forkedRepo);
      toast.success(`Repository forked successfully!`);
      return forkedRepo;
    } catch (error) {
      console.error('Failed to fork repository:', error);
      toast.error('Failed to fork repository');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [addRepository, updateRepository, setLoading]);

  const starRepository = useCallback(async (repoId) => {
    try {
      const repo = repositories.find(r => r.id === repoId);
      if (repo) {
        updateRepository(repoId, {
          stars: (repo.stars || 0) + 1
        });
        toast.success('Repository starred!');
      }
    } catch (error) {
      console.error('Failed to star repository:', error);
      toast.error('Failed to star repository');
    }
  }, [repositories, updateRepository]);

  const getRepositoryCommits = useCallback(async (repoId) => {
    try {
      const repo = repositories.find(r => r.id === repoId);
      return repo?.commits || [];
    } catch (error) {
      console.error('Failed to get commits:', error);
      return [];
    }
  }, [repositories]);

  const createCommit = useCallback(async (repoId, commitData) => {
    try {
      const repo = repositories.find(r => r.id === repoId);
      if (repo) {
        const newCommit = {
          id: uuidv4(),
          message: commitData.message,
          author: commitData.author,
          timestamp: new Date().toISOString(),
          hash: Math.random().toString(36).substring(2, 15),
          changes: commitData.changes || []
        };

        const updatedCommits = [newCommit, ...(repo.commits || [])];
        updateRepository(repoId, {
          commits: updatedCommits,
          updatedAt: new Date().toISOString()
        });

        toast.success('Commit created successfully!');
        return newCommit;
      }
    } catch (error) {
      console.error('Failed to create commit:', error);
      toast.error('Failed to create commit');
      throw error;
    }
  }, [repositories, updateRepository]);

  return {
    repositories,
    currentRepo,
    isLoading,
    setCurrentRepo,
    createRepository,
    cloneRepository,
    updateRepoDetails,
    deleteRepo,
    forkRepository,
    starRepository,
    getRepositoryCommits,
    createCommit
  };
};
