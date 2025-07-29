import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, GitBranch, Calendar, Users } from 'lucide-react';
import Card from './ui/Card';
import Button from './ui/Button';
import Notification from './ui/Notification';
import LoadingSpinner from './LoadingSpinner';

const ProjectManager = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    blockchain: 'ICP',
    status: 'active'
  });

  // Mock data for initial load
  useEffect(() => {
    const loadProjects = async () => {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setProjects([
        {
          id: '1',
          name: 'DeFi Trading Platform',
          description: 'A decentralized trading platform built on Internet Computer',
          blockchain: 'ICP',
          status: 'active',
          createdAt: '2024-01-15',
          contributors: 3,
          commits: 47
        },
        {
          id: '2', 
          name: 'NFT Marketplace',
          description: 'Cross-chain NFT marketplace supporting multiple blockchains',
          blockchain: 'Ethereum',
          status: 'development',
          createdAt: '2024-02-01',
          contributors: 5,
          commits: 23
        },
        {
          id: '3',
          name: 'DAO Governance Tool',
          description: 'Decentralized governance platform for community voting',
          blockchain: 'ICP',
          status: 'planning',
          createdAt: '2024-02-10',
          contributors: 2,
          commits: 12
        }
      ]);
      setLoading(false);
    };

    loadProjects();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call

      if (editingProject) {
        // Update existing project
        const updatedProjects = projects.map(project =>
          project.id === editingProject.id
            ? { ...project, ...formData, updatedAt: new Date().toISOString().split('T')[0] }
            : project
        );
        setProjects(updatedProjects);
        setNotification({ type: 'success', title: 'Success', message: 'Project updated successfully!' });
      } else {
        // Create new project
        const newProject = {
          ...formData,
          id: Date.now().toString(),
          createdAt: new Date().toISOString().split('T')[0],
          contributors: 1,
          commits: 0
        };
        setProjects([...projects, newProject]);
        setNotification({ type: 'success', title: 'Success', message: 'Project created successfully!' });
      }

      // Reset form
      setFormData({ name: '', description: '', blockchain: 'ICP', status: 'active' });
      setShowCreateForm(false);
      setEditingProject(null);
    } catch (error) {
      setNotification({ type: 'error', title: 'Error', message: 'Failed to save project. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (project) => {
    setEditingProject(project);
    setFormData({
      name: project.name,
      description: project.description,
      blockchain: project.blockchain,
      status: project.status
    });
    setShowCreateForm(true);
  };

  const handleDelete = async (projectId) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;

    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call
      
      const updatedProjects = projects.filter(project => project.id !== projectId);
      setProjects(updatedProjects);
      setNotification({ type: 'success', title: 'Success', message: 'Project deleted successfully!' });
    } catch (error) {
      setNotification({ type: 'error', title: 'Error', message: 'Failed to delete project. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'development': return 'bg-blue-100 text-blue-800';
      case 'planning': return 'bg-yellow-100 text-yellow-800';
      case 'paused': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getBlockchainColor = (blockchain) => {
    switch (blockchain) {
      case 'ICP': return 'bg-purple-100 text-purple-800';
      case 'Ethereum': return 'bg-blue-100 text-blue-800';
      case 'Polygon': return 'bg-indigo-100 text-indigo-800';
      case 'BSC': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading && projects.length === 0) {
    return (
      <div className="p-8">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Project Manager</h1>
          <p className="text-gray-600 mt-2">Manage your Web3 development projects</p>
        </div>
        <Button
          onClick={() => {
            setShowCreateForm(true);
            setEditingProject(null);
            setFormData({ name: '', description: '', blockchain: 'ICP', status: 'active' });
          }}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          New Project
        </Button>
      </div>

      {/* Notification */}
      {notification && (
        <div className="mb-6">
          <Notification
            type={notification.type}
            title={notification.title}
            message={notification.message}
            onDismiss={() => setNotification(null)}
          />
        </div>
      )}

      {/* Create/Edit Form */}
      {showCreateForm && (
        <Card className="mb-8">
          <Card.Header>
            <Card.Title>
              {editingProject ? 'Edit Project' : 'Create New Project'}
            </Card.Title>
          </Card.Header>
          <Card.Content>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Project Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Blockchain
                  </label>
                  <select
                    value={formData.blockchain}
                    onChange={(e) => setFormData({ ...formData, blockchain: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="ICP">Internet Computer</option>
                    <option value="Ethereum">Ethereum</option>
                    <option value="Polygon">Polygon</option>
                    <option value="BSC">BSC</option>
                    <option value="Avalanche">Avalanche</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="planning">Planning</option>
                  <option value="development">Development</option>
                  <option value="active">Active</option>
                  <option value="paused">Paused</option>
                </select>
              </div>

              <div className="flex gap-3">
                <Button type="submit" loading={loading}>
                  {editingProject ? 'Update Project' : 'Create Project'}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setShowCreateForm(false);
                    setEditingProject(null);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Card.Content>
        </Card>
      )}

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <Card key={project.id} className="hover:shadow-md transition-shadow">
            <Card.Content className="p-0">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                    {project.name}
                  </h3>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEdit(project)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(project.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {project.description}
                </p>

                <div className="flex gap-2 mb-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                    {project.status}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getBlockchainColor(project.blockchain)}`}>
                    {project.blockchain}
                  </span>
                </div>

                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>Created {project.createdAt}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>{project.contributors} contributors</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <GitBranch className="h-4 w-4" />
                    <span>{project.commits} commits</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 px-6 py-3">
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full flex items-center justify-center gap-2"
                >
                  <Eye className="h-4 w-4" />
                  View Details
                </Button>
              </div>
            </Card.Content>
          </Card>
        ))}
      </div>

      {projects.length === 0 && !loading && (
        <Card className="text-center py-12">
          <Card.Content>
            <div className="text-gray-500">
              <Plus className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium mb-2">No projects yet</h3>
              <p className="mb-4">Create your first Web3 project to get started</p>
              <Button onClick={() => setShowCreateForm(true)}>
                Create Your First Project
              </Button>
            </div>
          </Card.Content>
        </Card>
      )}
    </div>
  );
};

export default ProjectManager;
