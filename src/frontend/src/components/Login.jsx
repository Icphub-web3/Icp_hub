import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LoadingButton } from './LoadingSpinner';
import ErrorDisplay from './ErrorDisplay';

const Login = () => {
  const { isAuthenticated, isLoading, user, error, login, logout, clearError } =
    useAuth();

  const handleLogin = async () => {
    try {
      await login();
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const formatPrincipal = principal => {
    if (!principal) return '';
    return principal.length > 20
      ? `${principal.slice(0, 10)}...${principal.slice(-10)}`
      : principal;
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white shadow-lg rounded-lg p-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            ICP Hub Authentication
          </h2>
          <p className="text-gray-600">
            {isAuthenticated
              ? 'Welcome back!'
              : 'Connect with Internet Identity'}
          </p>
        </div>

        <ErrorDisplay
          error={error}
          onDismiss={clearError}
          onRetry={!isAuthenticated ? handleLogin : undefined}
          variant="alert"
          className="mb-4"
        />

        {isAuthenticated && user && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
            <h3 className="font-semibold text-green-800 mb-2">Connected</h3>
            <p className="text-sm text-green-700 break-all">
              <strong>Principal:</strong> {formatPrincipal(user.principal)}
            </p>
          </div>
        )}

        <div className="flex justify-center">
          {isAuthenticated ? (
            <LoadingButton
              onClick={handleLogout}
              loading={isLoading}
              loadingText="Logging out..."
              variant="danger"
              className="w-full"
              size="lg"
            >
              Logout
            </LoadingButton>
          ) : (
            <LoadingButton
              onClick={handleLogin}
              loading={isLoading}
              loadingText="Connecting..."
              variant="primary"
              className="w-full"
              size="lg"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              Login with Internet Identity
            </LoadingButton>
          )}
        </div>

        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            Powered by Internet Computer Identity
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
