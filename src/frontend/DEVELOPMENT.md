# ICPHub Development Documentation

## 📋 Table of Contents
- [Architecture Overview](#architecture-overview)
- [File Structure](#file-structure)
- [Core Components](#core-components)
- [State Management](#state-management)
- [Authentication Flow](#authentication-flow)
- [Development Workflow](#development-workflow)
- [API Reference](#api-reference)
- [Testing Guidelines](#testing-guidelines)
- [Deployment](#deployment)

## 🏗 Architecture Overview

ICPHub follows a modern React architecture with the following key principles:

### **Component Architecture**
```
┌─────────────────────────────────────────┐
│                App.jsx                  │ ← Root component with providers
├─────────────────────────────────────────┤
│           AuthProvider                  │ ← Authentication context
├─────────────────────────────────────────┤
│          ProtectedRoute                 │ ← Route protection
├─────────────────────────────────────────┤
│            MainApp                      │ ← Main application shell
│  ┌───────────────┬─────────────────────┐│
│  │  Navigation   │   Dynamic Content   ││ ← Navigation + content views
│  │               │   - Dashboard       ││
│  │               │   - Repositories    ││
│  │               │   - CodeEditor      ││
│  │               │   - BuildTest       ││
│  └───────────────┴─────────────────────┘│
└─────────────────────────────────────────┘
```

### **Data Flow**
```
Internet Identity ←→ AuthService ←→ AuthContext ←→ React Components
                                                         ↓
ICP Canisters    ←→ HttpAgent   ←→ Zustand Stores ←→ UI Components
```

## 📁 File Structure

```
src/
├── components/              # Reusable UI components
│   ├── Dashboard.jsx       # Main dashboard view
│   ├── Navigation.jsx      # App navigation sidebar
│   ├── CodeEditor.jsx      # Monaco editor integration
│   ├── RepositoryManager.jsx # Git repository management
│   ├── BuildTest.jsx       # Build and test interface
│   ├── Login.jsx           # Authentication component
│   └── ProtectedRoute.jsx  # Route protection wrapper
│
├── contexts/               # React contexts
│   └── AuthContext.jsx     # Authentication state management
│
├── services/               # External service integrations
│   └── auth.js            # Internet Identity service
│
├── store/                  # Zustand state stores
│   └── index.js           # All application stores
│
├── hooks/                  # Custom React hooks
│   ├── useAuth.js         # Authentication hook
│   ├── useRepo.js         # Repository operations
│   └── useICPHub.js       # Main application hook
│
├── utils/                  # Utility functions
│   └── errors.js          # Error handling utilities
│
├── pages/                  # Page components (if using routing)
│
├── App.jsx                # Root application component
├── main.jsx               # Application entry point
├── index.css              # Global styles
└── lockdown-config.js     # SES security configuration
```

## 🧩 Core Components

### **App.jsx**
- **Purpose**: Root component that provides global context and routing
- **Key Features**:
  - Authentication provider wrapper
  - Protected route implementation
  - Global toast notification system
  - Main navigation state management

### **AuthContext.jsx**
- **Purpose**: Manages user authentication state across the application
- **Key Features**:
  - Internet Identity integration
  - User session management
  - Authentication error handling
  - Principal and identity storage

### **Navigation.jsx**
- **Purpose**: Main application navigation and header
- **Key Features**:
  - Collapsible sidebar navigation
  - Global search functionality
  - Real-time notifications
  - User profile and logout

### **CodeEditor.jsx**
- **Purpose**: Integrated development environment with Monaco Editor
- **Key Features**:
  - File tree explorer
  - Multi-language syntax highlighting
  - Tab management for multiple files
  - Real-time collaboration features
  - Customizable editor settings

### **Dashboard.jsx**
- **Purpose**: Main landing page with user overview and quick actions
- **Key Features**:
  - User profile display
  - Project statistics
  - Quick action buttons
  - System status indicators

## 🗄 State Management

ICPHub uses **Zustand** for state management with multiple specialized stores:

### **useRepoStore**
```javascript
// Repository management
const { 
  repositories,      // Array of user repositories
  currentRepo,       // Currently selected repository
  setCurrentRepo,    // Set active repository
  addRepository,     // Add new repository
  updateRepository,  // Update repository data
  deleteRepository   // Remove repository
} = useRepoStore();
```

### **useFileStore**
```javascript
// File management and editor state
const {
  files,            // File content cache
  openFiles,        // Currently open editor tabs
  activeFile,       // Currently active file
  openFile,         // Open file in editor
  closeFile,        // Close editor tab
  updateFileContent // Update file content
} = useFileStore();
```

### **useBuildStore**
```javascript
// Build and test system
const {
  builds,           // Build history
  tests,            // Test results
  isBuilding,       // Build in progress
  isTesting,        // Test in progress
  addBuild,         // Add build result
  addTest           // Add test result
} = useBuildStore();
```

### **useCollabStore**
```javascript
// Real-time collaboration
const {
  activeUsers,      // Currently active collaborators
  comments,         // Code comments
  notifications,    // Real-time notifications
  addComment,       // Add code comment
  addNotification   // Add notification
} = useCollabStore();
```

## 🔐 Authentication Flow

### **1. Initialization**
```javascript
// App startup -> AuthContext useEffect
AuthService.init() → Check existing session → Set user state
```

### **2. Login Process**
```javascript
// User clicks login -> AuthContext.login()
AuthService.login() → Internet Identity popup → Success callback → Update state
```

### **3. Authenticated Requests**
```javascript
// Making canister calls
AuthService.createAgent() → HttpAgent with identity → Actor for canister calls
```

### **4. Logout Process**
```javascript
// User clicks logout -> AuthContext.logout()
AuthService.logout() → Clear session → Reset state
```

## 🛠 Development Workflow

### **1. Local Development Setup**
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run in parallel with dfx (if testing with local canisters)
dfx start --background
dfx deploy
```

### **2. Code Standards**
- **ESLint**: Enforces code quality and consistency
- **Prettier**: Automatic code formatting
- **TypeScript**: Type checking for JavaScript
- **Pre-commit hooks**: Automated checks before commits

### **3. Component Development**
```javascript
/**
 * Component Template with Documentation
 */
import React from 'react';

/**
 * ComponentName - Brief description
 * 
 * Detailed description of what the component does and how it's used.
 * 
 * @param {object} props - Component props
 * @param {string} props.title - Prop description
 * @returns {JSX.Element} Component JSX
 */
const ComponentName = ({ title }) => {
  // Component logic
  
  return (
    <div>
      {/* Component JSX */}
    </div>
  );
};

export default ComponentName;
```

## 📡 API Reference

### **AuthService Methods**
```javascript
// Initialize authentication
await authService.init()

// Login with Internet Identity
await authService.login()

// Logout user
await authService.logout()

// Create authenticated agent
const agent = authService.createAgent()

// Create canister actor
const actor = authService.createActor(canisterId, idlFactory)
```

### **Store Actions**
```javascript
// Repository operations
useRepoStore.getState().setCurrentRepo(repo)
useRepoStore.getState().addRepository(newRepo)

// File operations
useFileStore.getState().openFile(file)
useFileStore.getState().updateFileContent(path, content)

// Build operations
useBuildStore.getState().addBuild(buildResult)
useBuildStore.getState().setBuilding(true)
```

## 🧪 Testing Guidelines

### **Unit Tests**
```javascript
// Test component rendering
import { render, screen } from '@testing-library/react';
import ComponentName from './ComponentName';

test('renders component correctly', () => {
  render(<ComponentName title="Test" />);
  expect(screen.getByText('Test')).toBeInTheDocument();
});
```

### **Integration Tests**
```javascript
// Test authentication flow
import { AuthProvider } from '../contexts/AuthContext';
import { render, fireEvent, waitFor } from '@testing-library/react';

test('login flow works correctly', async () => {
  // Test implementation
});
```

### **E2E Tests**
- Use Cypress for end-to-end testing
- Test complete user workflows
- Verify canister integration

## 🚀 Deployment

### **Frontend Deployment**
```bash
# Build for production
npm run build

# Deploy to IC
dfx deploy frontend
```

### **Environment Configuration**
```bash
# Local development
VITE_DFX_NETWORK=local
VITE_BACKEND_CANISTER_ID=local_canister_id

# Production
VITE_DFX_NETWORK=ic
VITE_BACKEND_CANISTER_ID=production_canister_id
```

## 📝 Contributing Guidelines

### **Code Review Checklist**
- [ ] Code follows established patterns
- [ ] Components are properly documented
- [ ] Tests are included for new features
- [ ] Error handling is implemented
- [ ] Performance considerations addressed
- [ ] Accessibility guidelines followed

### **Commit Message Format**
```
type(scope): description

feat(auth): add Internet Identity integration
fix(editor): resolve syntax highlighting bug
docs(readme): update setup instructions
style(nav): improve responsive design
```

## 🔧 Debugging Tips

### **Common Issues**
1. **SES Warnings**: Related to secure JavaScript execution, usually safe to ignore
2. **Internet Identity Errors**: Check network configuration and canister IDs
3. **Build Failures**: Verify dependencies and environment variables
4. **Performance Issues**: Check for unnecessary re-renders and large state objects

### **Development Tools**
- **React DevTools**: Component tree inspection
- **Zustand DevTools**: State management debugging
- **Chrome DevTools**: Network requests and performance
- **DFX**: Canister management and deployment

---

For more detailed information, refer to the individual component documentation and the main README.md file.
