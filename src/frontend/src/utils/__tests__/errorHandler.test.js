/**
 * @fileoverview Unit Tests for Error Handler Module
 * 
 * Tests for the centralized error handling system including:
 * - Error classification and types
 * - User-friendly error messages
 * - Error logging and reporting
 * - Display and notification handling
 * - Custom error class functionality
 * 
 * @author ICPHub Team
 * @version 1.0.0
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import toast from 'react-hot-toast';
import {
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
  retryWithBackoff
} from '../errorHandler.js';

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
  default: {
    error: vi.fn(),
    success: vi.fn(),
    loading: vi.fn(),
  },
}));

describe('Error Handler Module', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'group').mockImplementation(() => {});
    vi.spyOn(console, 'groupEnd').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  describe('ICPHubError Class', () => {
    it('should create error with default values', () => {
      const error = new ICPHubError('Test error');
      
      expect(error.message).toBe('Test error');
      expect(error.name).toBe('ICPHubError');
      expect(error.type).toBe(ErrorTypes.UNKNOWN);
      expect(error.severity).toBe(ErrorSeverity.MEDIUM);
      expect(error.details).toEqual({});
      expect(error.timestamp).toBeDefined();
    });

    it('should create error with custom values', () => {
      const details = { userId: '123', action: 'login' };
      const error = new ICPHubError(
        'Login failed',
        ErrorTypes.AUTHENTICATION,
        ErrorSeverity.HIGH,
        details
      );
      
      expect(error.message).toBe('Login failed');
      expect(error.type).toBe(ErrorTypes.AUTHENTICATION);
      expect(error.severity).toBe(ErrorSeverity.HIGH);
      expect(error.details).toEqual(details);
    });

    it('should be instance of Error', () => {
      const error = new ICPHubError('Test error');
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(ICPHubError);
    });
  });

  describe('Error Classification', () => {
    it('should classify authentication errors correctly', () => {
      const authError = new Error('Authentication failed');
      expect(classifyError(authError)).toBe(ErrorTypes.AUTHENTICATION);
      
      const loginError = new Error('Login timeout');
      expect(classifyError(loginError)).toBe(ErrorTypes.AUTHENTICATION);
      
      const identityError = new Error('Identity verification failed');
      expect(classifyError(identityError)).toBe(ErrorTypes.AUTHENTICATION);
    });

    it('should classify network errors correctly', () => {
      const networkError = new Error('Network timeout');
      expect(classifyError(networkError)).toBe(ErrorTypes.NETWORK);
      
      const fetchError = new Error('Failed to fetch');
      expect(classifyError(fetchError)).toBe(ErrorTypes.NETWORK);
    });

    it('should classify validation errors correctly', () => {
      const validationError = new Error('Invalid input format');
      expect(classifyError(validationError)).toBe(ErrorTypes.VALIDATION);
      
      const requiredError = new Error('Required field missing');
      expect(classifyError(requiredError)).toBe(ErrorTypes.VALIDATION);
    });

    it('should classify permission errors correctly', () => {
      const permissionError = new Error('Access denied');
      expect(classifyError(permissionError)).toBe(ErrorTypes.PERMISSION);
      
      const unauthorizedError = new Error('Unauthorized request');
      expect(classifyError(unauthorizedError)).toBe(ErrorTypes.PERMISSION);
    });

    it('should classify server errors correctly', () => {
      const serverError = new Error('Internal server error');
      serverError.status = 500;
      expect(classifyError(serverError)).toBe(ErrorTypes.SERVER);
    });

    it('should classify client errors correctly', () => {
      const clientError = new Error('Bad request');
      clientError.status = 400;
      expect(classifyError(clientError)).toBe(ErrorTypes.CLIENT);
    });

    it('should classify not found errors correctly', () => {
      const notFoundError = new Error('Resource not found');
      expect(classifyError(notFoundError)).toBe(ErrorTypes.NOT_FOUND);
      
      const statusNotFoundError = new Error('Not found');
      statusNotFoundError.status = 404;
      expect(classifyError(statusNotFoundError)).toBe(ErrorTypes.NOT_FOUND);
    });

    it('should return UNKNOWN for unclassifiable errors', () => {
      const unknownError = new Error('Something went wrong');
      expect(classifyError(unknownError)).toBe(ErrorTypes.UNKNOWN);
    });

    it('should preserve ICPHubError type classification', () => {
      const icpError = new ICPHubError('Test', ErrorTypes.VALIDATION);
      expect(classifyError(icpError)).toBe(ErrorTypes.VALIDATION);
    });
  });

  describe('Error Severity Assessment', () => {
    it('should assign HIGH severity to authentication errors', () => {
      const authError = new Error('Authentication failed');
      expect(getErrorSeverity(authError)).toBe(ErrorSeverity.HIGH);
    });

    it('should assign MEDIUM severity to network errors', () => {
      const networkError = new Error('Network error');
      expect(getErrorSeverity(networkError)).toBe(ErrorSeverity.MEDIUM);
    });

    it('should assign LOW severity to validation errors', () => {
      const validationError = new Error('Invalid input');
      expect(getErrorSeverity(validationError)).toBe(ErrorSeverity.LOW);
    });

    it('should assign CRITICAL severity to server errors', () => {
      const serverError = new Error('Server error');
      serverError.status = 500;
      expect(getErrorSeverity(serverError)).toBe(ErrorSeverity.CRITICAL);
    });

    it('should preserve ICPHubError severity', () => {
      const icpError = new ICPHubError('Test', ErrorTypes.UNKNOWN, ErrorSeverity.CRITICAL);
      expect(getErrorSeverity(icpError)).toBe(ErrorSeverity.CRITICAL);
    });
  });

  describe('Error Message Generation', () => {
    it('should return user-friendly messages for common errors', () => {
      const authError = new Error('Authentication failed');
      expect(getErrorMessage(authError)).toBe('Authentication failed. Please try logging in again.');
      
      const timeoutError = new Error('Request timeout');
      expect(getErrorMessage(timeoutError)).toBe('Request timed out. Please try again.');
      
      const permissionError = new Error('Permission denied');
      expect(getErrorMessage(permissionError)).toBe('You do not have permission to perform this action.');
    });

    it('should handle Internet Identity specific errors', () => {
      const userInterruptError = new Error('UserInterrupt: User cancelled');
      expect(getErrorMessage(userInterruptError)).toBe('Authentication was cancelled.');
    });

    it('should handle network-specific errors', () => {
      const fetchError = new TypeError('Failed to fetch');
      expect(getErrorMessage(fetchError)).toBe('Service is temporarily unavailable. Please try again later.');
    });

    it('should handle server status errors', () => {
      const serverError = new Error('Internal error');
      serverError.status = 500;
      expect(getErrorMessage(serverError)).toBe('An internal server error occurred. Please try again later.');
      
      const notFoundError = new Error('Not found');
      notFoundError.status = 404;
      expect(getErrorMessage(notFoundError)).toBe('The requested resource was not found.');
    });

    it('should preserve ICPHubError messages', () => {
      const icpError = new ICPHubError('Custom error message');
      expect(getErrorMessage(icpError)).toBe('Custom error message');
    });

    it('should return default message for unknown errors', () => {
      const unknownError = new Error();
      expect(getErrorMessage(unknownError)).toBe('An unexpected error occurred. Please try again.');
    });
  });

  describe('Error Logging', () => {
    it('should log error information in development', () => {
      vi.stubEnv('DEV', true);
      
      const error = new Error('Test error');
      const context = { component: 'TestComponent', action: 'testAction' };
      
      logError(error, context);
      
      expect(console.group).toHaveBeenCalledWith(
        expect.stringContaining('MEDIUM Error: UNKNOWN')
      );
      expect(console.error).toHaveBeenCalledWith('Message:', 'Test error');
      expect(console.error).toHaveBeenCalledWith('Context:', context);
      expect(console.groupEnd).toHaveBeenCalled();
    });

    it('should not log to console in production', () => {
      vi.stubEnv('DEV', false);
      vi.stubEnv('PROD', true);
      
      const error = new Error('Test error');
      logError(error);
      
      expect(console.group).not.toHaveBeenCalled();
      expect(console.error).not.toHaveBeenCalled();
    });

    it('should include comprehensive error information', () => {
      vi.stubEnv('DEV', true);
      
      const error = new Error('Test error');
      error.stack = 'Test stack trace';
      const context = { userId: '123' };
      
      logError(error, context);
      
      expect(console.error).toHaveBeenCalledWith('Stack:', 'Test stack trace');
    });
  });

  describe('Error Display', () => {
    it('should display error with toast notification', () => {
      const error = new Error('Test error');
      
      displayError(error);
      
      expect(toast.error).toHaveBeenCalledWith(
        'An unexpected error occurred. Please try again.',
        expect.objectContaining({
          duration: 5000,
          position: 'top-right',
        })
      );
    });

    it('should use different colors based on severity', () => {
      const criticalError = new ICPHubError('Critical', ErrorTypes.SERVER, ErrorSeverity.CRITICAL);
      const highError = new ICPHubError('High', ErrorTypes.AUTHENTICATION, ErrorSeverity.HIGH);
      const mediumError = new ICPHubError('Medium', ErrorTypes.NETWORK, ErrorSeverity.MEDIUM);
      const lowError = new ICPHubError('Low', ErrorTypes.VALIDATION, ErrorSeverity.LOW);
      
      displayError(criticalError);
      expect(toast.error).toHaveBeenCalledWith(expect.any(String), 
        expect.objectContaining({ style: { background: '#dc2626', color: 'white' } }));
      
      displayError(highError);
      expect(toast.error).toHaveBeenCalledWith(expect.any(String),
        expect.objectContaining({ style: { background: '#ea580c', color: 'white' } }));
      
      displayError(mediumError);
      expect(toast.error).toHaveBeenCalledWith(expect.any(String),
        expect.objectContaining({ style: { background: '#d97706', color: 'white' } }));
      
      displayError(lowError);
      expect(toast.error).toHaveBeenCalledWith(expect.any(String),
        expect.objectContaining({ style: { background: '#65a30d', color: 'white' } }));
    });

    it('should respect display options', () => {
      const error = new Error('Test error');
      const options = {
        showToast: false,
        duration: 3000,
        position: 'bottom-left',
      };
      
      displayError(error, options);
      
      expect(toast.error).not.toHaveBeenCalled();
    });
  });

  describe('Comprehensive Error Handling', () => {
    it('should handle error with logging and display', () => {
      vi.stubEnv('DEV', true);
      
      const error = new Error('Test error');
      const context = { component: 'Test' };
      
      handleError(error, context);
      
      // Should log
      expect(console.group).toHaveBeenCalled();
      
      // Should display
      expect(toast.error).toHaveBeenCalled();
    });

    it('should pass display options correctly', () => {
      const error = new Error('Test error');
      const context = {};
      const displayOptions = { duration: 3000 };
      
      handleError(error, context, displayOptions);
      
      expect(toast.error).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ duration: 3000 })
      );
    });
  });

  describe('Error Boundary Higher-Order Function', () => {
    it('should execute function successfully when no error occurs', async () => {
      const mockFn = vi.fn().mockResolvedValue('success');
      const wrappedFn = withErrorHandling(mockFn, { component: 'Test' });
      
      const result = await wrappedFn('arg1', 'arg2');
      
      expect(result).toBe('success');
      expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2');
    });

    it('should handle errors and re-throw them', async () => {
      vi.stubEnv('DEV', true);
      
      const error = new Error('Function failed');
      const mockFn = vi.fn().mockRejectedValue(error);
      const wrappedFn = withErrorHandling(mockFn, { component: 'Test' });
      
      await expect(wrappedFn('arg1')).rejects.toThrow('Function failed');
      
      // Should handle the error
      expect(console.group).toHaveBeenCalled();
      expect(toast.error).toHaveBeenCalled();
    });

    it('should include context and arguments in error handling', async () => {
      vi.stubEnv('DEV', true);
      
      const error = new Error('Function failed');
      const mockFn = vi.fn().mockRejectedValue(error);
      const context = { component: 'TestComponent' };
      const wrappedFn = withErrorHandling(mockFn, context);
      
      await expect(wrappedFn('arg1', 'arg2')).rejects.toThrow();
      
      expect(console.error).toHaveBeenCalledWith('Context:', 
        expect.objectContaining({
          component: 'TestComponent',
          args: ['arg1', 'arg2']
        })
      );
    });
  });

  describe('Retry with Exponential Backoff', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should succeed on first attempt', async () => {
      const mockFn = vi.fn().mockResolvedValue('success');
      
      const result = await retryWithBackoff(mockFn, 3, 1000);
      
      expect(result).toBe('success');
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should retry on failure and eventually succeed', async () => {
      const mockFn = vi.fn()
        .mockRejectedValueOnce(new Error('Attempt 1 failed'))
        .mockRejectedValueOnce(new Error('Attempt 2 failed'))
        .mockResolvedValue('success');
      
      const resultPromise = retryWithBackoff(mockFn, 3, 1000);
      
      // Fast-forward timers to resolve delays
      await vi.runAllTimersAsync();
      
      const result = await resultPromise;
      
      expect(result).toBe('success');
      expect(mockFn).toHaveBeenCalledTimes(3);
    });

    it('should throw final error after max retries', async () => {
      const finalError = new Error('Final failure');
      const mockFn = vi.fn().mockRejectedValue(finalError);
      
      const resultPromise = retryWithBackoff(mockFn, 2, 1000);
      
      // Fast-forward timers
      await vi.runAllTimersAsync();
      
      await expect(resultPromise).rejects.toThrow('Final failure');
      expect(mockFn).toHaveBeenCalledTimes(2);
    });

    it('should use exponential backoff delays', async () => {
      const mockFn = vi.fn()
        .mockRejectedValueOnce(new Error('Attempt 1 failed'))
        .mockRejectedValueOnce(new Error('Attempt 2 failed'))
        .mockResolvedValue('success');
      
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      
      const resultPromise = retryWithBackoff(mockFn, 3, 1000);
      
      await vi.runAllTimersAsync();
      await resultPromise;
      
      expect(consoleLogSpy).toHaveBeenCalledWith('Attempt 1 failed, retrying in 1000ms...');
      expect(consoleLogSpy).toHaveBeenCalledWith('Attempt 2 failed, retrying in 2000ms...');
    });
  });

  describe('Error Types and Severity Constants', () => {
    it('should have all required error types', () => {
      expect(ErrorTypes.AUTHENTICATION).toBe('AUTHENTICATION');
      expect(ErrorTypes.NETWORK).toBe('NETWORK');
      expect(ErrorTypes.VALIDATION).toBe('VALIDATION');
      expect(ErrorTypes.PERMISSION).toBe('PERMISSION');
      expect(ErrorTypes.NOT_FOUND).toBe('NOT_FOUND');
      expect(ErrorTypes.SERVER).toBe('SERVER');
      expect(ErrorTypes.CLIENT).toBe('CLIENT');
      expect(ErrorTypes.UNKNOWN).toBe('UNKNOWN');
    });

    it('should have all required severity levels', () => {
      expect(ErrorSeverity.LOW).toBe('LOW');
      expect(ErrorSeverity.MEDIUM).toBe('MEDIUM');
      expect(ErrorSeverity.HIGH).toBe('HIGH');
      expect(ErrorSeverity.CRITICAL).toBe('CRITICAL');
    });
  });
});
