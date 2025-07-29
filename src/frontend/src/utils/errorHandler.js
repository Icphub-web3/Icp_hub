/**
 * @fileoverview Error Handling Module
 * 
 * Centralized error handling for the ICPHub application.
 * Provides:
 * - Error classification and formatting
 * - User-friendly error messages
 * - Error logging and reporting
 * - Recovery strategies
 * 
 * @author ICPHub Team
 * @version 1.0.0
 */

import toast from 'react-hot-toast';

/**
 * Error Types and Classifications
 */
export const ErrorTypes = {
  AUTHENTICATION: 'AUTHENTICATION',
  NETWORK: 'NETWORK',
  VALIDATION: 'VALIDATION',
  PERMISSION: 'PERMISSION',
  NOT_FOUND: 'NOT_FOUND',
  SERVER: 'SERVER',
  CLIENT: 'CLIENT',
  UNKNOWN: 'UNKNOWN',
};

/**
 * Error Severity Levels
 */
export const ErrorSeverity = {
  LOW: 'LOW',           // Non-critical errors that don't affect functionality
  MEDIUM: 'MEDIUM',     // Errors that limit functionality but aren't blocking
  HIGH: 'HIGH',         // Critical errors that block major functionality
  CRITICAL: 'CRITICAL', // System-breaking errors
};

/**
 * Application-specific error class
 */
export class ICPHubError extends Error {
  constructor(message, type = ErrorTypes.UNKNOWN, severity = ErrorSeverity.MEDIUM, details = {}) {
    super(message);
    this.name = 'ICPHubError';
    this.type = type;
    this.severity = severity;
    this.details = details;
    this.timestamp = new Date().toISOString();
  }
}

/**
 * Error message mappings for user-friendly display
 */
const ErrorMessages = {
  // Authentication Errors
  AUTH_FAILED: 'Authentication failed. Please try logging in again.',
  AUTH_EXPIRED: 'Your session has expired. Please log in again.',
  AUTH_CANCELLED: 'Authentication was cancelled.',
  AUTH_INVALID: 'Invalid authentication credentials.',

  // Network Errors
  NETWORK_OFFLINE: 'You appear to be offline. Please check your internet connection.',
  NETWORK_TIMEOUT: 'Request timed out. Please try again.',
  NETWORK_UNAVAILABLE: 'Service is temporarily unavailable. Please try again later.',

  // Validation Errors
  INVALID_INPUT: 'Please check your input and try again.',
  REQUIRED_FIELD: 'This field is required.',
  INVALID_FORMAT: 'Please enter data in the correct format.',

  // Permission Errors
  ACCESS_DENIED: 'You do not have permission to perform this action.',
  INSUFFICIENT_PRIVILEGES: 'Insufficient privileges for this operation.',

  // Not Found Errors
  RESOURCE_NOT_FOUND: 'The requested resource was not found.',
  PAGE_NOT_FOUND: 'The page you are looking for does not exist.',

  // Server Errors
  SERVER_ERROR: 'An internal server error occurred. Please try again later.',
  SERVICE_UNAVAILABLE: 'The service is currently unavailable.',

  // Client Errors
  BROWSER_NOT_SUPPORTED: 'Your browser is not supported. Please use a modern browser.',
  JAVASCRIPT_REQUIRED: 'JavaScript is required for this application to work.',

  // Default
  UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.',
};

/**
 * Get user-friendly error message
 * 
 * @param {Error|ICPHubError} error - The error object
 * @returns {string} User-friendly error message
 */
export const getErrorMessage = (error) => {
  // Handle ICPHubError instances
  if (error instanceof ICPHubError) {
    return error.message;
  }

  // Handle Internet Identity specific errors
  if (error?.message?.includes('UserInterrupt')) {
    return ErrorMessages.AUTH_CANCELLED;
  }

  // Handle network errors
  if (error?.name === 'TypeError' && error?.message?.includes('fetch')) {
    return ErrorMessages.NETWORK_UNAVAILABLE;
  }

  // Handle timeout errors
  if (error?.message?.includes('timeout')) {
    return ErrorMessages.NETWORK_TIMEOUT;
  }

  // Handle authentication errors
  if (error?.message?.includes('authentication') || error?.message?.includes('login')) {
    return ErrorMessages.AUTH_FAILED;
  }

  // Handle permission errors
  if (error?.message?.includes('permission') || error?.message?.includes('unauthorized')) {
    return ErrorMessages.ACCESS_DENIED;
  }

  // Handle not found errors
  if (error?.message?.includes('not found') || error?.status === 404) {
    return ErrorMessages.RESOURCE_NOT_FOUND;
  }

  // Handle server errors
  if (error?.status >= 500) {
    return ErrorMessages.SERVER_ERROR;
  }

  // Return original message or default
  return error?.message || ErrorMessages.UNKNOWN_ERROR;
};

/**
 * Classify error type based on error object
 * 
 * @param {Error} error - The error object
 * @returns {string} Error type from ErrorTypes
 */
