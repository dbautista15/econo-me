import { useApiState, ApiStateCallbacks } from './useApiState';
import { useApi } from './useApi';
import { transformations } from '../utils/transformations';
import { Budget, SavingsGoal } from '../../../types';

export const useBudgetManagement = (callbacks?: ApiStateCallbacks) => {
  const { loading, executeApiOperation } = useApiState(callbacks);
  const api = useApi();
  
  // Get existing budget or return null if not found
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
  
  // Update budget for a category
  const updateBudget = async (
    category: string, 
    amount: number, 
    endpoint: string = '/budgets', 
    amountField: string = 'limit_amount'
  ): Promise<boolean> => {
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
  
  // Update savings goal
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
  
  return {
    loading,
    updateBudget,
    updateSavingsGoal
  };
};