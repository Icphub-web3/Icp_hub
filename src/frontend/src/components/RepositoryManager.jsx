import React, { useState } from 'react';
import { 
  Plus, 
  GitFork, 
  Star, 
  Eye, 
  Lock, 
  Globe, 
  Calendar,
  Code,
  Users,
  GitBranch,
  Download,
  Trash2,
  Settings,
  Search
} from 'lucide-react';
import { useRepo } from '../hooks/useRepo';
import { formatDistanceToNow } from 'date-fns';

const RepositoryManager = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCloneModal, setShowCloneModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  
  const {
    repositories,
    currentRepo,
    isLoading,
    setCurrentRepo,
    createRepository,
    cloneRepository,
    updateRepoDetails,
    deleteRepo,
    forkRepository,
    starRepository
  } = useRepo();

  const filteredRepos = repositories.filter(repo =>
    repo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    repo.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const CreateRepoModal = () => {
    const [formData, setFormData] = useState({
      name: '',
      description: '',
      isPrivate: false,
      language: 'JavaScript'
    });

    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        await createRepository({
          ...formData,
          owner: 'current-user' // This should be the current user
        });
        setShowCreateModal(false);
        setFormData({ name: '', description: '', isPrivate: false, language: 'JavaScript' });
      } catch (error) {
        console.error('Failed to create repository:', error);
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <h3 className="text-lg font-semibold mb-4">Create New Repository</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Repository Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full border border-secondary-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full border border-secondary-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Language</label>
              <select
                value={formData.language}
                onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                className="w-full border border-secondary-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="JavaScript">JavaScript</option>
                <option value="TypeScript">TypeScript</option>
                <option value="Python">Python</option>
                <option value="Rust">Rust</option>
                <option value="Motoko">Motoko</option>
                <option value="Go">Go</option>
                <option value="Java">Java</option>
              </select>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="private"
                checked={formData.isPrivate}
                onChange={(e) => setFormData({ ...formData, isPrivate: e.target.checked })}
                className="mr-2"
              />
              <label htmlFor="private" className="text-sm">Make repository private</label>
            </div>
            <div className="flex space-x-2 pt-4">
              <button
                type="submit"
                className="flex-1 bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors"
                disabled={!formData.name || isLoading}
              >
                {isLoading ? 'Creating...' : 'Create Repository'}
              </button>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="flex-1 border border-secondary-200 px-4 py-2 rounded-lg hover:bg-secondary-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const CloneRepoModal = () => {
    const [repoUrl, setRepoUrl] = useState('');
    const [targetName, setTargetName] = useState('');

    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        await cloneRepository(repoUrl, targetName);
        setShowCloneModal(false);
        setRepoUrl('');
        setTargetName('');
      } catch (error) {
        console.error('Failed to clone repository:', error);
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <h3 className="text-lg font-semibold mb-4">Clone Repository</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Repository URL</label>
              <input
                type="url"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                placeholder="https://github.com/user/repo.git"
                className="w-full border border-secondary-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Local Name (optional)</label>
              <input
                type="text"
                value={targetName}
                onChange={(e) => setTargetName(e.target.value)}
                className="w-full border border-secondary-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div className="flex space-x-2 pt-4">
              <button
                type="submit"
                className="flex-1 bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors"
                disabled={!repoUrl || isLoading}
              >
                {isLoading ? 'Cloning...' : 'Clone Repository'}
              </button>
              <button
                type="button"
                onClick={() => setShowCloneModal(false)}
                className="flex-1 border border-secondary-200 px-4 py-2 rounded-lg hover:bg-secondary-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const RepoCard = ({ repo }) => (
    <div className="bg-white border border-secondary-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          <h3 className="font-semibold text-secondary-900">{repo.name}</h3>
          {repo.isPrivate ? (
            <Lock className="w-4 h-4 text-secondary-400" />
          ) : (
            <Globe className="w-4 h-4 text-secondary-400" />
          )}
        </div>
        <div className="flex items-center space-x-1">
          <button
            onClick={() => starRepository(repo.id)}
            className="p-1 rounded hover:bg-secondary-100 transition-colors"
          >
            <Star className="w-4 h-4" />
          </button>
          <span className="text-xs text-secondary-500">{repo.stars}</span>
        </div>
      </div>

      <p className="text-sm text-secondary-600 mb-3 min-h-[3rem]">
        {repo.description || 'No description available'}
      </p>

      <div className="flex items-center justify-between text-xs text-secondary-500 mb-3">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <Code className="w-3 h-3" />
            <span>{repo.language}</span>
          </div>
          <div className="flex items-center space-x-1">
            <GitBranch className="w-3 h-3" />
            <span>{repo.forks}</span>
          </div>
        </div>
        <span>Updated {formatDistanceToNow(new Date(repo.updatedAt), { addSuffix: true })}</span>
      </div>

      <div className="flex space-x-2">
        <button
          onClick={() => setCurrentRepo(repo)}
          className="flex-1 bg-primary-500 text-white px-3 py-1 rounded text-sm hover:bg-primary-600 transition-colors"
        >
          Open
        </button>
        <button
          onClick={() => forkRepository(repo)}
          className="px-3 py-1 border border-secondary-200 rounded text-sm hover:bg-secondary-50 transition-colors"
        >
          <GitFork className="w-3 h-3" />
        </button>
        <button className="px-3 py-1 border border-secondary-200 rounded text-sm hover:bg-secondary-50 transition-colors">
          <Settings className="w-3 h-3" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-secondary-900">Repositories</h2>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowCloneModal(true)}
            className="flex items-center space-x-2 px-4 py-2 border border-secondary-200 rounded-lg hover:bg-secondary-50 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Clone</span>
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>New Repository</span>
          </button>
        </div>
      </div>

      <div className="flex items-center space-x-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search repositories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-secondary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
        <select
          value={viewMode}
          onChange={(e) => setViewMode(e.target.value)}
          className="border border-secondary-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        >
          <option value="grid">Grid View</option>
          <option value="list">List View</option>
        </select>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-pulse text-secondary-500">Loading repositories...</div>
        </div>
      ) : filteredRepos.length === 0 ? (
        <div className="text-center py-12">
          <FolderGit2 className="w-12 h-12 text-secondary-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-secondary-900 mb-2">No repositories found</h3>
          <p className="text-secondary-600 mb-4">
            {searchTerm ? `No repositories match "${searchTerm}"` : 'Get started by creating your first repository'}
          </p>
          {!searchTerm && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors"
            >
              Create Repository
            </button>
          )}
        </div>
      ) : (
        <div className={`grid gap-4 ${
          viewMode === 'grid' 
            ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
            : 'grid-cols-1'
        }`}>
          {filteredRepos.map((repo) => (
            <RepoCard key={repo.id} repo={repo} />
          ))}
        </div>
      )}

      {showCreateModal && <CreateRepoModal />}
      {showCloneModal && <CloneRepoModal />}
    </div>
  );
};

export default RepositoryManager;
