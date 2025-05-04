import React, { useState, useEffect } from 'react';
import ExpenseFilter from './ExpenseFilter';

import { preparePieChartData } from '../ui/Charts';
import { useCategories } from '../../context/CategoryContext';
import api from '../../utils/api';
import { ApiSuccess, ApiError } from '../../../../types';
import {Alert} from '../ui/Alert';
import AddExpenseForm from './AddExpenseForm';
import RecentExpensesTable from './RecentExpensesTable';
import {CategoryBreakdownChart} from '../ui/CategoryBreakdownChart';
import { 
  Expense, 
  ExpenseTrackerProps, 
  MessageState, 
  FormErrors, 
  ExpenseForm,
  ExpenseFilter as ExpenseFilterType  // Rename the type import to avoid conflict
} from '../../../../types';

/**
 * ExpenseTracker Component
 * 
 * Handles expense creation, filtering, and display.
 */
const ExpenseTracker: React.FC<ExpenseTrackerProps> = ({
  expenses: initialExpenses = [],
  expensesByCategory = {},
  colors = [],
  onExpensesChange = () => {}
}) => {
  // Use category context
  const { categories, loading: categoriesLoading } = useCategories();
  
  // State management with proper types
  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [filter, setFilter] = useState<ExpenseFilterType>({ 
    startDate: '', 
    endDate: '', 
    category: 'All' 
  });
  const [filteredExpenses, setFilteredExpenses] = useState<Expense[]>([]);
  const [messages, setMessages] = useState<MessageState>({ success: '', error: '' });
  const [categoryList, setCategoryList] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  /** Load categories & expenses on mount */
  useEffect(() => {
    const loadData = async (): Promise<void> => {
      try {
        const [cats, exps] = await Promise.all([
          api.get<ApiSuccess<string[]>>('/categories'), 
          api.get<ApiSuccess<Expense[]>>('/expenses')
        ]);
        setCategoryList(cats.data);
        setExpenses(exps.data);
        setFilteredExpenses(exps.data);
      } catch (error) {
        setMessages(prev => ({ ...prev, error: 'Failed to load expenses' }));
      }
    };
    loadData();
  }, []);

  /** Filter expenses when filter or data changes */
  useEffect(() => {
    const filtered = expenses.filter((e) => {
      const expenseDate = e.expense_date;
      
      const inDateRange =
        (!filter.startDate || new Date(expenseDate as string) >= new Date(filter.startDate)) &&
        (!filter.endDate || new Date(expenseDate as string) <= new Date(filter.endDate));
        
      const inCategory = filter.category === 'All' || e.category === filter.category;
      
      return inDateRange && inCategory;
    });
    
    setFilteredExpenses(filtered);
  }, [expenses, filter]);

  /** Handle adding a new expense */
  const handleAddExpense = async (expenseForm: ExpenseForm): Promise<boolean> => {
    setLoading(true);
    
    try {
      const parsedAmount = typeof expenseForm.amount === 'string' 
        ? parseFloat(expenseForm.amount) 
        : expenseForm.amount;
      
      const newExpense = {
        category: expenseForm.category,
        amount: parsedAmount,
        date: new Date(expenseForm.date).toISOString()
      };
      
      const response = await api.post<ApiSuccess<{expense: Expense}>>('/expenses', newExpense);
      const updatedExpenses = [...expenses, response.data.expense];
      
      setExpenses(updatedExpenses);
      setFilteredExpenses(updatedExpenses);
      onExpensesChange(updatedExpenses);

      // Show success message
      setMessages({ success: 'Expense added successfully!', error: '' });
      setTimeout(() => setMessages({ success: '', error: '' }), 3000);
      
      return true;
    } catch (err) {
      setMessages({ error: 'Failed to add expense', success: '' });
      setTimeout(() => setMessages({ success: '', error: '' }), 3000);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const pieChartData = preparePieChartData(expensesByCategory);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Notifications */}
      {messages.success && <Alert type="success" message={messages.success} />}
      {messages.error && <Alert type="error" message={messages.error} />}

      {/* Expense Form */}
      <AddExpenseForm
        categories={categories}
        onAddExpense={handleAddExpense}
        formErrors={formErrors}
        loading={loading}
      />

      {/* Filter */}
      <ExpenseFilter 
        filter={filter} 
        setFilter={setFilter} 
        categories={categories} 
      />

      {/* Recent Expenses Table */}
      <RecentExpensesTable expenses={filteredExpenses} />

      {/* Category Breakdown Chart */}
      <CategoryBreakdownChart 
        pieChartData={pieChartData} 
        colors={colors} 
      />
    </div>
  );
};

export default ExpenseTracker;