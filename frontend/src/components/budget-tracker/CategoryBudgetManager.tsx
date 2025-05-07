import React, { useState, useEffect, useCallback } from 'react';
import api from '../../utils/api';
import { renderBarChart, renderLineChart } from '../layout/ui/Charts';
import { chartUtils } from '../../utils/chartUtils';
import { transformations } from '../../utils/transformations';
import { LoadingSpinner } from '../layout/ui/LoadingSpinner';
import { LineChartDataPoint } from '../../../../types';
import { LineChart } from 'recharts';

export interface CategoryBudgetManagerProps {
  onSuccess?: (message: string) => void;
  onError?: (message: string) => void;
  refreshData?: () => void;
}

export const CategoryBudgetManager: React.FC<CategoryBudgetManagerProps> = ({
  onSuccess,
  onError
}) => {
  // State management
  const [categories, setCategories] = useState<string[]>([]);
  const [expensesByCategory, setExpensesByCategory] = useState<Record<string, number>>({});
  const [categoryBudgets, setCategoryBudgets] = useState<Record<string, number>>({});
  const [budgetObjects, setBudgetObjects] = useState<any[]>([]);
  const [editedBudgets, setEditedBudgets] = useState<Record<string, number>>({});
  const [activeTab, setActiveTab] = useState<'chart' | 'budget'>('chart');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [deleteConfirmCategory, setDeleteConfirmCategory] = useState<string | null>(null);
  const [monthlyData, setMonthlyData] = useState<LineChartDataPoint[]>([]);

  // Generate colors for the chart
  const chartColors = chartUtils.generateCategoryColors(categories);

  // Format monthly income and expense data for the line chart
  const prepareMonthlyComparisonData = (expenses: any[], incomes: any[]): LineChartDataPoint[] => {
    const monthlyExpenses: Record<string, number> = {};
    const monthlyIncomes: Record<string, number> = {};

    // Process expenses
    expenses.forEach(expense => {
      const date = new Date(expense.expense_date);
      if (!isNaN(date.getTime())) {
        const month = date.toLocaleString('default', { month: 'short' });
        monthlyExpenses[month] = (monthlyExpenses[month] || 0) + transformations.parseAmount(expense.amount);
      }
    });

    // Process incomes
    incomes.forEach(income => {
      const date = new Date(income.income_date);
      if (!isNaN(date.getTime())) {
        const month = date.toLocaleString('default', { month: 'short' });
        monthlyIncomes[month] = (monthlyIncomes[month] || 0) + transformations.parseAmount(income.amount);
      }
    });

    // Combine data and sort by month
    const allMonths: string[] = [];

    // Add months from expenses
    Object.keys(monthlyExpenses).forEach(month => {
      if (allMonths.indexOf(month) === -1) {
        allMonths.push(month);
      }
    });

    // Add months from incomes
    Object.keys(monthlyIncomes).forEach(month => {
      if (allMonths.indexOf(month) === -1) {
        allMonths.push(month);
      }
    });

    // Define month order for consistent display
    const monthOrder = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];

    return allMonths
      .sort((a, b) => monthOrder.indexOf(a) - monthOrder.indexOf(b))
      .map(month => ({
        name: month,
        expenses: monthlyExpenses[month] || 0,
        income: monthlyIncomes[month] || 0
      }));
  };

  // Fetch data from API
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch categories
      const categoriesData = await api.get<string[]>('/categories');
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);

      // Fetch expenses
      const expensesData = await api.get<any[]>('/expenses');

      // Calculate expenses by category
      if (Array.isArray(expensesData)) {
        const byCategory: Record<string, number> = {};
        expensesData.forEach(expense => {
          const cat = expense.category || 'Uncategorized';
          byCategory[cat] = (byCategory[cat] || 0) + transformations.parseAmount(expense.amount);
        });
        setExpensesByCategory(byCategory);

        // Fetch income data for the line chart
        const incomesData = await api.get<any[]>('/incomes');

        // Prepare monthly comparison data
        if (Array.isArray(incomesData)) {
          const monthlyComparisonData = prepareMonthlyComparisonData(expensesData, incomesData);
          setMonthlyData(monthlyComparisonData);
        }
      }

      // Fetch budget limits
      const budgetsData = await api.get<any[]>('/budgets');

      // Store raw budget objects for update/delete operations
      if (Array.isArray(budgetsData)) {
        // Filter out the Total budget
        const categoryBudgets = budgetsData.filter(b => b.category !== 'Total');
        setBudgetObjects(categoryBudgets);

        // Process budget data into a more usable format
        const budgets: Record<string, number> = {};
        categoryBudgets.forEach(budget => {
          // Handle both limit_amount (from DB) or limit (expected by API)
          const budgetAmount = budget.limit_amount !== undefined ? budget.limit_amount : budget.limit;
          budgets[budget.category] = transformations.parseAmount(budgetAmount);
        });
        setCategoryBudgets(budgets);
        setEditedBudgets(budgets);
      }
    } catch (err) {
      console.error('Error fetching category budget data:', err);
      setError('Failed to load budget data');
      if (onError) onError('Failed to load budget data');
    } finally {
      setLoading(false);
    }
  }, [onError]);

  // Initial data load
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Use chartUtils to prepare data consistently
  const chartData = chartUtils.prepareCategoryData(categories, expensesByCategory);

  // Handle budget changes
  const handleBudgetChange = (cat: string, val: string) => {
    const num = transformations.parseAmount(val);
    if (!isNaN(num)) {
      setEditedBudgets(prev => ({ ...prev, [cat]: num }));
    }
  };

  // Save a single budget
  const handleSaveBudget = async (category: string) => {
    if (editedBudgets[category] === undefined) return;

    setLoading(true);
    setError(null);

    try {
      const amount = editedBudgets[category];
      // Find if budget already exists
      const existingBudget = budgetObjects.find(b => b.category === category);

      if (existingBudget) {
        // Update existing budget - IMPORTANT: Change limit_amount to limit
        console.log(`Updating budget for ${category} with amount ${amount}`);
        await api.put(`/budgets/${existingBudget.id}`, {
          category,
          limit: amount  // Changed from limit_amount to limit
        });
      } else {
        // Create new budget - IMPORTANT: Change limit_amount to limit
        console.log(`Creating new budget for ${category} with amount ${amount}`);
        await api.post('/budgets', {
          category,
          limit: amount  // Changed from limit_amount to limit
        });
      }

      // Show success message
      const message = `Budget for ${category} saved successfully`;
      setSuccessMessage(message);
      if (onSuccess) onSuccess(message);
      setTimeout(() => setSuccessMessage(null), 3000);

      // Refresh data
      fetchData();
    } catch (err) {
      console.error(`Error saving budget for ${category}:`, err);
      const errorMessage = `Failed to save budget for ${category}`;
      setError(errorMessage);
      if (onError) onError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Save all budgets
  const handleSaveAllBudgets = async () => {
    setLoading(true);
    setError(null);

    try {
      let savedCount = 0;

      // Process each budget
      for (const [category, amount] of Object.entries(editedBudgets)) {
        // Skip categories with no budget set
        if (amount === undefined) continue;

        // Find existing budget
        const existingBudget = budgetObjects.find(b => b.category === category);

        try {
          if (existingBudget) {
            // Update existing budget - IMPORTANT: Change limit_amount to limit
            await api.put(`/budgets/${existingBudget.id}`, {
              category,
              limit: amount  // Changed from limit_amount to limit
            });
          } else {
            // Create new budget - IMPORTANT: Change limit_amount to limit
            await api.post('/budgets', {
              category,
              limit: amount  // Changed from limit_amount to limit
            });
          }
          savedCount++;
        } catch (err) {
          console.error(`Error saving budget for ${category}:`, err);
        }
      }

      // Show success message
      const message = savedCount > 0
        ? `Successfully saved ${savedCount} budget${savedCount > 1 ? 's' : ''}`
        : 'No budgets saved';
      setSuccessMessage(message);
      if (onSuccess) onSuccess(message);

      // Refresh data
      fetchData();
    } catch (err) {
      console.error('Error saving budgets:', err);
      const errorMessage = 'Failed to save budgets';
      setError(errorMessage);
      if (onError) onError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Delete a budget
  const handleDeleteBudget = async (category: string) => {
    setLoading(true);
    setError(null);

    try {
      // Find the budget ID
      const budget = budgetObjects.find(b => b.category === category);

      if (budget) {
        // Delete the budget
        await api.delete(`/budgets/${budget.id}`);

        // Update local state
        const updatedBudgets = { ...categoryBudgets };
        delete updatedBudgets[category];
        setCategoryBudgets(updatedBudgets);

        const updatedEditedBudgets = { ...editedBudgets };
        delete updatedEditedBudgets[category];
        setEditedBudgets(updatedEditedBudgets);

        // Show success message
        const message = `Budget for ${category} deleted successfully`;
        setSuccessMessage(message);
        if (onSuccess) onSuccess(message);

        // Refresh data
        fetchData();
      }
    } catch (err) {
      console.error(`Error deleting budget for ${category}:`, err);
      const errorMessage = `Failed to delete budget for ${category}`;
      setError(errorMessage);
      if (onError) onError(errorMessage);
    } finally {
      setLoading(false);
      setDeleteConfirmCategory(null);
    }
  };

  // Calculate spending vs budget percentages
  const getCategoryBudgetPercentage = (category: string): number => {
    const spent = expensesByCategory[category] || 0;
    const budget = editedBudgets[category] || 0;

    if (budget === 0) return 0;
    return Math.min(100, Math.round((spent / budget) * 100));
  };

  // Get status color based on percentage of budget used
  const getBudgetStatusColor = (percentage: number): string => {
    if (percentage >= 100) return 'bg-red-500';
    if (percentage >= 85) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  if (loading && categories.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      {/* Error and Success Messages */}
      {error && (
        <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
          {successMessage}
        </div>
      )}

      <div className="flex border-b mb-4">
        {['chart', 'budget'].map(tab => (
          <button
            key={tab}
            className={`px-4 py-2 font-medium ${activeTab === tab ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
            onClick={() => setActiveTab(tab as 'chart' | 'budget')}
          >
            {tab === 'chart' ? 'Income vs Expenses' : 'Budget Management'}
          </button>
        ))}
      </div>

      {activeTab === 'chart' ? (
        <div>
          <div className="mb-4">
            <p className="text-sm text-gray-600">
              This chart shows your monthly income compared to your expenses, helping you track your spending habits over time.
            </p>
          </div>
          <div className="h-64">
            {monthlyData.length > 0 ? (
              renderLineChart(monthlyData)
            ) : (
              <div className="flex h-full items-center justify-center">
                <p className="text-gray-500">No income or expense data to display</p>
              </div>
            )}
          </div>
          <div className="mt-4 text-xs text-gray-500 flex justify-between">
            <div>
              <span className="inline-block w-3 h-3 bg-[#8884d8] mr-1"></span>
              <span>Income</span>
            </div>
            <div>
              <span className="inline-block w-3 h-3 bg-[#82ca9d] mr-1"></span>
              <span>Expenses</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="mt-2 mb-4">
            <p className="text-sm text-gray-600">
              Set budget limits for each spending category. Progress bars show how much of each budget has been used. For a better experience use the tab key on your keyboard to fill out the budgets!
            </p>
          </div>

          {categories.length === 0 ? (
            <p className="text-gray-500">No categories available</p>
          ) : (
            categories.map((category) => {
              // Skip the "Total" category as it's handled separately
              if (category === "Total") return null;

              const spent = expensesByCategory[category] || 0;
              const budget = editedBudgets[category] || 0;
              const percentage = getCategoryBudgetPercentage(category);
              const existingBudget = budgetObjects.find(b => b.category === category);

              return (
                <div key={category} className="border rounded-lg p-4 shadow-sm">
                  {deleteConfirmCategory === category ? (
                    <div className="bg-red-50 p-3 rounded mb-3">
                      <p className="text-red-700 mb-2">Are you sure you want to delete this budget?</p>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleDeleteBudget(category)}
                          className="bg-red-600 hover:bg-red-700 text-white py-1 px-3 rounded text-sm"
                          disabled={loading}
                        >
                          Yes, Delete
                        </button>
                        <button
                          onClick={() => setDeleteConfirmCategory(null)}
                          className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-1 px-3 rounded text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : null}

                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium">{category}</h3>
                    <div className="flex items-center">
                      <span className="text-sm text-gray-500 mr-2">
                        ${transformations.formatCurrency(spent)} of ${transformations.formatCurrency(budget || 0)}
                      </span>
                      <input
                        type="number"
                        className="w-24 border rounded-md py-1 px-2 text-sm"
                        value={editedBudgets[category] || ''}
                        onChange={(e) => handleBudgetChange(category, e.target.value)}
                        placeholder="Set budget"
                        min="0"
                        step="5"
                      />
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className={`${getBudgetStatusColor(percentage)} h-2.5 rounded-full`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>

                  <div className="flex justify-between mt-1">
                    <span className="text-xs text-gray-500">
                      {percentage >= 100 ? 'Over budget!' : `${percentage}% used`}
                    </span>
                    <span className="text-xs text-gray-500">
                      {budget > 0 ? `$${transformations.formatCurrency(Math.max(0, budget - spent))} remaining` : ''}
                    </span>
                  </div>

                  {/* Individual budget actions */}
                  <div className="flex justify-end mt-2 pt-2 border-t border-gray-100">
                    <button
                      onClick={() => handleSaveBudget(category)}
                      className="text-blue-600 hover:text-blue-800 text-xs mr-3"
                      disabled={loading}
                    >
                      Save
                    </button>

                    {existingBudget && (
                      <button
                        onClick={() => setDeleteConfirmCategory(category)}
                        className="text-red-600 hover:text-red-800 text-xs"
                        disabled={loading}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}

          {categories.length > 0 && (
            <div className="flex justify-end mt-4">
              <button
                onClick={handleSaveAllBudgets}
                className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save All Budgets'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CategoryBudgetManager;