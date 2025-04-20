import React, { useState, useEffect } from 'react';
import { renderPieChart, renderLineChart, renderBarChart, renderStackedBarChart } from './Charts';
import { calculateSavings, calculateBudgetStatus, preparePieChartData } from '../utils/helpers';
import { Header, Navigation, Footer } from './Layout';
import LoadingSpinner from './LoadingSpinner';
import api from '../utils/api';

const Dashboard = () => {
  // State for storing data
  const [income, setIncome] = useState(0);
  const [savingsGoal, setSavingsGoal] = useState(0);
  const [spendingLimit, setSpendingLimit] = useState(0);
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [expensesByCategory, setExpensesByCategory] = useState({});
  const [categoryBudgets, setCategoryBudgets] = useState({});
  const [loading, setLoading] = useState(true);
  const [newExpense, setNewExpense] = useState({
    category: '',
    amount: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [filter, setFilter] = useState({
    startDate: '',
    endDate: '',
    category: 'All'
  });

  // Fetch data when component mounts
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch expenses, categories, income, budgets
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
        fetchedExpenses.forEach(expense => {
          if (!expByCat[expense.category]) {
            expByCat[expense.category] = 0;
          }
          expByCat[expense.category] += parseFloat(expense.amount);
        });
        setExpensesByCategory(expByCat);

        // Set categories
        setCategories(categoriesRes.data || ['Food', 'Transportation', 'Housing', 'Utilities', 'Entertainment']);

        // Set income
        if (incomesRes.data && incomesRes.data.length > 0) {
          setIncome(parseFloat(incomesRes.data[0].amount));
        }

        // Set budgets
        const budgets = budgetsRes.data || [];
        const totalBudget = budgets.find(b => b.category === 'Total');
        if (totalBudget) {
          setSpendingLimit(parseFloat(totalBudget.limit_amount));
        }

        // Set category budgets
        const catBudgets = {};
        budgets.forEach(budget => {
          if (budget.category !== 'Total') {
            catBudgets[budget.category] = parseFloat(budget.limit_amount);
          }
        });
        setCategoryBudgets(catBudgets);

        // Get savings goal if exists
        try {
          const savingsRes = await api.get('/savings-goals');
          if (savingsRes.data && savingsRes.data.length > 0) {
            setSavingsGoal(parseFloat(savingsRes.data[0].target_amount));
          }
        } catch (err) {
          console.error('Error fetching savings goal:', err);
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Calculate derived data
  const totalExpenses = Object.values(expensesByCategory).reduce((sum, val) => sum + val, 0);
  const savings = calculateSavings(income, totalExpenses);
  const savingsProgress = savingsGoal > 0 ? (savings / savingsGoal) * 100 : 0;
  const { budgetPercentage, isOverBudget } = calculateBudgetStatus(totalExpenses, spendingLimit);
  
  // Generate chart colors
  const colors = categories.map((_, i) => {
    const hue = (i * 137) % 360; // Golden ratio distribution
    return `hsl(${hue}, 70%, 50%)`;
  });

  // Handle adding new expense
  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!newExpense.category || !newExpense.amount) return;

    try {
      const response = await api.post('/expenses', {
        category: newExpense.category,
        amount: parseFloat(newExpense.amount),
        date: newExpense.date
      });

      // Update local state
      setExpenses([response.data.expense, ...expenses]);
      
      // Update expenses by category
      setExpensesByCategory(prev => ({
        ...prev,
        [newExpense.category]: (prev[newExpense.category] || 0) + parseFloat(newExpense.amount)
      }));

      // Reset form
      setNewExpense({
        category: categories[0] || '',
        amount: '',
        date: new Date().toISOString().split('T')[0]
      });
    } catch (err) {
      console.error('Error adding expense:', err);
    }
  };

  // Handle saving income
  const handleSaveIncome = async (value) => {
    try {
      await api.post('/incomes', {
        source: 'Monthly Income',
        amount: parseFloat(value),
        date: new Date().toISOString()
      });
      setIncome(parseFloat(value));
    } catch (err) {
      console.error('Error updating income:', err);
    }
  };

  // Handle saving savings goal
  const handleSaveSavingsGoal = async (value) => {
    try {
      await api.post('/savings-goals', {
        name: 'Monthly Savings',
        target_amount: parseFloat(value),
        current_amount: savings,
        target_date: null
      });
      setSavingsGoal(parseFloat(value));
    } catch (err) {
      console.error('Error updating savings goal:', err);
    }
  };

  // Filter expenses
  const filteredExpenses = expenses.filter(expense => {
    if (filter.category !== 'All' && expense.category !== filter.category) return false;
    if (filter.startDate && new Date(expense.expense_date) < new Date(filter.startDate)) return false;
    if (filter.endDate && new Date(expense.expense_date) > new Date(filter.endDate)) return false;
    return true;
  });

  if (loading) return <LoadingSpinner />;

  return (
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Financial Summary Card */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Financial Summary</h2>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <h3 className="text-sm text-gray-500">Monthly Income</h3>
              <div className="flex items-center">
                <p className="text-2xl font-bold">${income.toFixed(2)}</p>
                <button className="ml-2 text-blue-600 hover:text-blue-800 text-sm">
                  Edit
                </button>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm text-gray-500">Current Expenses</h3>
              <div className="flex items-center">
                <p className="text-2xl font-bold">${totalExpenses.toFixed(2)}</p>
                <button className="ml-2 text-blue-600 hover:text-blue-800 text-sm">
                  Add
                </button>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm text-gray-500">Current Savings</h3>
              <p className="text-2xl font-bold">${savings.toFixed(2)}</p>
            </div>
            
            <div>
              <h3 className="text-sm text-gray-500">Budget Status</h3>
              <p className={`text-2xl font-bold ${isOverBudget ? 'text-red-600' : 'text-green-600'}`}>
                {budgetPercentage.toFixed(0)}%
              </p>
            </div>
          </div>
          
          <div>
            <div className="flex items-center mb-2">
              <h3 className="text-sm text-gray-500">Savings Goal Progress</h3>
              <button className="ml-2 text-blue-600 hover:text-blue-800 text-sm">
                Edit
              </button>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className={`h-4 rounded-full ${
                  savingsProgress >= 100 ? 'bg-green-500' : 'bg-blue-600'
                }`}
                style={{ width: `${Math.min(savingsProgress, 100)}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              ${savings.toFixed(2)} / ${savingsGoal.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Expense Distribution */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Expense Distribution</h2>
          {Object.keys(expensesByCategory).length > 0 ? (
            renderPieChart(preparePieChartData(expensesByCategory), colors)
          ) : (
            <div className="flex justify-center items-center h-64 text-gray-500">
              No expense data to display
            </div>
          )}
        </div>

        {/* Financial Insights */}
        <div className="bg-white p-6 rounded-lg shadow-md md:col-span-2">
          <h2 className="text-xl font-semibold mb-4">Financial Insights</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-md">
              <h3 className="font-medium text-gray-700">Spending Breakdown</h3>
              <p className="mt-2">
                Your largest expense category is 
                {Object.entries(expensesByCategory).length > 0 ? 
                  Object.entries(expensesByCategory)
                    .sort((a, b) => b[1] - a[1])[0][0] : 'none'} 
                at {Object.entries(expensesByCategory).length > 0 ? 
                  ((Object.entries(expensesByCategory)
                    .sort((a, b) => b[1] - a[1])[0][1] / totalExpenses) * 100).toFixed(0) : 0}% 
                of total spending.
              </p>
            </div>
            
            <div className="p-4 bg-blue-50 rounded-md">
              <h3 className="font-medium text-gray-700">Savings Rate</h3>
              <p className="mt-2">
                You're saving {income > 0 ? ((savings / income) * 100).toFixed(0) : 0}% 
                of your income. {
                  income > 0 && ((savings / income) * 100) >= 20 
                    ? 'Great job!' 
                    : 'Consider increasing your savings rate to 20%.'
                }
              </p>
            </div>
            
            <div className="p-4 bg-blue-50 rounded-md">
              <h3 className="font-medium text-gray-700">Budget Status</h3>
              <p className="mt-2">
                {isOverBudget
                  ? `You are $${(totalExpenses - spendingLimit).toFixed(2)} over your budget.`
                  : `You are $${(spendingLimit - totalExpenses).toFixed(2)} under your budget.`}
              </p>
            </div>
          </div>
        </div>

        {/* Monthly Expense Breakdown */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Monthly Expense Breakdown</h2>
          {Object.keys(expensesByCategory).length > 0 ? (
            renderBarChart(preparePieChartData(expensesByCategory), colors)
          ) : (
            <div className="flex justify-center items-center h-64 text-gray-500">
              No expense data to display
            </div>
          )}
        </div>

        {/* Monthly Trends */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Monthly Trends</h2>
          {expenses.length > 0 ? (
            renderLineChart([
              { name: 'Jan', income: income, expenses: totalExpenses },
              { name: 'Feb', income: income, expenses: totalExpenses * 0.9 },
              { name: 'Mar', income: income, expenses: totalExpenses * 1.1 },
              { name: 'Apr', income: income, expenses: totalExpenses * 0.95 },
            ])
          ) : (
            <div className="flex justify-center items-center h-64 text-gray-500">
              No trend data to display
            </div>
          )}
        </div>

        {/* Add New Expense */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Add New Expense</h2>
          <form onSubmit={handleAddExpense}>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2" htmlFor="category">
                Category
              </label>
              <select
                id="category"
                className="w-full p-2 border border-gray-300 rounded-md"
                value={newExpense.category}
                onChange={(e) => setNewExpense({...newExpense, category: e.target.value})}
                required
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 mb-2" htmlFor="amount">
                Amount ($)
              </label>
              <input
                id="amount"
                type="number"
                min="0.01"
                step="0.01"
                className="w-full p-2 border border-gray-300 rounded-md"
                value={newExpense.amount}
                onChange={(e) => setNewExpense({...newExpense, amount: e.target.value})}
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 mb-2" htmlFor="date">
                Date
              </label>
              <input
                id="date"
                type="date"
                className="w-full p-2 border border-gray-300 rounded-md"
                value={newExpense.date}
                onChange={(e) => setNewExpense({...newExpense, date: e.target.value})}
                required
              />
            </div>
            
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md"
            >
              Add Expense
            </button>
          </form>
        </div>

        {/* Filter Expenses */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Filter Expenses</h2>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="filterCategory">
              Category
            </label>
            <select
              id="filterCategory"
              className="w-full p-2 border border-gray-300 rounded-md"
              value={filter.category}
              onChange={(e) => setFilter({...filter, category: e.target.value})}
            >
              <option value="All">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-gray-700 mb-2" htmlFor="startDate">
                Start Date
              </label>
              <input
                id="startDate"
                type="date"
                className="w-full p-2 border border-gray-300 rounded-md"
                value={filter.startDate}
                onChange={(e) => setFilter({...filter, startDate: e.target.value})}
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-2" htmlFor="endDate">
                End Date
              </label>
              <input
                id="endDate"
                type="date"
                className="w-full p-2 border border-gray-300 rounded-md"
                value={filter.endDate}
                onChange={(e) => setFilter({...filter, endDate: e.target.value})}
              />
            </div>
          </div>
          
          <div className="overflow-auto max-h-64">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left">Date</th>
                  <th className="px-4 py-2 text-left">Category</th>
                  <th className="px-4 py-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {filteredExpenses.length > 0 ? (
                  filteredExpenses.map((expense, index) => (
                    <tr key={index} className="border-t">
                      <td className="px-4 py-2">
                        {new Date(expense.expense_date).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-2">{expense.category}</td>
                      <td className="px-4 py-2 text-right">${parseFloat(expense.amount).toFixed(2)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="px-4 py-2 text-center text-gray-500">
                      No expenses found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Spending by Category */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Spending by Category</h2>
          <div className="space-y-4">
            {Object.entries(expensesByCategory).map(([category, amount], index) => (
              <div key={index}>
                <div className="flex justify-between mb-1">
                  <span>{category}</span>
                  <span>${amount.toFixed(2)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full"
                    style={{ 
                      width: `${(amount / totalExpenses) * 100}%`,
                      backgroundColor: colors[index % colors.length]
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Category Budget Management */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Category Budget Management</h2>
          <div className="space-y-4">
            {categories.map((category, index) => {
              const spent = expensesByCategory[category] || 0;
              const budget = categoryBudgets[category] || 0;
              const percentage = budget > 0 ? (spent / budget) * 100 : 0;
              
              return (
                <div key={index}>
                  <div className="flex justify-between mb-1">
                    <span>{category}</span>
                    <div className="flex items-center space-x-2">
                      <span>${spent.toFixed(2)} / </span>
                      <input
                        type="number"
                        min="0"
                        step="10"
                        className="w-20 p-1 border border-gray-300 rounded"
                        value={budget}
                        onChange={(e) => {
                          const newBudgets = { ...categoryBudgets };
                          newBudgets[category] = parseFloat(e.target.value) || 0;
                          setCategoryBudgets(newBudgets);
                        }}
                      />
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        percentage > 100 
                          ? 'bg-red-500' 
                          : percentage > 80 
                            ? 'bg-yellow-500' 
                            : 'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;