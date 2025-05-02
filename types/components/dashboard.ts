import { Expense, Income, CategorySummary, Suggestion} from '../domain/finance';
import type { ExpenseFilter } from './expense'; // Import the type from expense.ts instead of the component

/**
 * Dashboard component props
 */

export interface DashboardProps {
  // Financial data
  income: number;
  incomes: Income[];
  savingsGoal: number;
  spendingLimit: number;
  expenses: Expense[];
  categories: string[];
  expensesByCategory: CategorySummary;
  categoryBudgets: Record<string, number>;
  loading: boolean;
  filter: ExpenseFilter;
  filteredExpenses: Expense[];
  totalExpenses: number;
  savings: number;
  savingsProgress: number;
  budgetPercentage: number;
  isOverBudget: boolean;
  suggestion: Suggestion | null;
  
  // Functions
  fetchData: () => Promise<void>;
  setFilter: (filter: ExpenseFilter) => void;
  
  // Message callbacks
  onSuccessMessage: (msg: string) => void;
  onErrorMessage: (msg: string) => void;
}


export interface DashboardContainerProps {
  onSuccessMessage: (msg: string) => void;
  onErrorMessage: (msg: string) => void;
}

export interface FinancialSummaryProps {
  income: number;
  totalExpenses: number;
  savings: number;
  budgetPercentage: number;
  isOverBudget: boolean;
  savingsProgress: number;
  savingsGoal: number;
  incomes?: Income[];
  onAddIncome?: (amount: number, date: string) => Promise<boolean> | void;
  onDeleteIncome?: (id: number) => Promise<boolean>;
}

export interface FinancialInsightsProps {
  expensesByCategory: CategorySummary;
  totalExpenses: number;
  income: number;
  savings: number;
  isOverBudget: boolean;
  spendingLimit: number;
  suggestion: Suggestion | null;
  onApplySuggestion: (limit: number) => void;
}