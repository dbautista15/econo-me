import { Expense, CategorySummary, ExpenseForm } from '../domain/finance';
import { FormErrors } from './forms';
/**
 * Expense component props
 */

export interface ExpenseTrackerProps {
  expenses?: Expense[];
  expensesByCategory?: CategorySummary;
  colors?: string[];
  onExpensesChange?: (expenses: Expense[]) => void;
}

export interface ExpenseDistributionProps {
  expensesByCategory: CategorySummary;
  totalExpenses: number;
}

export interface ExpenseFilter {
  startDate: string;
  endDate: string;
  category: string;
}

export interface ExpenseFilterProps {
  filter: ExpenseFilter;
  setFilter: (filter: ExpenseFilter) => void;
  categories: string[];
}

export interface RecentExpensesTableProps {
  expenses: Expense[];
}

export interface AddExpenseFormProps {
  categories: string[];
  onAddExpense: (expense: ExpenseForm) => Promise<boolean>;
  formErrors?: FormErrors;
  loading?: boolean;
}

export interface DeleteExpensesProps {
  onSuccess?: (message: string) => void;
  onError?: (message: string) => void;
}

export interface DeletionResults {
  success: number;
  failed: number;
}