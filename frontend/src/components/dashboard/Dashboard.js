/**
 * Dashboard Component
 * 
 * A comprehensive financial management interface that provides users with
 * real-time insights into their financial health through interactive
 * visualizations and data management capabilities.
 * 
 * Core Responsibilities:
 * - Data Management: Fetches, processes, and maintains financial data including 
 *   income, expenses, budgets, and savings goals
 * - Visualization: Renders financial data through various chart types (pie, line,
 *   bar, stacked bar) for intuitive analysis
 * - User Interaction: Processes user inputs for expense tracking, income updates,
 *   and financial goal setting
 * - State Management: Maintains a complex state architecture to track financial
 *   metrics and support filtering capabilities
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  calculateSavings,
  calculateBudgetStatus,
  getSuggestedLimit
} from '../../utils/helpers';
import LoadingSpinner from '../layout/LoadingSpinner';
import api from '../../utils/api';
import Alert from '../expensetracker/Alert';
// Import dashboard components
import FinancialSummary from './FinancialSummary';
import DataCleanup from '../admin/DataCleanup';
import ExpenseDistribution from './ExpenseDistribution';
import AddExpenseForm from './AddExpenseForm';
import FilterExpenses from './FilterExpenses';
import CategoryBudgetManager from './CategoryBudgetManager';
import FinancialInsights from './FinancialInsights';
import IncomeGoals from '../goals/IncomeGoals';

const Dashboard = () => {
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [income, setIncome] = useState(0);
  const [incomes, setIncomes] = useState([]);
  const [savingsGoal, setSavingsGoal] = useState(0);
  const [spendingLimit, setSpendingLimit] = useState(0);
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([
    'Food', 'Transportation', 'Housing', 'Utilities',
    'Entertainment', 'Healthcare', 'Dining Out', 'Shopping'
  ]);
  const [expensesByCategory, setExpensesByCategory] = useState({});
  const [categoryBudgets, setCategoryBudgets] = useState({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    startDate: '',
    endDate: '',
    category: 'All'
  });
  const [newExpense, setNewExpense] = useState({
    category: '',
    amount: '',
    date: new Date().toISOString().split('T')[0]
  });


  const fetchIncomes = useCallback(async () => {
    try {
      const res = await api.get('/incomes');
      const data = res.data || [];
      setIncomes(data);

      const totalIncome = data.reduce((sum, entry) => sum + Number(entry.amount), 0);
      setIncome(totalIncome);
    } catch (err) {
      console.error('Error fetching incomes:', err);
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [expensesRes, categoriesRes, incomesRes, budgetsRes] = await Promise.all([
          api.get('/expenses'),
          api.get('/categories'),
          api.get('/incomes'),
          api.get('/budgets')
        ]);

        // Process expenses
        const fetchedExpenses = expensesRes.data || [];
        setExpenses(fetchedExpenses);

        // Calculate expenses by category
        const expByCat = {};
        fetchedExpenses.forEach(exp => {
          expByCat[exp.category] = (expByCat[exp.category] || 0) + parseFloat(exp.amount);
        });
        setExpensesByCategory(expByCat);

        // Set categories
        setCategories(categoriesRes.data || []);

        // Process incomes
        setIncomes(incomesRes.data || []);
        const totalIncome = incomesRes.data?.reduce((sum, i) => sum + Number(i.amount), 0) || 0;
        setIncome(totalIncome);

        // Process budgets
        const budgets = budgetsRes.data || [];
        const totalBudget = budgets.find(b => b.category === 'Total');
        if (totalBudget) setSpendingLimit(parseFloat(totalBudget.limit_amount));

        const catBudgets = {};
        budgets.forEach(b => {
          if (b.category !== 'Total') catBudgets[b.category] = parseFloat(b.limit_amount);
        });
        setCategoryBudgets(catBudgets);

        // Fetch savings goals
        const savingsRes = await api.get('/savings-goals');
        if (savingsRes.data?.length > 0) {
          setSavingsGoal(parseFloat(savingsRes.data[0].target_amount));
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);


  const totalExpenses = Object.values(expensesByCategory).reduce((sum, val) => sum + val, 0);
  const savings = calculateSavings(income, totalExpenses);
  const savingsProgress = savingsGoal > 0 ? (savings / savingsGoal) * 100 : 0;
  const { budgetPercentage, isOverBudget } = calculateBudgetStatus(totalExpenses, spendingLimit);
  const suggestion = getSuggestedLimit(incomes);

  // Color palette for charts
  const colors = categories.map((_, i) => {
    const hue = (i * 137) % 360;
    return `hsl(${hue}, 70%, 50%)`;
  });



  const filteredExpenses = expenses.filter(exp => {
    if (filter.category !== 'All' && exp.category !== filter.category) return false;
    if (filter.startDate && new Date(exp.date) < new Date(filter.startDate)) return false;
    if (filter.endDate && new Date(exp.date) > new Date(filter.endDate)) return false;
    return true;
  });


  const handleSaveIncome = async (value) => {
    try {
      await api.post('/incomes', {
        source: 'Monthly Income',
        amount: parseFloat(value),
        income_date: new Date().toISOString()
      });

      await fetchIncomes();
    } catch (err) {
      console.error('Error updating income:', err);
    }
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!newExpense.category || !newExpense.amount) return;

    try {
      const response = await api.post('/expenses', {
        category: newExpense.category,
        amount: parseFloat(newExpense.amount),
        date: newExpense.date
      });

      setExpenses([response.data.expense, ...expenses]);
      setExpensesByCategory(prev => ({
        ...prev,
        [newExpense.category]: (prev[newExpense.category] || 0) + parseFloat(newExpense.amount)
      }));

      setNewExpense({
        category: categories[0] || '',
        amount: '',
        date: new Date().toISOString().split('T')[0]
      });
    } catch (err) {
      console.error('Error adding expense:', err);
    }
  };

  const handleSaveSavingsGoal = async (value) => {
    try {
      await api.post('/savings-goals', {
        name: 'Monthly Savings',
        target_amount: parseFloat(value),
        current_amount: calculateSavings(income, totalExpenses),
        target_date: null
      });
      setSavingsGoal(parseFloat(value));
    } catch (err) {
      console.error('Error updating savings goal:', err);
    }
  };

  const handleAddIncomeEntry = async (amount, date) => {
    try {
      await api.post('/incomes', {
        source: 'User Income',
        amount: parseFloat(amount),
        income_date: date
      });
      await fetchIncomes();
      return true;
    } catch (error) {
      console.error('Failed to add income:', error);
      return false;
    }
  };
  const handleDeleteIncome = async (id) => {

    try {
      await api.delete(`/incomes/${id}`);
      fetchIncomes();
    } catch (err) {
      console.error('Error deleting income:', err);
    }
  };
  const handleUpdateCategoryBudget = (category, amount) => {
    const newBudgets = { ...categoryBudgets };
    newBudgets[category] = parseFloat(amount) || 0;
    setCategoryBudgets(newBudgets);
  };

  const handleBudgetChange = (category, newValue) => {
    const updatedBudgets = { ...categoryBudgets, [category]: newValue };
    setCategoryBudgets(updatedBudgets);
  };


  if (loading) return <LoadingSpinner />;

  return (
    <div className="container mx-auto p-4">
      {successMessage && <Alert type="success" message={successMessage} />}
      {errorMessage && <Alert type="error" message={errorMessage} />}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Financial Insights */}
        <FinancialInsights
          expensesByCategory={expensesByCategory}
          totalExpenses={totalExpenses}
          income={income}
          savings={savings}
          isOverBudget={isOverBudget}
          spendingLimit={spendingLimit}
          suggestion={suggestion}
          onApplySuggestion={(limit) => setSpendingLimit(limit)}
        />
        {/* Expense Distribution */}
        <ExpenseDistribution
          expensesByCategory={expensesByCategory}
          colors={colors}
          totalExpenses={totalExpenses}
        />
        <CategoryBudgetManager
          categories={categories}
          expensesByCategory={expensesByCategory}
          categoryBudgets={categoryBudgets}
          colors={colors}
          onUpdateBudget={handleBudgetChange}
          onSaveBudget={handleUpdateCategoryBudget}
        />

        {/* Financial Summary */}
        <FinancialSummary
          income={income}
          totalExpenses={totalExpenses}
          savings={savings}
          budgetPercentage={budgetPercentage}
          isOverBudget={isOverBudget}
          savingsProgress={savingsProgress}
          savingsGoal={savingsGoal}
          incomes={incomes}
          onAddIncome={handleAddIncomeEntry}
          onDeleteIncome={handleDeleteIncome}


        />
        {/*Income Goals*/}
        <IncomeGoals/>
        {/* Add Expense, Delete Expenses, and Filter Expenses */}
        <div className="col-span-1 md:col-span-2 bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Manage Financials</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Add New Expense */}
            <AddExpenseForm
              categories={categories}
              newExpense={newExpense}
              setNewExpense={setNewExpense}
              onAddExpense={handleAddExpense}
            />
            {/* Delete Expense */}
            <DataCleanup
              onSuccess={successMessage}
              onError={errorMessage}
            />
            {/* Filter Expenses */}
            <FilterExpenses
              filter={filter}
              setFilter={setFilter}
              categories={categories}
              filteredExpenses={filteredExpenses}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;