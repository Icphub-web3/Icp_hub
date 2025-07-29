/**
 * @fileoverview Main application component for ICPHub - A collaborative Web3 development platform
 * 
 * This file contains the root App component that orchestrates the entire application.
 * It handles:
 * - Authentication via Internet Identity
 * - Main navigation between different features
 * - Global toast notifications
 * - Route protection for authenticated users
 * 
 * @author ICPHub Team
 * @version 1.0.0
 */

import React, { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navigation from './components/Navigation';
import Dashboard from './components/Dashboard';
import RepositoryManager from './components/RepositoryManager';
import ProjectManager from './components/ProjectManager';
import CodeEditor from './components/CodeEditor';
import BuildTest from './components/BuildTest';

/**
 * MainApp Component - The core application interface after authentication
 * 
 * Manages the main navigation state and renders different views based on user selection.
 * This component is only rendered for authenticated users.
 * 
 * @component
 * @returns {JSX.Element} The main application interface
 */
function MainApp() {
  // Current active view in the application (dashboard, repositories, editor, etc.)
  const [currentView, setCurrentView] = useState('dashboard');

  /**
   * Renders the appropriate component based on the current view selection
   * 
   * @returns {JSX.Element} The component corresponding to the current view
   */
  const renderView = () => {
    switch(currentView) {
      case 'repositories':
        return <RepositoryManager />;
      case 'projects':
        return <ProjectManager />;
      case 'editor':
        return <CodeEditor />;
      case 'builds':
        return <BuildTest />;
      case 'dashboard':
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-secondary-50">
      {/* Main navigation bar with sidebar */}
      <Navigation currentView={currentView} onViewChange={setCurrentView} />
      
      {/* Main content area - offset for fixed navigation */}
      <main className="pt-16 pl-64">
        {renderView()}
      </main>
    </div>
  );
}

/**
 * App Component - Root application component with authentication and global providers
 * 
 * This is the entry point of the application that provides:
 * - Authentication context for Internet Identity integration
 * - Protected routes that require authentication
 * - Global toast notification system
 * - Error boundaries and loading states
 * 
 * @component
 * @returns {JSX.Element} The complete application with all providers
 */
export default function App() {
  return (
    <AuthProvider>
      {/* Ensure only authenticated users can access the main app */}
      <ProtectedRoute>
        <MainApp />
      </ProtectedRoute>
      
      {/* Global toast notification system */}
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
        }}
      />
    </AuthProvider>
  );
}
