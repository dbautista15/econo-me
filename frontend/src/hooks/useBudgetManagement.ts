import { useApiState, ApiStateCallbacks } from './useApiState';
import { useApi } from './useApi';
import { transformations } from '../utils/transformations';
import { Budget, SavingsGoal } from '../../../types';
import { SavingsGoalApiData } from '../../../types/components/budget';

/**
 * Hook for managing budget and savings goal operations
 */
export const useBudgetManagement = (callbacks?: ApiStateCallbacks) => {
  const { loading, executeApiOperation } = useApiState(callbacks);
  const api = useApi();

  /**
   * Get existing budget or return null if not found
   */
  const getBudget = async (category: string, endpoint: string = '/budgets'): Promise<Budget | SavingsGoal | null> => {
    try {
      if (endpoint.includes('budgets')) {
        const budgets = await api.get<Budget[]>(endpoint);
        return budgets.find(b => b.category === category) || null;
      } else {
        const savingsGoals = await api.get<SavingsGoal[]>(endpoint);
        return savingsGoals[0] || null;
      }
    } catch {
      return null;
    }
  };

  /**
   * Update budget for a category
   */
  const updateBudget = async (
    category: string,
    amount: number,
    endpoint: string = '/budgets',
    amountField: string = 'limit_amount',
    method: string = 'PUT'
  ): Promise<boolean> => {
    // Special case for delete operations
    if (method === 'DELETE') {
      const [_, success] = await executeApiOperation(
        () => api.delete<void>(endpoint),
        `${category} deleted successfully`,
        `Failed to delete ${category}`
      );
      return success;
    }

    const requestData: Record<string, any> = { category };
    requestData[amountField] = transformations.parseAmount(amount);

    // First check if budget exists
    const existingBudget = await getBudget(category, endpoint) as Budget | null;

    // Use PUT if exists, POST if new
    const operation = existingBudget
      ? () => api.put<Budget>(`${endpoint}/${existingBudget.id}`, { [amountField]: transformations.parseAmount(amount) })
      : () => api.post<Budget>(endpoint, requestData);

    const [_, success] = await executeApiOperation(
      operation,
      `Budget for ${category} updated successfully`,
      `Failed to update budget for ${category}`
    );

    return success;
  };

  /**
   * Get all savings goals
   */
  const getSavingsGoals = async (): Promise<SavingsGoal[]> => {
    try {
      return await api.get<SavingsGoal[]>('/savings-goals');
    } catch {
      return [];
    }
  };

  /**
   * Update main savings goal
   */
  const updateSavingsGoal = async (amount: number): Promise<boolean> => {
    // First check if savings goal exists
    const existingSavingsGoal = await getBudget('', '/savings-goals') as SavingsGoal | null;

    const operation = existingSavingsGoal
      ? () => api.put<SavingsGoal>(`/savings-goals/${existingSavingsGoal.id}`, {
        target_amount: transformations.parseAmount(amount)
      })
      : () => api.post<SavingsGoal>('/savings-goals', {
        name: 'Monthly Savings',
        target_amount: transformations.parseAmount(amount),
        current_amount: 0,
        target_date: null
      });

    const [_, success] = await executeApiOperation(
      operation,
      'Savings goal updated successfully',
      'Failed to update savings goal'
    );

    return success;
  };

  /**
   * Add a new savings goal
   */
  const addSavingsGoal = async (goalData: SavingsGoalApiData): Promise<boolean> => {
    const { name, target_amount, current_amount, target_date } = goalData;
    
    const [_, success] = await executeApiOperation(
      () => api.post<SavingsGoal>('/savings-goals', {
        name,
        target_amount,
        current_amount,
        target_date
      }),
      'Savings goal added successfully',
      'Failed to add savings goal'
    );

    return success;
  };

  /**
   * Update an existing savings goal
   */
  const updateSavingsGoalComplete = async (
    id: number,
    data: Partial<SavingsGoalApiData>
  ): Promise<boolean> => {
    const [_, success] = await executeApiOperation(
      () => api.put<SavingsGoal>(`/savings-goals/${id}`, data),
      'Savings goal updated successfully',
      'Failed to update savings goal'
    );

    return success;
  };

  /**
   * Delete a savings goal
   */
  const deleteSavingsGoal = async (id: number): Promise<boolean> => {
    const [_, success] = await executeApiOperation(
      () => api.delete<void>(`/savings-goals/${id}`),
      'Savings goal deleted successfully',
      'Failed to delete savings goal'
    );

    return success;
  };

  /**
   * Deposit or withdraw from a savings goal
   */
  const adjustSavingsGoalAmount = async (
    id: number,
    amount: number,
    isDeposit: boolean = true
  ): Promise<boolean> => {
    try {
      // First get the current goal
      const goal = await api.get<SavingsGoal>(`/savings-goals/${id}`);

      // Calculate new amount
      const newAmount = isDeposit
        ? goal.current_amount + amount
        : Math.max(0, goal.current_amount - amount);

      // Update the goal
      return updateSavingsGoalComplete(id, { current_amount: newAmount });
    } catch (error) {
      callbacks?.onError?.('Failed to adjust savings goal amount');
      return false;
    }
  };

  return {
    loading,
    updateBudget,
    updateSavingsGoal,
    getSavingsGoals,
    addSavingsGoal,
    updateSavingsGoalComplete,
    deleteSavingsGoal,
    adjustSavingsGoalAmount
  };
};