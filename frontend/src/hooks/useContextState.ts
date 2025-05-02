import { useState, useCallback } from 'react';

export interface ContextStateCallbacks {
  onSuccess?: (message: string) => void;
  onError?: (message: string) => void;
}

/**
 * Hook for managing state in context providers
 * Provides consistent loading, error, and success state management
 */
export function useContextState(callbacks?: ContextStateCallbacks) {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Default no-op callbacks if not provided
  const onSuccess = callbacks?.onSuccess || ((message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 3000); // Auto-clear after 3 seconds
  });
  
  const onError = callbacks?.onError || ((message: string) => {
    setError(message);
    setTimeout(() => setError(null), 5000); // Auto-clear after 5 seconds
  });
  
  // Generic function to handle operations
  const executeOperation = async <T>(
    operation: () => Promise<T>,
    successMessage: string,
    errorMessage: string
  ): Promise<[T | null, boolean]> => {
    setLoading(true);
    try {
      const result = await operation();
      onSuccess(successMessage);
      return [result, true];
    } catch (error) {
      onError(errorMessage);
      return [null, false];
    } finally {
      setLoading(false);
    }
  };
  
  // Function to clear errors
  const clearError = useCallback(() => {
    setError(null);
  }, []);
  
  // Function to clear success message
  const clearSuccessMessage = useCallback(() => {
    setSuccessMessage(null);
  }, []);
  
  return {
    loading,
    setLoading,
    error,
    setError,
    clearError,
    successMessage,
    setSuccessMessage,
    clearSuccessMessage,
    executeOperation
  };
}