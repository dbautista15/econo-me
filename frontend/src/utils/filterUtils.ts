import { Expense } from '../../../types';

export interface DateRangeFilter {
  startDate?: string;
  endDate?: string;
}

export interface CategoryFilter {
  category?: string;
}

export type ExpenseFilterCriteria = DateRangeFilter & CategoryFilter & {
  category: string;
};


/**
 * Filter utilities for expenses and other data
 */
export const filterUtils = {
  /**
   * Filter expenses by date range
   */
  byDateRange: (expenses: Expense[], filter: DateRangeFilter): Expense[] => {
    return expenses.filter(expense => {
      const date = expense.expense_date;
      const inStartRange = !filter.startDate || new Date(date as string) >= new Date(filter.startDate);
      const inEndRange = !filter.endDate || new Date(date as string) <= new Date(filter.endDate);
      return inStartRange && inEndRange;
    });
  },
  
  /**
   * Filter expenses by category
   */
  byCategory: (expenses: Expense[], filter: CategoryFilter): Expense[] => {
    if (!filter.category || filter.category === 'All') return expenses;
    return expenses.filter(expense => expense.category === filter.category);
  },
  
  /**
   * Combined filter function for expenses
   */
  filterExpenses: (expenses: Expense[], filter: ExpenseFilterCriteria): Expense[] => {
    return expenses.filter(expense => {
      const date = expense.expense_date;
      const inDateRange = 
        (!filter.startDate || new Date(date as string) >= new Date(filter.startDate)) &&
        (!filter.endDate || new Date(date as string) <= new Date(filter.endDate));
      const inCategory = !filter.category || filter.category === 'All' || expense.category === filter.category;
      return inDateRange && inCategory;
    });
  }
};