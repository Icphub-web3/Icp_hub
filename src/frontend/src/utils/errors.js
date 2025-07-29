// Error types for better error handling
export const ERROR_TYPES = {
  AUTH_INIT_FAILED: 'AUTH_INIT_FAILED',
  LOGIN_FAILED: 'LOGIN_FAILED',
  LOGOUT_FAILED: 'LOGOUT_FAILED',
  NETWORK_ERROR: 'NETWORK_ERROR',
  CANISTER_ERROR: 'CANISTER_ERROR',
  IDENTITY_ERROR: 'IDENTITY_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
};

// Error messages for user-friendly display
export const ERROR_MESSAGES = {
  [ERROR_TYPES.AUTH_INIT_FAILED]:
    'Failed to initialize authentication. Please refresh the page and try again.',
  [ERROR_TYPES.LOGIN_FAILED]:
    'Login failed. Please check your Internet Identity and try again.',
  [ERROR_TYPES.LOGOUT_FAILED]:
    'Logout failed. Please try again or refresh the page.',
  [ERROR_TYPES.NETWORK_ERROR]:
    'Network connection error. Please check your internet connection.',
  [ERROR_TYPES.CANISTER_ERROR]:
    'Backend service is temporarily unavailable. Please try again later.',
  [ERROR_TYPES.IDENTITY_ERROR]:
    'Identity verification failed. Please try logging in again.',
  [ERROR_TYPES.UNKNOWN_ERROR]:
    'An unexpected error occurred. Please try again.',
};

// Error classification function
export const classifyError = error => {
  if (!error) return ERROR_TYPES.UNKNOWN_ERROR;

  const errorMessage = error.message || error.toString().toLowerCase();

  if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
    return ERROR_TYPES.NETWORK_ERROR;
  }

  if (errorMessage.includes('canister') || errorMessage.includes('replica')) {
    return ERROR_TYPES.CANISTER_ERROR;
  }

  if (errorMessage.includes('identity') || errorMessage.includes('principal')) {
    return ERROR_TYPES.IDENTITY_ERROR;
  }

  if (errorMessage.includes('auth') || errorMessage.includes('login')) {
    return ERROR_TYPES.LOGIN_FAILED;
  }

  return ERROR_TYPES.UNKNOWN_ERROR;
};

// Get user-friendly error message
export const getErrorMessage = error => {
  const errorType = classifyError(error);
  return ERROR_MESSAGES[errorType] || ERROR_MESSAGES[ERROR_TYPES.UNKNOWN_ERROR];
};

// Custom error classes
export class AuthError extends Error {
  constructor(message, type = ERROR_TYPES.UNKNOWN_ERROR, originalError = null) {
    super(message);
    this.name = 'AuthError';
    this.type = type;
    this.originalError = originalError;
  }
}

export class NetworkError extends Error {
  constructor(message, originalError = null) {
    super(message);
    this.name = 'NetworkError';
    this.type = ERROR_TYPES.NETWORK_ERROR;
    this.originalError = originalError;
  }
}

export class CanisterError extends Error {
  constructor(message, originalError = null) {
    super(message);
    this.name = 'CanisterError';
    this.type = ERROR_TYPES.CANISTER_ERROR;
    this.originalError = originalError;
  }
}

// Retry utility function
export const withRetry = async (fn, maxRetries = 3, delay = 1000) => {
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (attempt === maxRetries) {
        throw error;
      }

      // Exponential backoff
      const waitTime = delay * Math.pow(2, attempt - 1);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }

  throw lastError;
};
