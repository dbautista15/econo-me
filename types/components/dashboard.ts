import { Expense, Income, CategorySummary, Suggestion,SavingsGoal} from '../domain/finance';
import type { ExpenseFilterType } from './expense'; // Import the type from expense.ts instead of the component

/**
 * Dashboard component props
 */

export interface UnifiedDashboard {
  // Financial data
  income: number;
  incomes: Income[];
  savingsGoal:number;
  savingsGoals: SavingsGoal[];// Add this line  spendingLimit: number;
  expenses: Expense[];
  categories: string[];
  expensesByCategory: CategorySummary;
  categoryBudgets: Record<string, number>;
  loading: boolean;
  filter: ExpenseFilterType;
  filteredExpenses: Expense[];
  totalExpenses: number;
  savings: number;
  savingsProgress: number;
  budgetPercentage: number;
  isOverBudget: boolean;
  suggestion: Suggestion | null;
  spendingLimit: number;
  
  // Functions
  fetchData: () => Promise<void>;
  setFilter: (filter: ExpenseFilterType) => void;
  
  // Message callbacks
  onSuccessMessage: (msg: string) => void;
  onErrorMessage: (msg: string) => void;
}


export interface UnifiedDashboard {
  onSuccessMessage: (msg: string) => void;
  onErrorMessage: (msg: string) => void;
}

export interface UnifiedDashboardProps {
  onSuccessMessage: (message: string) => void;
  onErrorMessage: (message: string) => void;
}

export interface FinancialOverview {
  expensesByCategory: CategorySummary;
  totalExpenses: number;
  income: number;
  savings: number;
  isOverBudget: boolean;
  spendingLimit: number;
  suggestion: Suggestion | null;
  onApplySuggestion: (limit: number) => void;
}