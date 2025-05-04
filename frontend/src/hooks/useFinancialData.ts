// Fixed useFinancialData.ts - resolves infinite loop issue

import { useState, useEffect, useCallback, useRef } from 'react';
import { useApiState, ApiStateCallbacks } from './useApiState';
import { useApi } from './useApi';
import { Expense, Income, Budget, SavingsGoal, ExpenseFilter } from '../../../types';
import { financialCalculations } from '../utils/financialCalculations';
import { filterUtils } from '../utils/filterUtils';
import { transformations } from '../utils/transformations';

interface FinancialState {
  income: number;
  incomes: Income[];
  savingsGoal: number; 
  savingsGoals: SavingsGoal[]; 
  spendingLimit: number;
  expenses: Expense[];
  categories: string[];
  expensesByCategory: Record<string, number>;
  categoryBudgets: Record<string, number>;
  loading: boolean;
  filter: ExpenseFilter;
  filteredExpenses: Expense[];
  totalExpenses: number;
  savings: number;
  savingsProgress: number;
  budgetPercentage: number;
  isOverBudget: boolean;
  suggestion: any;
}


// Initial default state
const initialState: FinancialState = {
  income: 0,
  incomes: [],
  savingsGoal: 0,
  savingsGoals:[],
  spendingLimit: 0,
  expenses: [],
  categories: [
    'Food', 'Transportation', 'Housing', 'Utilities',
    'Entertainment', 'Healthcare', 'Dining Out', 'Shopping'
  ],
  expensesByCategory: {},
  categoryBudgets: {},
  loading: true,
  filter: {
    startDate: '',
    endDate: '',
    category: 'All'
  },
  filteredExpenses: [],
  totalExpenses: 0,
  savings: 0,
  savingsProgress: 0,
  budgetPercentage: 0,
  isOverBudget: false,
  suggestion: null
};

export const useFinancialData = (callbacks?: ApiStateCallbacks) => {
  // Use memoized initial state to prevent recreating on every render
  const [state, setState] = useState<FinancialState>(initialState);
  
  // Track if the component is mounted to prevent state updates after unmount
  const isMounted = useRef(true);
  
  // Flag to track if initial data fetch has been done
  const hasInitialFetchBeenDone = useRef(false);

  // Use ApiState with callbacks from props
  const { loading, setLoading, onSuccess, onError } = useApiState(callbacks);
  const api = useApi();

  // Process expenses data
  const processExpenses = useCallback((expenses: Expense[]): Record<string, number> => {
    const expByCat: Record<string, number> = {};
    expenses.forEach((exp: Expense) => {
      expByCat[exp.category] = (expByCat[exp.category] || 0) + transformations.parseAmount(exp.amount);
    });
    return expByCat;
  }, []);

  // Process budgets data
  const processBudgets = useCallback((budgets: Budget[]): { spendingLimit: number, categoryBudgets: Record<string, number> } => {
    const totalBudget = budgets.find((b: Budget) => b.category === 'Total');
    const spendingLimit = totalBudget ? transformations.parseAmount(totalBudget.limit_amount) : 0;
    
    const catBudgets: Record<string, number> = {};
    budgets.forEach((b: Budget) => {
      if (b.category !== 'Total') {
        catBudgets[b.category] = transformations.parseAmount(b.limit_amount);
      }
    });
    
    return { spendingLimit, categoryBudgets: catBudgets };
  }, []);

  // Function to fetch all financial data
  const fetchData = useCallback(async (): Promise<void> => {
    // Prevent multiple simultaneous fetches
    if (loading) return;
    
    setLoading(true);
    
    try {
      // Fetch all data in parallel with proper typing
      const [
        expensesData,
        categoriesData,
        incomesData,
        budgetsData,
        savingsData
      ] = await Promise.all([
        api.get<Expense[]>('/expenses'),
        api.get<string[]>('/categories'),
        api.get<Income[]>('/incomes'),
        api.get<Budget[]>('/budgets'),
        api.get<SavingsGoal[]>('/savings-goals')
      ]);
  
      // Process expenses
      const fetchedExpenses = expensesData || [];
      const expensesByCategory = processExpenses(fetchedExpenses);
      
      // Process categories
      const fetchedCategories = categoriesData || [];
      
      // Process incomes
      const fetchedIncomes = incomesData || [];
      const totalIncome = fetchedIncomes.reduce(
        (sum: number, i: Income) => sum + transformations.parseAmount(i.amount), 0
      ) || 0;
      
      // Process budgets
      const { spendingLimit, categoryBudgets } = processBudgets(budgetsData || []);
      
      // Process savings goals - now handling both savingsGoal (single) and savingsGoals (array)
      const fetchedSavingsGoals = savingsData || [];
      const savingsGoal = fetchedSavingsGoals.length > 0 
        ? transformations.parseAmount(fetchedSavingsGoals[0].target_amount) 
        : 0;
      
      // Calculate derived values
      const totalExpenses = transformations.sumValues(Object.values(expensesByCategory));
      const savings = financialCalculations.calculateSavings(totalIncome, totalExpenses);
      const savingsProgress = transformations.calculatePercentage(savings, savingsGoal);
      const { budgetPercentage, isOverBudget } = financialCalculations.calculateBudgetStatus(totalExpenses, spendingLimit);
      const suggestion = financialCalculations.getSuggestedLimit(fetchedIncomes);
      
      // Update state with function form to use latest state
      setState(prevState => {
        // Filter expenses using latest filter from prevState
        const filteredExpenses = filterUtils.filterExpenses(fetchedExpenses, prevState.filter);
        
        return {
          income: totalIncome,
          incomes: fetchedIncomes,
          savingsGoal, // Keep single goal for backward compatibility
          savingsGoals: fetchedSavingsGoals, // Add array of all goals
          spendingLimit,
          expenses: fetchedExpenses,
          categories: fetchedCategories.length > 0 ? fetchedCategories : prevState.categories,
          expensesByCategory,
          categoryBudgets,
          loading: false,
          filter: prevState.filter,
          filteredExpenses,
          totalExpenses,
          savings,
          savingsProgress,
          budgetPercentage,
          isOverBudget,
          suggestion
        };
      });
      
      // Use callback for success message if provided
      if (isMounted.current && callbacks?.onSuccess) {
        callbacks.onSuccess('Financial data loaded successfully');
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      // Use callback for error message if provided
      if (isMounted.current && callbacks?.onError) {
        callbacks.onError('Failed to load financial data');
      }
      setState(prev => ({ ...prev, loading: false }));
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, [api, processExpenses, processBudgets, setLoading, isMounted, callbacks]);
  
    
  // Set filter and update filtered expenses
  const setFilter = useCallback((newFilter: ExpenseFilter): void => {
    setState(prev => {
      const filteredExpenses = filterUtils.filterExpenses(prev.expenses, newFilter);
      return { ...prev, filter: newFilter, filteredExpenses };
    });
  }, []);
  
  // Load data only once on initial mount
  useEffect(() => {
    // Only fetch if this is the first time
    if (!hasInitialFetchBeenDone.current) {
      hasInitialFetchBeenDone.current = true;
      fetchData();
    }
    
    // Cleanup function to prevent updates after unmount
    return () => {
      isMounted.current = false;
    };
  }, []); // Empty dependency array ensures this only runs once
  
  // Return state and functions
  return {
    ...state,
    loading,
    fetchData,
    setFilter
  };
};