import React, { useState } from 'react';
import { 
  Home, 
  FolderGit2, 
  FileText, 
  Settings, 
  Users, 
  Activity, 
  Bell, 
  Search,
  Menu,
  X,
  GitBranch,
  Code,
  TestTube,
  BarChart3,
  Briefcase
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useCollabStore } from '../store';

const Navigation = ({ currentView, onViewChange }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { principal, logout } = useAuth();
  const { notifications } = useCollabStore();

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'projects', label: 'Projects', icon: Briefcase },
    { id: 'repositories', label: 'Repositories', icon: FolderGit2 },
    { id: 'editor', label: 'Code Editor', icon: Code },
    { id: 'files', label: 'File Manager', icon: FileText },
    { id: 'builds', label: 'Build & Test', icon: TestTube },
    { id: 'collaboration', label: 'Collaboration', icon: Users },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'activity', label: 'Activity', icon: Activity },
  ];

  const unreadNotifications = notifications.filter(n => !n.read).length;

  return (
    <>
      {/* Header */}
      <header className="bg-white border-b border-secondary-200 px-4 py-3 flex items-center justify-between relative z-50">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-secondary-100 transition-colors"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg flex items-center justify-center">
              <GitBranch className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-xl font-bold text-secondary-900">ICPHub</h1>
          </div>
        </div>

        <div className="flex-1 max-w-md mx-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search repositories, files, users..."
              className="w-full pl-10 pr-4 py-2 border border-secondary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <button className="relative p-2 rounded-lg hover:bg-secondary-100 transition-colors">
            <Bell className="w-5 h-5" />
            {unreadNotifications > 0 && (
              <span className="absolute -top-1 -right-1 bg-error text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {unreadNotifications}
              </span>
            )}
          </button>
          
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                {principal?.toString().slice(0, 2).toUpperCase()}
              </span>
            </div>
            <button
              onClick={logout}
              className="text-sm text-secondary-600 hover:text-secondary-900 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <aside className={`fixed left-0 top-16 h-[calc(100vh-4rem)] bg-white border-r border-secondary-200 transition-transform duration-300 z-40 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } w-64`}>
        <nav className="p-4">
          <ul className="space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.id}>
                  <button
                    onClick={() => onViewChange(item.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      currentView === item.id
                        ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-500'
                        : 'text-secondary-600 hover:bg-secondary-100 hover:text-secondary-900'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="absolute bottom-4 left-4 right-4">
          <div className="bg-secondary-50 rounded-lg p-3">
            <h4 className="text-sm font-medium text-secondary-900 mb-1">System Status</h4>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-success rounded-full"></div>
              <span className="text-xs text-secondary-600">All systems operational</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </>
  );
};

export default Navigation;
