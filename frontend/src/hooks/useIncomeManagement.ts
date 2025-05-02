import { useApiState, ApiStateCallbacks } from './useApiState';
import { useApi } from './useApi';
import { useBatchOperations } from './useBatchOperations';
import { Income } from '../../../types';
import { transformations } from '../utils/transformations';

export const useIncomeManagement = (callbacks?: ApiStateCallbacks) => {
  const { loading, executeApiOperation } = useApiState(callbacks);
  const api = useApi();
  const { executeBatchOperation } = useBatchOperations(callbacks);
  
  // Fetch incomes
  const fetchIncomes = async (): Promise<Income[]> => {
    const [data, success] = await executeApiOperation<Income[]>(
      () => api.get<Income[]>('/incomes'),
      '',
      'Error fetching incomes',
      false
    );
    
    return success ? data as Income[] : [];
  };
  
  // Add income - matching FinancialSummaryProps.onAddIncome exactly
  const addIncome = async (amount: number, date: string): Promise<boolean> => {
    const [_, success] = await executeApiOperation(
      () => api.post<Income>('/incomes', { 
        amount: transformations.parseAmount(amount), 
        date 
      }),
      'Income added successfully',
      'Failed to add income'
    );
    
    return success;
  };
  
  // Update income
  const updateIncome = async (amount: number): Promise<boolean> => {
    const [_, success] = await executeApiOperation(
      () => api.post<Income>('/incomes/update', { 
        amount: transformations.parseAmount(amount) 
      }),
      'Income updated successfully',
      'Failed to update income'
    );
    
    return success;
  };
  
  // Delete income
  const deleteIncome = async (id: number): Promise<boolean> => {
    const [_, success] = await executeApiOperation(
      () => api.delete<void>(`/incomes/${id}`),
      'Income deleted successfully',
      'Failed to delete income'
    );
    
    return success;
  };
  
  // Batch delete incomes
  const deleteIncomes = async (ids: number[]): Promise<{ success: number; failed: number }> => {
    return executeBatchOperation(
      ids,
      // Add explicit type annotation to the id parameter
      async (id: number) => {
        try {
          await api.delete<void>(`/incomes/${id}`);
          return true;
        } catch {
          return false;
        }
      },
      'Successfully deleted {count} income(s)',
      'Failed to delete {count} income(s)'
    );
  };
  
  return {
    loading,
    fetchIncomes,
    addIncome,
    deleteIncome,
    updateIncome,
    deleteIncomes
  };
};