export const classifyError = (error) => {
  if (error instanceof ICPHubError) {
    return error.type;
  }

  const message = error?.message?.toLowerCase() || '';

  if (message.includes('auth') || message.includes('login') || message.includes('identity')) {
    return ErrorTypes.AUTHENTICATION;
  }

  if (message.includes('network') || message.includes('fetch') || message.includes('timeout')) {
    return ErrorTypes.NETWORK;
  }

  if (message.includes('validation') || message.includes('invalid') || message.includes('required')) {
    return ErrorTypes.VALIDATION;
  }

  if (message.includes('permission') || message.includes('unauthorized') || message.includes('forbidden')) {
    return ErrorTypes.PERMISSION;
  }

  if (message.includes('not found') || error?.status === 404) {
    return ErrorTypes.NOT_FOUND;
  }

  if (error?.status >= 500) {
    return ErrorTypes.SERVER;
  }

  if (error?.status >= 400 && error?.status < 500) {
    return ErrorTypes.CLIENT;
  }

  return ErrorTypes.UNKNOWN;
};

/**
 * Determine error severity
 * 
 * @param {Error|ICPHubError} error - The error object
 * @returns {string} Error severity from ErrorSeverity
 */
export const getErrorSeverity = (error) => {
  if (error instanceof ICPHubError) {
    return error.severity;
  }

  const type = classifyError(error);

  switch (type) {
    case ErrorTypes.AUTHENTICATION:
      return ErrorSeverity.HIGH;
    case ErrorTypes.NETWORK:
      return ErrorSeverity.MEDIUM;
    case ErrorTypes.VALIDATION:
      return ErrorSeverity.LOW;
    case ErrorTypes.PERMISSION:
      return ErrorSeverity.HIGH;
    case ErrorTypes.NOT_FOUND:
      return ErrorSeverity.MEDIUM;
    case ErrorTypes.SERVER:
      return ErrorSeverity.CRITICAL;
    case ErrorTypes.CLIENT:
      return ErrorSeverity.MEDIUM;
    default:
      return ErrorSeverity.MEDIUM;
  }
};

/**
 * Log error for debugging and monitoring
 * 
 * @param {Error|ICPHubError} error - The error object
 * @param {object} context - Additional context about where the error occurred
 */
export const logError = (error, context = {}) => {
  const errorInfo = {
    message: error.message,
    type: classifyError(error),
    severity: getErrorSeverity(error),
    stack: error.stack,
    timestamp: new Date().toISOString(),
    context,
    userAgent: navigator.userAgent,
    url: window.location.href,
  };

  // Log to console in development
  if (import.meta.env.DEV) {
    console.group(`🚨 ${errorInfo.severity} Error: ${errorInfo.type}`);
    console.error('Message:', errorInfo.message);
    console.error('Context:', errorInfo.context);
    console.error('Stack:', errorInfo.stack);
    console.groupEnd();
  }

  // In production, you would send this to your error monitoring service
  // Example: Sentry, LogRocket, Bugsnag, etc.
  if (import.meta.env.PROD) {
    // sendToErrorMonitoring(errorInfo);
  }
};

/**
 * Display error to user with appropriate UI feedback
 * 
 * @param {Error|ICPHubError} error - The error object
 * @param {object} options - Display options
 */
export const displayError = (error, options = {}) => {
  const {
    showToast = true,
    duration = 5000,
    position = 'top-right',
  } = options;

  const message = getErrorMessage(error);
  const severity = getErrorSeverity(error);

  if (showToast) {
    const toastOptions = {
      duration,
      position,
      style: {
        background: severity === ErrorSeverity.CRITICAL ? '#dc2626' : 
                   severity === ErrorSeverity.HIGH ? '#ea580c' : 
                   severity === ErrorSeverity.MEDIUM ? '#d97706' : '#65a30d',
        color: 'white',
      },
    };

    toast.error(message, toastOptions);
  }
};

/**
 * Handle error with logging and user feedback
 * 
 * @param {Error|ICPHubError} error - The error object
 * @param {object} context - Additional context
 * @param {object} displayOptions - Display options
 */
export const handleError = (error, context = {}, displayOptions = {}) => {
  // Log the error
  logError(error, context);

  // Display to user
  displayError(error, displayOptions);
};

/**
 * Create a higher-order function for error boundary
 * 
 * @param {Function} fn - Function to wrap with error handling
 * @param {object} context - Context information
 * @returns {Function} Wrapped function with error handling
 */
export const withErrorHandling = (fn, context = {}) => {
  return async (...args) => {
    try {
      return await fn(...args);
    } catch (error) {
      handleError(error, { ...context, args });
      throw error; // Re-throw for component error boundaries
    }
  };
};

/**
 * Retry function with exponential backoff
 * 
 * @param {Function} fn - Function to retry
 * @param {number} maxRetries - Maximum number of retries
 * @param {number} baseDelay - Base delay in milliseconds
 * @returns {Promise} Result of the function or throws final error
 */
export const retryWithBackoff = async (fn, maxRetries = 3, baseDelay = 1000) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxRetries) {
        throw error;
      }

      const delay = baseDelay * Math.pow(2, attempt - 1);
      console.log(`Attempt ${attempt} failed, retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

export default {
  ICPHubError,
  ErrorTypes,
  ErrorSeverity,
  getErrorMessage,
  classifyError,
  getErrorSeverity,
  logError,
  displayError,
  handleError,
  withErrorHandling,
  retryWithBackoff,
};
