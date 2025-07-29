import React from 'react';

const ErrorDisplay = ({
  error,
  onDismiss,
  onRetry,
  variant = 'alert',
  className = '',
}) => {
  if (!error) return null;

  const variants = {
    alert: 'bg-red-50 border border-red-200 text-red-800',
    banner: 'bg-red-600 text-white',
    card: 'bg-white border border-red-300 shadow-sm',
    inline: 'bg-red-100 text-red-700',
  };

  const iconVariants = {
    alert: 'text-red-400',
    banner: 'text-white',
    card: 'text-red-400',
    inline: 'text-red-500',
  };

  return (
    <div className={`rounded-md p-4 ${variants[variant]} ${className}`}>
      <div className="flex">
        <div className="flex-shrink-0">
          <svg
            className={`h-5 w-5 ${iconVariants[variant]}`}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium">Something went wrong</h3>
          <div className="mt-2 text-sm">
            <p>
              {typeof error === 'string'
                ? error
                : error.message || 'An unexpected error occurred'}
            </p>
          </div>
          {(onDismiss || onRetry) && (
            <div className="mt-4">
              <div className="flex space-x-2">
                {onRetry && (
                  <button
                    type="button"
                    onClick={onRetry}
                    className={`
                      text-sm font-medium rounded-md px-2 py-1 transition-colors
                      ${
                        variant === 'banner'
                          ? 'text-white hover:bg-red-700 border border-white border-opacity-30'
                          : 'text-red-800 hover:bg-red-100 border border-red-300'
                      }
                    `}
                  >
                    Try again
                  </button>
                )}
                {onDismiss && (
                  <button
                    type="button"
                    onClick={onDismiss}
                    className={`
                      text-sm font-medium rounded-md px-2 py-1 transition-colors
                      ${
                        variant === 'banner'
                          ? 'text-white hover:bg-red-700'
                          : 'text-red-600 hover:bg-red-100'
                      }
                    `}
                  >
                    Dismiss
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
        {onDismiss && !onRetry && (
          <div className="ml-auto pl-3">
            <div className="-mx-1.5 -my-1.5">
              <button
                type="button"
                onClick={onDismiss}
                className={`
                  inline-flex rounded-md p-1.5 transition-colors
                  ${
                    variant === 'banner'
                      ? 'text-white hover:bg-red-700'
                      : 'text-red-400 hover:bg-red-100'
                  }
                `}
              >
                <span className="sr-only">Dismiss</span>
                <svg
                  className="h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Toast notification component for errors
export const ErrorToast = ({ error, onDismiss, duration = 5000 }) => {
  React.useEffect(() => {
    if (error && onDismiss && duration > 0) {
      const timer = setTimeout(() => {
        onDismiss();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [error, onDismiss, duration]);

  if (!error) return null;

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm w-full">
      <div className="bg-red-600 text-white rounded-lg shadow-lg p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm font-medium">
              {typeof error === 'string'
                ? error
                : error.message || 'An error occurred'}
            </p>
          </div>
          {onDismiss && (
            <div className="ml-auto pl-3">
              <button
                onClick={onDismiss}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <span className="sr-only">Close</span>
                <svg
                  className="h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorDisplay;
