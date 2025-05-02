import { useState } from 'react';
import { useApiState, ApiStateCallbacks } from './useApiState';
import { useApi } from './useApi';

export function useBatchOperations(callbacks?: ApiStateCallbacks) {
  const [batchProgress, setBatchProgress] = useState({ 
    processed: 0, 
    total: 0, 
    success: 0, 
    failed: 0 
  });
  
  const { setLoading, onSuccess, onError, onUpdate } = useApiState(callbacks);
  const api = useApi();
  
  const executeBatchOperation = async <T>(
    items: T[],
    operation: (item: T) => Promise<boolean>,
    successMessage: string,
    errorMessage: string
  ): Promise<{ success: number; failed: number }> => {
    if (items.length === 0) return { success: 0, failed: 0 };
    
    setBatchProgress({ processed: 0, total: items.length, success: 0, failed: 0 });
    setLoading(true);
    
    let successCount = 0;
    let failedCount = 0;
    
    try {
      for (const item of items) {
        try {
          const result = await operation(item);
          if (result) {
            successCount++;
          } else {
            failedCount++;
          }
        } catch (error) {
          failedCount++;
        }
        
        setBatchProgress(prev => ({
          ...prev,
          processed: prev.processed + 1,
          success: successCount,
          failed: failedCount
        }));
      }
      
      if (successCount > 0) {
        onSuccess(successMessage.replace('{count}', successCount.toString()));
        onUpdate();
      }
      
      if (failedCount > 0) {
        onError(errorMessage.replace('{count}', failedCount.toString()));
      }
      
      return { success: successCount, failed: failedCount };
    } finally {
      setLoading(false);
    }
  };
  
  return {
    batchProgress,
    executeBatchOperation
  };
}
