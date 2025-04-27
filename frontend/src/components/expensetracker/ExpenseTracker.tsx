import React, { useState, useEffect } from 'react';
import { validateExpenseForm, preparePieChartData } from '../../utils/helpers.tsx';
import { useCategories } from '../../context/CategoryContext.tsx';
import api from '../../utils/api.tsx';
import Alert from '../ui/Alert.tsx/index.ts';
import AddExpenseForm from './AddExpenseForm.tsx';
import ExpenseFilter from './ExpenseFilter.tsx';
import RecentExpensesTable from './RecentExpensesTable.js';
import CategoryBreakdownChart from '../goals/CategoryBudgetManager.tsx';

/**
 * ExpenseTracker Component
 * 
 * Handles expense creation, filtering, and display.
 */
const ExpenseTracker = ({
  expenses: initialExpenses = [],
  expensesByCategory = {},
  colors = [],
  onExpensesChange = () => { }
}) => {
  const { categories, loading: categoriesLoading } = useCategories();
  const [expenses, setExpenses] = useState(initialExpenses);
  const [category, setCategory] = useState('Food');
  const [amount, setAmount] = useState('');
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);
  const [formErrors, setFormErrors] = useState({});
  const [filter, setFilter] = useState({ startDate: '', endDate: '', category: 'All' });
  const [filteredExpenses, setFilteredExpenses] = useState([]);
  const [messages, setMessages] = useState({ success: '', error: '' });
  const [categoryList, setCategoryList] = useState([]);
  const [loading, setLoading] = useState(false);

  /** Load categories & expenses on mount */
  useEffect(() => {
    const loadData = async () => {
      try {
        const [cats, exps] = await Promise.all([api.get('/categories'), api.get('/expenses')]);
        setCategoryList(cats.data);
        setExpenses(exps.data);
        setFilteredExpenses(exps.data);
      } catch {
        setMessages({ ...messages, error: 'Failed to load expenses' });
      }
    };
    loadData();
  }, []);

  /** Filter expenses when filter or data changes */
  useEffect(() => {
    const filtered = expenses.filter((e) => {
      const inDateRange =
        (!filter.startDate || new Date(e.date) >= new Date(filter.startDate)) &&
        (!filter.endDate || new Date(e.date) <= new Date(filter.endDate));
      const inCategory = filter.category === 'All' || e.category === filter.category;
      return inDateRange && inCategory;
    });
    setFilteredExpenses(filtered);
  }, [expenses, filter]);

  /** Handle form submission */
  const handleAddExpense = async (e) => {
    e.preventDefault();
    const errors = validateExpenseForm(amount, expenseDate);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setLoading(true);
    try {
      const parsedAmount = parseFloat(amount);
      const newExpense = {
        category,
        amount: parsedAmount,
        date: new Date(expenseDate).toISOString()
      };
      const response = await api.post('/expenses', newExpense);
      const updatedExpenses = [...expenses, response.data.expense];
      setExpenses(updatedExpenses);
      setFilteredExpenses(updatedExpenses);
      onExpensesChange(updatedExpenses);

      setMessages({ success: 'Expense added successfully!', error: '' });
      setAmount('');
      setExpenseDate(new Date().toISOString().split('T')[0]);
    } catch (err) {
      setMessages({ error: 'Failed to add expense', success: '' });
    } finally {
      setLoading(false);
      setTimeout(() => setMessages({ success: '', error: '' }), 3000);
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
        category={category}
        amount={amount}
        expenseDate={expenseDate}
        onCategoryChange={setCategory}
        onAmountChange={setAmount}
        onDateChange={setExpenseDate}
        onSubmit={handleAddExpense}
        formErrors={formErrors}
        categories={categories}
        loading={categoriesLoading}
        submitLoading={loading}
      />

      {/* Filter */}
      <ExpenseFilter filter={filter} setFilter={setFilter} categories={categories} />

      {/* Recent Expenses Table */}
      <RecentExpensesTable expenses={filteredExpenses} />

      {/* Category Breakdown Chart */}
      <CategoryBreakdownChart pieChartData={pieChartData} colors={colors} />
    </div>
  );
};

export default ExpenseTracker;
