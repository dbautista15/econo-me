import { useState } from 'react';

export interface ApiStateCallbacks {
  onSuccess?: (message: string) => void;
  onError?: (message: string) => void;
  onUpdate?: () => void;
}

export function useApiState(callbacks?: ApiStateCallbacks) {
  const [loading, setLoading] = useState<boolean>(false);
  
  // Default no-op callbacks if not provided
  const onSuccess = callbacks?.onSuccess || ((message: string) => console.log(message));
  const onError = callbacks?.onError || ((message: string) => console.error(message));
  const onUpdate = callbacks?.onUpdate || (() => {});
  
  // Generic function to handle API operations
  const executeApiOperation = async <T>(
    operation: () => Promise<T>,
    successMessage: string,
    errorMessage: string,
    shouldCallOnUpdate: boolean = true
  ): Promise<[T | null, boolean]> => {
    setLoading(true);
    try {
      const result = await operation();
      onSuccess(successMessage);
      if (shouldCallOnUpdate) onUpdate();
      return [result, true];
    } catch (error) {
      onError(errorMessage);
      return [null, false];
    } finally {
      setLoading(false);
    }
  };
  
  return {
    loading,
    setLoading,
    executeApiOperation,
    onSuccess,
    onError,
    onUpdate
  };
}
