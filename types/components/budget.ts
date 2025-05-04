import { CategorySummary, SavingsGoal, Suggestion } from '../domain/finance';
import { Income } from '../domain/finance';

/**
 * Budget component types
 */

export interface CategoryBudgetManagerProps {
  categories: string[];
  expensesByCategory: CategorySummary;
  categoryBudgets: Record<string, number>;
  colors?: string[];
  onUpdateBudget?: (category: string, limit: number) => void;
  onSaveBudget?: (category: string, limit: number) => void;
}

/**
 * IncomeGoalsProps interface for income and spending limits management
 */
export interface IncomeGoalsProps {
  income: number;
  setIncome: (income: number) => Promise<boolean> | boolean;
  spendingLimit: number;
  setSpendingLimit: (limit: number) => void;
  expensesByCategory: CategorySummary;
  incomes: Income[];
  onSuccessMessage?: (msg: string) => void;
  onErrorMessage?: (msg: string) => void;
}

/**
 * Props for BasicIncomeForm
 */
export interface BasicIncomeFormProps {
  currentIncome: number;
  onSubmit: (value: number) => void;
  loading: boolean;
}

export interface SuggestionCardProps {
  suggestion: Suggestion;
  applyLimit: (limit: number) => void;
}

export interface SpendingLimitFormProps {
  limit: number;
  onSubmit: (value: number) => void;
  loading: boolean;
}

export interface SavingsGoalFormProps {
  goal: number;
  onSubmit: (value: number) => void;
  loading: boolean;
}

/**
 * Income entry form data and props
 */
export interface IncomeFormData {
  amount: string;
  date: string;
}

export interface IncomeFormErrors {
  amount?: string;
  date?: string;
}

export interface IncomeEntryFormProps {
  initialAmount?: string;
  initialDate?: string;
  onAddIncomeSuccess?: () => void;
}

/**
 * Income list props
 */
export interface IncomeListProps {
  incomes: Income[];
  onUpdate: () => void;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

/**
 * Consistent SavingsGoal management types
 */

// Basic form data for creating/editing a savings goal
export interface SavingsGoalFormData {
  name: string;
  targetAmount: string;
  currentAmount: string;
  targetDate: string;
}

// Shape of goal data for the API
export interface SavingsGoalApiData {
  name: string;
  target_amount: number;
  current_amount: number;
  target_date: string | null;
}

// Consistent props interface for SavingsGoalManager
export interface SavingsGoalManagerProps {
  savingsGoals: SavingsGoal[];
  onSuccessMessage: (message: string) => void;
  onErrorMessage: (message: string) => void;
  onUpdate: () => void;
  onAddGoal: (goalData: SavingsGoalApiData) => Promise<boolean>;
  onDeleteGoal: (id: number) => Promise<boolean>;
  onUpdateGoal: (id: number, goalData: Partial<SavingsGoalApiData>) => Promise<boolean>;
  onAdjustGoalAmount: (id: number, amount: number, isDeposit: boolean) => Promise<boolean>;
}