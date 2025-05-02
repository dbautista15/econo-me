import { useState, useEffect, useCallback } from 'react';
import { useApiState } from './useApiState';
import { useApi } from './useApi';
import { Expense, ExpenseFilter } from '../../../types';
import { filterUtils } from '../utils/filterUtils';

// Define response interface
interface AddExpenseResponse {
  expense: Expense;
  message?: string;
}

export function useExpenses(initialExpenses: Expense[] = []) {
  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses);
  const [filteredExpenses, setFilteredExpenses] = useState<Expense[]>(initialExpenses);
  const [filter, setFilter] = useState<ExpenseFilter>({
    startDate: '',
    endDate: '',
    category: 'All'
  });
  const { loading, executeApiOperation } = useApiState();
  const api = useApi();

  // Load expenses from API
  const loadExpenses = useCallback(async () => {
    const [data, success] = await executeApiOperation<Expense[]>(
      () => api.get<Expense[]>('/expenses'),
      '',
      'Failed to load expenses',
      false
    );

    if (success && data) {
      const expensesData = Array.isArray(data) ? data : [];
      setExpenses(expensesData);
      setFilteredExpenses(filterUtils.filterExpenses(expensesData, filter));
      return expensesData;
    }

    return [];
  }, [filter]);

  // Add a new expense
  const addExpense = async (newExpense: {
    category: string;
    amount: number;
    date: string;
  }): Promise<boolean> => {
    const [data, success] = await executeApiOperation<AddExpenseResponse>(
      () => api.post<AddExpenseResponse>('/expenses', {
        category: newExpense.category,
        amount: newExpense.amount,
        date: new Date(newExpense.date).toISOString()
      }),
      'Expense added successfully',
      'Failed to add expense'
    );

    if (success && data) {
      const updatedExpenses = [...expenses, data.expense];
      setExpenses(updatedExpenses);
      setFilteredExpenses(filterUtils.filterExpenses(updatedExpenses, filter));
    }

    return success;
  };
  // Delete expense
  const deleteExpense = async (id: number): Promise<boolean> => {
    const [_, success] = await executeApiOperation(
      () => api.delete<void>(`/expenses/${id}`),
      'Expense deleted successfully',
      'Failed to delete expense'
    );

    if (success) {
      const updatedExpenses = expenses.filter(expense => expense.id !== id);
      setExpenses(updatedExpenses);
      setFilteredExpenses(filterUtils.filterExpenses(updatedExpenses, filter));
    }

    return success;
  };
  // Apply filters to expenses when filter or expenses change
  useEffect(() => {
    setFilteredExpenses(filterUtils.filterExpenses(expenses, filter));
  }, [expenses, filter]);

  return {
    expenses,
    filteredExpenses,
    filter,
    setFilter,
    loading,
    loadExpenses,
    addExpense,
    deleteExpense
  };
}