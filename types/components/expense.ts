import { Expense, CategorySummary,ExpenseForm } from '../domain/finance';

import { FormErrors } from '../../types/domain/finance';

export interface ExpenseManager {
  expenses?: Expense[];
  expensesByCategory?: CategorySummary;
  colors?: string[];
  onExpensesChange?: (expenses: Expense[]) => void;
}

export interface ExpenseDistributionProps {
  expensesByCategory: CategorySummary;
  totalExpenses: number;
}

export interface ExpenseFilterTypeProps {
  startDate?: string;
  endDate?: string;
  category?: string;
  minAmount?: number;
  maxAmount?: number;
}

export interface ExpenseFilterType {
  filter: ExpenseFilterTypeProps;
  setFilter: (filter: ExpenseFilterTypeProps) => void;
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
  total: number;
  successfulIds?: number[];
  failedIds?: number[];
}

// New interface for expense tracking and analysis
export interface ExpenseAnalytics {
  totalSpent: number;
  averageExpense: number;
  expensesByCategory: CategorySummary;
  monthlyTrends: {
    month: string;
    total: number;
  }[];
}

// Interface for bulk expense operations
export interface BulkExpenseOperations {
  bulkAdd?: (expenses: ExpenseForm[]) => Promise<boolean>;
  bulkDelete?: (ids: number[]) => Promise<DeletionResults>;
  bulkUpdate?: (expenses: Expense[]) => Promise<boolean>;
}

// Enhanced expense filtering interface
export interface AdvancedExpenseFilter extends ExpenseFilterTypeProps {
  sortBy?: keyof Expense;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}
