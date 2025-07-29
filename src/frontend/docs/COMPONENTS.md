# OPENKEY Frontend Components Documentation

## Overview

This document provides comprehensive documentation for all React components in the OPENKEY frontend application. The application is built using modern React patterns with functional components, hooks, and TypeScript support.

## Architecture

### Component Structure

```
src/
├── components/
│   ├── ui/                 # Reusable UI components
│   │   ├── Button.jsx
│   │   ├── Card.jsx
│   │   └── Notification.jsx
│   ├── Dashboard.jsx       # Main dashboard
│   ├── ProjectManager.jsx  # Project CRUD operations
│   ├── Navigation.jsx      # App navigation
│   └── __tests__/         # Component tests
├── hooks/                 # Custom React hooks
├── utils/                 # Utility functions
└── contexts/             # React contexts
```

## Core Components

### Dashboard

**Location:** `src/components/Dashboard.jsx`

The main dashboard component that provides an overview of user activity, statistics, and quick actions.

#### Features
- Real-time statistics display
- User profile information
- Quick action buttons
- Error handling with retry functionality
- Loading states with skeleton loaders

#### Props
- None (uses auth context)

#### Usage
```jsx
import Dashboard from './components/Dashboard';

<Dashboard />
```

#### Key Features
- **Statistics Cards**: Display active projects, commits, collaborators, and lines of code
- **Real-time Updates**: Uses polling to fetch fresh data
- **Error Boundaries**: Graceful error handling with retry mechanisms
- **Responsive Design**: Adapts to different screen sizes

### ProjectManager

**Location:** `src/components/ProjectManager.jsx`

A comprehensive project management interface with full CRUD operations for Web3 development projects.

#### Features
- Create, read, update, delete projects
- Multi-blockchain support (ICP, Ethereum, Polygon, BSC, Avalanche)
- Project status management
- Search and filtering
- Real-time notifications

#### Props
- None (self-contained component)

#### Usage
```jsx
import ProjectManager from './components/ProjectManager';

<ProjectManager />
```

#### Project Schema
```javascript
{
  id: string,
  name: string,
  description: string,
  blockchain: 'ICP' | 'Ethereum' | 'Polygon' | 'BSC' | 'Avalanche',
  status: 'planning' | 'development' | 'active' | 'paused',
  createdAt: string,
  contributors: number,
  commits: number
}
```

#### Key Methods
- `handleSubmit()`: Creates or updates projects
- `handleEdit()`: Enters edit mode for existing projects
- `handleDelete()`: Removes projects with confirmation
- `getStatusColor()`: Returns appropriate styling for status badges
- `getBlockchainColor()`: Returns appropriate styling for blockchain badges

### Navigation

**Location:** `src/components/Navigation.jsx`

The main navigation component providing sidebar navigation and header with search functionality.

#### Features
- Collapsible sidebar
- Search functionality
- Notification system
- User profile integration
- Mobile-responsive design

#### Props
- `currentView`: Current active view identifier
- `onViewChange`: Callback function when navigation changes

#### Usage
```jsx
import Navigation from './components/Navigation';

<Navigation 
  currentView={currentView} 
  onViewChange={setCurrentView} 
/>
```

## UI Components

### Button

**Location:** `src/components/ui/Button.jsx`

A flexible, reusable button component with multiple variants and states.

#### Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | string | 'primary' | Button style variant |
| `size` | string | 'md' | Button size |
| `loading` | boolean | false | Shows loading spinner |
| `disabled` | boolean | false | Disables the button |
| `onClick` | function | - | Click handler |
| `type` | string | 'button' | HTML button type |

#### Variants
- `primary`: Blue background, white text
- `secondary`: Gray background, dark text
- `success`: Green background, white text
- `danger`: Red background, white text
- `warning`: Yellow background, white text
- `ghost`: Transparent background, hover effects
- `outline`: Border only, transparent background

#### Sizes
- `sm`: Small padding and text
- `md`: Medium padding and text (default)
- `lg`: Large padding and text
- `xl`: Extra large padding and text

#### Usage
```jsx
import Button from './components/ui/Button';

<Button 
  variant="primary" 
  size="lg" 
  loading={isLoading}
  onClick={handleClick}
>
  Submit
</Button>
```

### Card

**Location:** `src/components/ui/Card.jsx`

A container component for consistent content layout with optional header, title, and content sections.

#### Sub-components
- `Card.Header`: Optional header section
- `Card.Title`: Title component with consistent styling
- `Card.Content`: Main content area

#### Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `className` | string | '' | Additional CSS classes |
| `padding` | string | 'p-6' | Padding classes |
| `shadow` | string | 'shadow-sm' | Shadow classes |
| `rounded` | string | 'rounded-lg' | Border radius classes |

#### Usage
```jsx
import Card from './components/ui/Card';

<Card>
  <Card.Header>
    <Card.Title>Project Details</Card.Title>
  </Card.Header>
  <Card.Content>
    <p>Project content goes here...</p>
  </Card.Content>
</Card>
```

### Notification

