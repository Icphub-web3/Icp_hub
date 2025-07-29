/**
 * @fileoverview Application Entry Point
 * 
 * This is the main entry point for the ICPHub React application.
 * It handles:
 * - SES lockdown configuration for security
 * - Configuration validation
 * - Application initialization and bootstrapping
 * - Root rendering with React StrictMode
 * 
 * @author ICPHub Team
 * @version 1.0.0
 */

// Import SES lockdown configuration first to avoid deprecated warnings
import './lockdown-config.js';

// Core React imports
import ReactDOM from 'react-dom/client';
import { StrictMode } from 'react';

// Application imports
import App from './App';
import { validateConfig } from './config/index.js';
import { handleError } from './utils/errorHandler.js';

// Global styles
import './index.css';

/**
 * Initialize the application
 * 
 * Performs necessary setup before rendering the React application:
 * - Validates configuration
 * - Sets up error boundaries
 * - Initializes global services
 */
const initializeApp = async () => {
  try {
    // Validate application configuration
    validateConfig();
    
    // Log successful initialization
    console.log('🚀 ICPHub application initialized successfully');
    console.log(`📱 Environment: ${import.meta.env.MODE}`);
    console.log(`🌐 Network: ${import.meta.env.VITE_DFX_NETWORK || 'local'}`);
    
  } catch (error) {
    handleError(error, { context: 'app-initialization' });
    throw error; // Re-throw to prevent app from starting with invalid config
  }
};

/**
 * Render the application
 * 
 * Creates the React root and renders the application with StrictMode enabled.
 */
const renderApp = () => {
  const rootElement = document.getElementById('root');
  
  if (!rootElement) {
    throw new Error('Root element not found. Make sure index.html contains a div with id="root"');
  }
  
  const root = ReactDOM.createRoot(rootElement);
  
  root.render(
    <StrictMode>
      <App />
    </StrictMode>
  );
};

/**
 * Application bootstrap
 * 
 * Main function that initializes and starts the application.
 */
const bootstrap = async () => {
  try {
    await initializeApp();
    renderApp();
  } catch (error) {
    console.error('❌ Failed to start ICPHub application:', error);
    
    // Display error message to user if React fails to render
    const rootElement = document.getElementById('root');
    if (rootElement) {
      rootElement.innerHTML = `
        <div style="
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100vh;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          text-align: center;
          padding: 2rem;
        ">
          <h1 style="font-size: 2rem; margin-bottom: 1rem;">⚠️ Application Error</h1>
          <p style="font-size: 1.1rem; margin-bottom: 2rem; max-width: 600px;">
            ICPHub failed to initialize. Please check your configuration and try again.
          </p>
          <details style="
            background: rgba(255, 255, 255, 0.1);
            padding: 1rem;
            border-radius: 8px;
            text-align: left;
            max-width: 800px;
            width: 100%;
          ">
            <summary style="cursor: pointer; font-weight: bold; margin-bottom: 1rem;">
              Technical Details
            </summary>
            <pre style="
              font-size: 0.9rem;
              overflow: auto;
              white-space: pre-wrap;
              word-break: break-word;
            ">${error.message}</pre>
          </details>
          <button 
            onclick="window.location.reload()" 
            style="
              margin-top: 2rem;
              padding: 0.75rem 2rem;
              background: #4f46e5;
              color: white;
              border: none;
              border-radius: 6px;
              font-size: 1rem;
              cursor: pointer;
              transition: background 0.2s;
            "
            onmouseover="this.style.background='#4338ca'"
            onmouseout="this.style.background='#4f46e5'"
          >
            🔄 Reload Application
          </button>
        </div>
      `;
    }
  }
};

// Start the application
bootstrap();
