import { useApiState, ApiStateCallbacks } from './useApiState';
import { useApi } from './useApi';
import { useBatchOperations } from './useBatchOperations';
import { ExpenseForm, Expense } from '../../../types';
import { transformations } from '../utils/transformations';

export const useExpenseManagement = (callbacks?: ApiStateCallbacks) => {
  const { loading, executeApiOperation } = useApiState(callbacks);
  const api = useApi();
  const { executeBatchOperation } = useBatchOperations(callbacks);

  // Add a new expense
  const addExpense = async (expenseData: ExpenseForm): Promise<boolean> => {
    if (!expenseData.category || !expenseData.amount) return false;
    
    const [_, success] = await executeApiOperation(
      () => api.post<Expense>('/expenses', {
        category: expenseData.category,
        amount: transformations.parseAmount(expenseData.amount),
        date: expenseData.date
      }),
      'Expense added successfully',
      'Failed to add expense'
    );
    
    return success;
  };
  
  // Delete an expense
  const deleteExpense = async (id: number): Promise<boolean> => {
    const [_, success] = await executeApiOperation(
      () => api.delete<void>(`/expenses/${id}`),
      'Expense deleted successfully',
      'Failed to delete expense'
    );
    
    return success;
  };
  
  // Batch delete expenses
  const deleteExpenses = async (ids: number[]): Promise<{ success: number; failed: number }> => {
    return executeBatchOperation(
      ids,
      // Add explicit type annotation to the id parameter
      async (id: number) => {
        try {
          await api.delete<void>(`/expenses/${id}`);
          return true;
        } catch {
          return false;
        }
      },
      'Successfully deleted {count} expense(s)',
      'Failed to delete {count} expense(s)'
    );
  };
  
  return {
    loading,
    addExpense,
    deleteExpense,
    deleteExpenses
  };
};