**Location:** `src/components/ui/Notification.jsx`

A notification component for displaying success, error, warning, and info messages.

#### Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `type` | string | 'info' | Notification type |
| `title` | string | - | Notification title |
| `message` | string | - | Notification message |
| `onDismiss` | function | - | Dismiss callback |

#### Types
- `success`: Green styling with checkmark icon
- `error`: Red styling with X icon
- `warning`: Yellow styling with alert icon
- `info`: Blue styling with info icon

#### Usage
```jsx
import Notification from './components/ui/Notification';

<Notification
  type="success"
  title="Success!"
  message="Project created successfully"
  onDismiss={() => setNotification(null)}
/>
```

## Custom Hooks

### useAuth

**Location:** `src/hooks/useAuth.js`

Manages authentication state and Internet Identity integration.

#### Returns
```javascript
{
  user: object | null,
  isLoading: boolean,
  logout: function,
  login: function
}
```

### useNotification

**Location:** `src/hooks/useNotification.js`

Provides a simple API for showing toast notifications.

#### Usage
```javascript
import useNotification from '../hooks/useNotification';

const showNotification = useNotification();

showNotification({
  type: 'success',
  title: 'Success',
  message: 'Operation completed',
  duration: 4000
});
```

## Performance Optimizations

### Lazy Loading

**Location:** `src/utils/lazy.js`

Provides utilities for lazy loading components to improve initial page load performance.

#### Available Functions
- `createLazyComponent()`: Create a lazy-loaded component
- `preloadComponent()`: Preload a component for better UX
- `withLazyLoading()`: HOC with error boundaries and retry logic

#### Pre-configured Lazy Components
- `LazyProjectManager`
- `LazyCodeEditor`
- `LazyBuildTest`

#### Usage
```javascript
import { LazyProjectManager } from '../utils/lazy';

// Component will be loaded only when needed
<LazyProjectManager />
```

## Testing

### Test Structure

Tests are organized alongside components in `__tests__` directories:

```
components/
├── Dashboard.jsx
├── ProjectManager.jsx
├── __tests__/
│   ├── Dashboard.test.jsx
│   └── ProjectManager.test.jsx
└── ui/
    ├── Button.jsx
    └── __tests__/
        └── Button.test.jsx
```

### Testing Libraries
- **Vitest**: Test runner and framework
- **React Testing Library**: DOM testing utilities
- **@testing-library/jest-dom**: Custom Jest matchers

### Example Test
```javascript
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Button from '../Button';

describe('Button', () => {
  it('renders button with children', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Clickable</Button>);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

## Styling Guidelines

### Tailwind CSS

The application uses Tailwind CSS for styling with a focus on:
- Consistent spacing and typography
- Responsive design patterns
- Dark mode support (future enhancement)
- Custom color palette for brand consistency

### Color Scheme
- **Primary**: Blue tones for main actions
- **Secondary**: Gray tones for secondary elements
- **Success**: Green for positive feedback
- **Error**: Red for error states
- **Warning**: Yellow for warnings

### Responsive Breakpoints
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px

## Best Practices

### Component Design
1. **Single Responsibility**: Each component should have one clear purpose
2. **Composition over Inheritance**: Use composition patterns for flexibility
3. **Props Interface**: Clear, documented prop interfaces
4. **Error Boundaries**: Implement error handling at appropriate levels

### Performance
1. **Lazy Loading**: Use lazy loading for non-critical components
2. **Memoization**: Use React.memo and useMemo for expensive operations
3. **Code Splitting**: Split large components and features
4. **Asset Optimization**: Optimize images and static assets

### Accessibility
1. **Semantic HTML**: Use appropriate HTML elements
2. **ARIA Labels**: Provide accessibility labels where needed
3. **Keyboard Navigation**: Ensure keyboard accessibility
4. **Color Contrast**: Maintain sufficient color contrast ratios

### State Management
1. **Local State**: Use useState for component-local state
2. **Context**: Use React Context for shared state
3. **Custom Hooks**: Extract reusable stateful logic
4. **Zustand**: Use Zustand for complex global state (future enhancement)

## Future Enhancements

### Planned Features
- [ ] Dark mode support
- [ ] Advanced search and filtering
- [ ] Real-time collaboration features
- [ ] WebSocket integration for live updates
- [ ] Advanced analytics dashboard
- [ ] Mobile app support
- [ ] Offline functionality with service workers

### Technical Improvements
- [ ] TypeScript migration
- [ ] PWA support
- [ ] Enhanced testing coverage
- [ ] Performance monitoring
- [ ] Internationalization (i18n)
- [ ] Advanced error tracking

## Contributing

When adding new components:

1. Follow the established component structure
2. Add comprehensive tests
3. Update this documentation
4. Ensure accessibility compliance
5. Follow the established naming conventions
6. Add TypeScript types (when migrating)

## Support

For component-specific questions or issues:
1. Check existing tests for usage examples
2. Review component PropTypes/TypeScript interfaces
3. Consult the main README for setup instructions
4. Submit issues with detailed reproduction steps
