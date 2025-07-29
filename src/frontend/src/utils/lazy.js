import React, { lazy, Suspense } from 'react';
import LoadingSpinner from '../components/LoadingSpinner';

/**
 * Create a lazy-loaded component with a loading fallback
 * @param {Function} importFunc - Dynamic import function
 * @param {React.Component} fallback - Loading component to show while loading
 * @returns {React.Component} Lazy component wrapped with Suspense
 */
export const createLazyComponent = (importFunc, fallback = <LoadingSpinner />) => {
  const LazyComponent = lazy(importFunc);
  
  return (props) => (
    <Suspense fallback={fallback}>
      <LazyComponent {...props} />
    </Suspense>
  );
};

/**
 * Preload a lazy component to improve perceived performance
 * @param {Function} importFunc - Dynamic import function
 */
export const preloadComponent = (importFunc) => {
  // Immediately start loading the component
  importFunc().catch(() => {
    // Ignore errors, component will be loaded again when needed
  });
};

/**
 * Higher-order component for lazy loading with error boundaries
 * @param {Function} importFunc - Dynamic import function
 * @param {Object} options - Configuration options
 * @returns {React.Component} Enhanced lazy component
 */
export const withLazyLoading = (importFunc, options = {}) => {
  const {
    fallback = <LoadingSpinner />,
    errorFallback = <div>Error loading component</div>,
    retryCount = 3,
    retryDelay = 1000
  } = options;

  const LazyComponent = lazy(() => 
    importFunc().catch(async (error) => {
      // Retry logic for failed imports
      for (let i = 0; i < retryCount; i++) {
        try {
          await new Promise(resolve => setTimeout(resolve, retryDelay));
          return await importFunc();
        } catch (retryError) {
          if (i === retryCount - 1) throw retryError;
        }
      }
      throw error;
    })
  );

  class ErrorBoundary extends React.Component {
    constructor(props) {
      super(props);
      this.state = { hasError: false };
    }

    static getDerivedStateFromError(error) {
      return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
      console.error('Lazy component error:', error, errorInfo);
    }

    render() {
      if (this.state.hasError) {
        return errorFallback;
      }

      return this.props.children;
    }
  }

  return (props) => (
    <ErrorBoundary>
      <Suspense fallback={fallback}>
        <LazyComponent {...props} />
      </Suspense>
    </ErrorBoundary>
  );
};

// Commonly used lazy components
export const LazyProjectManager = createLazyComponent(
  () => import('../components/ProjectManager')
);

export const LazyCodeEditor = createLazyComponent(
  () => import('../components/CodeEditor')
);

export const LazyBuildTest = createLazyComponent(
  () => import('../components/BuildTest')
);

export default {
  createLazyComponent,
  preloadComponent,
  withLazyLoading,
  LazyProjectManager,
  LazyCodeEditor,
  LazyBuildTest
};
