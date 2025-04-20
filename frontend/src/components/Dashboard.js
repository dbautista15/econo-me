import React, { useState, useEffect } from 'react';
import { renderPieChart, renderLineChart, renderStackedBarChart } from './Charts';
import { calculateSavings, calculateBudgetStatus, preparePieChartData, prepareMonthlyBreakdownData } from '../utils/helpers';
import api from '../utils/api';
import { getIncome, getSavingsGoal, getSpendingLimit, saveIncome, saveSavingsGoal, saveSpendingLimit } from '../utils/storage';

const Dashboard = ({ onSuccessMessage, onErrorMessage }) => {
  // Local state for fetched data
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState(['Food', 'Transportation', 'Housing', 'Utilities', 'Entertainment']);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for user preferences with defaults from localStorage
  const [income, setIncome] = useState(getIncome());
  const [savingsGoal, setSavingsGoal] = useState(getSavingsGoal());
  const [spendingLimit, setSpendingLimit] = useState(getSpendingLimit());
  
  // States for editing preferences
  const [isEditingIncome, setIsEditingIncome] = useState(false);
  const [isEditingSavingsGoal, setIsEditingSavingsGoal] = useState(false);
  const [isEditingSpendingLimit, setIsEditingSpendingLimit] = useState(false);
  const [tempIncome, setTempIncome] = useState(income);
  const [tempSavingsGoal, setTempSavingsGoal] = useState(savingsGoal);
  const [tempSpendingLimit, setTempSpendingLimit] = useState(spendingLimit);
  
  // Add these state variables to Dashboard.js
  const [categoryBudgets, setCategoryBudgets] = useState({});

  // Add this function to manage category budgets (fixed from IncomeGoals.js)
  const updateCategoryBudget = async (category, amount) => {
    try {
      // Check if budget exists for this category
      const budgetsResponse = await api.get('/budgets');
      const budgets = budgetsResponse.data;
      const existingBudget = budgets.find(b => b.category === category);
      
      if (existingBudget) {
        // Update existing budget
        await api.put(`/budgets/${existingBudget.id}`, { limit: amount });
      } else {
        // Create new budget
        await api.post('/budgets', { category, limit: amount });
      }
      
      // Update local state
      setCategoryBudgets(prev => ({
        ...prev,
        [category]: parseFloat(amount)
      }));
      
      // Show success message if callback exists
      if (onSuccessMessage) {
        onSuccessMessage(`${category} budget updated successfully!`);
      }
      return true;
    } catch (error) {
      // Show error message if callback exists
      if (onErrorMessage) {
        onErrorMessage(`Error updating budget: ${error.message}`);
      }
      console.error('Error updating budget:', error);
      return false;
    }
  };
  
  // Fetch data when component mounts
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        try {
          const budgetsResponse = await api.get('/budgets');
          const budgets = budgetsResponse.data || [];
          
          // Convert to object structure like {Food: 100, Housing: 500}
          const categoryBudgetsMap = {};
          budgets.forEach(budget => {
            if (budget.category !== 'Total') {
              categoryBudgetsMap[budget.category] = parseFloat(budget.limit);
            }
          });
          
          setCategoryBudgets(categoryBudgetsMap);
        } catch (err) {
          console.error('Error fetching budgets:', err);
        }
        // Fetch expenses
        const expensesResponse = await api.get('/expenses');
        setExpenses(expensesResponse.data);
        
        // Fetch categories
        const categoriesResponse = await api.get('/categories');
        if (categoriesResponse.data && categoriesResponse.data.length > 0) {
          setCategories(categoriesResponse.data);
        }
        
        // Try to fetch income and savings goals from the database
        try {
          const incomesResponse = await api.get('/incomes');
          if (incomesResponse.data.length > 0) {
            // Get the most recent income entry
            const latestIncome = incomesResponse.data[0];
            setIncome(parseFloat(latestIncome.amount));
          }
          
          const savingsResponse = await api.get('/savings-goals');
          if (savingsResponse.data.length > 0) {
            // Get the most recent savings goal
            const latestGoal = savingsResponse.data[0];
            setSavingsGoal(parseFloat(latestGoal.target_amount));
          }
        } catch (err) {
          console.error('Error fetching user preferences:', err);
          // Fall back to localStorage if API calls fail
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load financial data. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  const handleSaveIncome = async () => {
    setLoading(true);
    try {
      const parsedIncome = parseFloat(tempIncome);
      if (!isNaN(parsedIncome) && parsedIncome >= 0) {
        // Save to the database via API
        await api.post('/incomes', { 
          source: 'Monthly Income', 
          amount: parsedIncome,
          date: new Date().toISOString()
        });
        
        // Also save to localStorage for backwards compatibility
        saveIncome(parsedIncome);
        
        // Update state
        setIncome(parsedIncome);
        setIsEditingIncome(false);
      }
    } catch (error) {
      console.error('Error saving income:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleSaveSavingsGoal = async () => {
    setLoading(true);
    try {
      const parsedGoal = parseFloat(tempSavingsGoal);
      if (!isNaN(parsedGoal) && parsedGoal >= 0) {
        // Save to the database via API
        await api.post('/savings-goals', {
          name: 'Monthly Savings',
          target_amount: parsedGoal,
          current_amount: savings,
          target_date: null
        });
        
        // Also save to localStorage for backwards compatibility
        saveSavingsGoal(parsedGoal);
        
        // Update state
        setSavingsGoal(parsedGoal);
        setIsEditingSavingsGoal(false);
      }
    } catch (error) {
      console.error('Error saving savings goal:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleSaveSpendingLimit = () => {
    const parsedLimit = parseFloat(tempSpendingLimit);
    if (!isNaN(parsedLimit) && parsedLimit >= 0) {
      setSpendingLimit(parsedLimit);
      saveSpendingLimit(parsedLimit);
      setIsEditingSpendingLimit(false);
    }
  };
  
  // Cancel functions for editing
  const handleCancelEdit = (editType) => {
    if (editType === 'income') {
      setTempIncome(income);
      setIsEditingIncome(false);
    } else if (editType === 'savingsGoal') {
      setTempSavingsGoal(savingsGoal);
      setIsEditingSavingsGoal(false);
    } else if (editType === 'spendingLimit') {
      setTempSpendingLimit(spendingLimit);
      setIsEditingSpendingLimit(false);
    }
  };
  
  // Show loading state
  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading your financial data...</div>;
  }
  
  // Show error state
  if (error) {
    return <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">{error}</div>;
  }
  
  // Calculate derived data
  const expensesByCategory = expenses.reduce((acc, expense) => {
    const { category, amount } = expense;
    acc[category] = (acc[category] || 0) + parseFloat(amount);
    return acc;
  }, {});
  
  const totalExpenses = Object.values(expensesByCategory).reduce((sum, value) => sum + value, 0);
  const savings = calculateSavings(income, totalExpenses);
  const savingsProgress = savingsGoal > 0 ? (savings / savingsGoal) * 100 : 0;
  const { budgetPercentage, isOverBudget } = calculateBudgetStatus(totalExpenses, spendingLimit);
  
  // Generate colors for categories
  const colors = categories.map(() => 
    `#${Math.floor(Math.random() * 16777215).toString(16)}`
  );
  
  const pieChartData = preparePieChartData(expensesByCategory);
  
  // Create monthly data from expenses
  const monthlyData = prepareMonthlyData(expenses);
  
  const monthlyBreakdownData = prepareMonthlyBreakdownData(expenses, categories);
  
  // MonthlyBreakdown sub-component 
  const MonthlyBreakdown = () => {
    return renderStackedBarChart(monthlyBreakdownData, categories, colors);
  };
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Summary Cards */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Financial Summary</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-blue-50 rounded-md">
            <h3 className="text-sm text-gray-500">Monthly/Weekly Income</h3>
            <div className="flex items-center">
              <p className="text-2xl font-bold text-gray-800">${income.toFixed(2)}</p>
              <button 
                onClick={() => {
                  setTempIncome(income);
                  setIsEditingIncome(true);
                }}
                className="ml-2 text-blue-600 hover:text-blue-800"
              >
                Edit
              </button>
            </div>
            {isEditingIncome && (
              <div className="mt-2">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={tempIncome}
                  onChange={(e) => setTempIncome(e.target.value)}
                  className="w-full p-1 border rounded"
                />
                <div className="flex mt-1">
                  <button 
                    onClick={handleSaveIncome}
                    className="bg-green-500 text-white px-2 py-1 rounded text-sm mr-1"
                  >
                    Save
                  </button>
                  <button 
                    onClick={() => handleCancelEdit('income')}
                    className="bg-gray-300 text-gray-800 px-2 py-1 rounded text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
          <div className="p-4 bg-blue-50 rounded-md">
            <h3 className="text-sm text-gray-500">Current Expenses</h3>
            <p className="text-2xl font-bold text-gray-800">${totalExpenses.toFixed(2)}</p>
          </div>
          <div className="p-4 bg-blue-50 rounded-md">
            <h3 className="text-sm text-gray-500"> Current Savings</h3>
            <p className="text-2xl font-bold text-gray-800">${savings.toFixed(2)}</p>
          </div>
          <div className="p-4 bg-blue-50 rounded-md">
            <h3 className="text-sm text-gray-500">Budget Status</h3>
            <div className="flex items-center">
              <p className={`text-2xl font-bold ${isOverBudget ? 'text-red-600' : 'text-green-600'}`}>
                {budgetPercentage.toFixed(0)}%
              </p>
              <button 
                onClick={() => {
                  setTempSpendingLimit(spendingLimit);
                  setIsEditingSpendingLimit(true);
                }}
                className="ml-2 text-blue-600 hover:text-blue-800"
              >
                Set Limit
              </button>
            </div>
            {isEditingSpendingLimit && (
              <div className="mt-2">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={tempSpendingLimit}
                  onChange={(e) => setTempSpendingLimit(e.target.value)}
                  className="w-full p-1 border rounded"
                />
                <div className="flex mt-1">
                  <button 
                    onClick={handleSaveSpendingLimit}
                    className="bg-green-500 text-white px-2 py-1 rounded text-sm mr-1"
                  >
                    Save
                  </button>
                  <button 
                    onClick={() => handleCancelEdit('spendingLimit')}
                    className="bg-gray-300 text-gray-800 px-2 py-1 rounded text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="mt-6">
          <div className="flex items-center">
            <h3 className="text-sm text-gray-500 mb-2">Savings Goal Progress</h3>
            <button 
              onClick={() => {
                setTempSavingsGoal(savingsGoal);
                setIsEditingSavingsGoal(true);
              }}
              className="ml-2 text-blue-600 hover:text-blue-800 mb-2"
            >
              Set Goal
            </button>
          </div>
          {isEditingSavingsGoal && (
            <div className="mb-2">
              <input
                type="number"
                min="0"
                step="0.01"
                value={tempSavingsGoal}
                onChange={(e) => setTempSavingsGoal(e.target.value)}
                className="w-full p-1 border rounded"
              />
              <div className="flex mt-1">
                <button 
                  onClick={handleSaveSavingsGoal}
                  className="bg-green-500 text-white px-2 py-1 rounded text-sm mr-1"
                >
                  Save
                </button>
                <button 
                  onClick={() => handleCancelEdit('savingsGoal')}
                  className="bg-gray-300 text-gray-800 px-2 py-1 rounded text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div
              className="bg-blue-600 h-4 rounded-full"
              style={{ width: `${Math.min(savingsProgress, 100)}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-600 mt-1">{savingsProgress.toFixed(0)}% of ${savingsGoal}</p>
        </div>
      </div>

      {/* Expense Distribution */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Expense Distribution</h2>
        {renderPieChart(pieChartData, colors)}
        <div className="mt-4">
          <h3 className="font-medium text-gray-700 mb-2">Category Breakdown:</h3>
          <ul className="space-y-2">
            {pieChartData.map((entry, index) => (
              <li key={index} className="flex justify-between">
                <span>{entry.name}</span>
                <span className="font-medium">${entry.value.toFixed(2)}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Monthly Trends */}
      <div className="bg-white p-6 rounded-lg shadow-md md:col-span-2">
        <h2 className="text-xl font-semibold mb-4">Monthly Trends</h2>
        {renderLineChart(monthlyData)}
      </div>

      {/* Monthly Expense Breakdown by Category */}
      <div className="bg-white p-6 rounded-lg shadow-md md:col-span-2 mt-6">
        <h2 className="text-xl font-semibold mb-4">Monthly Expense Breakdown by Category</h2>
        <MonthlyBreakdown />
      </div>
      
      {/* Category Budget Management */}
      <div className="bg-white p-6 rounded-lg shadow-md md:col-span-2 mt-6">
        <h2 className="text-xl font-semibold mb-4">Category Budget Management</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-2 text-left">Category</th>
                <th className="px-4 py-2 text-left">Current Spending</th>
                <th className="px-4 py-2 text-left">Monthly Budget</th>
                <th className="px-4 py-2 text-right">Status</th>
                <th className="px-4 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => {
                const spent = expensesByCategory[cat] || 0;
                const budget = categoryBudgets[cat] || 0;
                const percentage = budget > 0 ? (spent / budget) * 100 : 0;
                const status = percentage > 100 ? 'Over Budget' : percentage > 80 ? 'Near Limit' : 'On Track';
                const statusColor = percentage > 100 ? 'text-red-600' : percentage > 80 ? 'text-yellow-600' : 'text-green-600';

                return (
                  <tr key={cat} className="border-t">
                    <td className="px-4 py-3">{cat}</td>
                    <td className="px-4 py-3">${spent.toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        className="w-24 p-1 border border-gray-300 rounded"
                        value={categoryBudgets[cat] || 0}
                        onChange={(e) => {
                          const newBudgets = { ...categoryBudgets };
                          newBudgets[cat] = parseFloat(e.target.value) || 0;
                          setCategoryBudgets(newBudgets);
                        }}
                      />
                    </td>
                    <td className={`px-4 py-3 text-right ${statusColor} font-medium`}>
                      {status} ({percentage.toFixed(0)}%)
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                        onClick={() => updateCategoryBudget(cat, categoryBudgets[cat])}
                      >
                        Save
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Helper function to prepare monthly data from expenses
function prepareMonthlyData(expenses) {
  // Group expenses by month
  const monthlyExpenses = expenses.reduce((acc, expense) => {
    const date = new Date(expense.date);
    const month = date.toLocaleString('default', { month: 'short' });
    acc[month] = (acc[month] || 0) + parseFloat(expense.amount);
    return acc;
  }, {});

  // Convert to array format for chart
  return Object.entries(monthlyExpenses).map(([month, amount]) => ({
    month,
    amount
  }));
}

export default Dashboard;