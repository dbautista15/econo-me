import React, { useState } from 'react';
import { renderBarChart } from '../ui/Charts';

/**
 * CategoryManagement - A component that combines category visualization and budget management
 * 
 * @param {Object} props
 * @param {Array} props.categories - List of expense categories
 * @param {Object} props.expensesByCategory - Expenses grouped by category
 * @param {Object} props.categoryBudgets - Budget amounts for each category
 * @param {Array} props.colors - Colors for chart visualization
 * @param {Function} props.onUpdateBudget - Callback for budget updates
 * @param {Function} props.onSaveBudget - Callback when saving budget to backend
 */
const CategoryBudgetManager = ({
  categories = [],
  expensesByCategory = {},
  categoryBudgets = {},
  colors = [],
  onUpdateBudget,
  onSaveBudget
}) => {
  // Local state for managing temporary budget changes
  const [editedBudgets, setEditedBudgets] = useState({...categoryBudgets});
  const [activeTab, setActiveTab] = useState('chart'); // 'chart' or 'budget'

  // Prepare data for the bar chart
  const pieChartData = Object.keys(expensesByCategory).map(category => ({
    name: category,
    value: expensesByCategory[category]
  }));

  // Handle local budget changes
  const handleBudgetChange = (category, value) => {
    const newValue = parseFloat(value) || 0;
    const updatedBudgets = {
      ...editedBudgets,
      [category]: newValue
    };
    setEditedBudgets(updatedBudgets);
    
    // Optionally update parent component state immediately
    if (onUpdateBudget) {
      onUpdateBudget(category, newValue);
    }
  };

  // Handle saving budget to backend
  const handleSaveBudget = (category) => {
    if (onSaveBudget) {
      onSaveBudget(category, editedBudgets[category]);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      {/* Tab Navigation */}
      <div className="flex border-b mb-4">
        <button
          className={`px-4 py-2 font-medium ${activeTab === 'chart' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('chart')}
        >
          Category Breakdown
        </button>
        <button
          className={`px-4 py-2 font-medium ${activeTab === 'budget' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('budget')}
        >
          Budget Management
        </button>
      </div>

      {/* Spending Chart View */}
      {activeTab === 'chart' && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Spending by Category</h2>
          {Array.isArray(pieChartData) && pieChartData.length > 0 ? (
            <div>
              {renderBarChart(pieChartData, colors)}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mt-4">
                {pieChartData.map((category, index) => (
                  <div key={index} className="p-4 bg-blue-50 rounded-md">
                    <h3 className="text-sm text-gray-500">{category.name}</h3>
                    <p className="text-xl font-bold text-gray-800">${(+category.value).toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p>No spending data to display</p>
          )}
        </div>
      )}

      {/* Budget Management View */}
      {activeTab === 'budget' && (
        <div>
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
                  const budget = editedBudgets[cat] || 0;
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
                          
                          className="w-24 p-1 border border-gray-300 rounded"
                          value={editedBudgets[cat] || 0}
                          onChange={(e) => handleBudgetChange(cat, e.target.value)}
                        />
                      </td>
                      <td className={`px-4 py-3 text-right ${statusColor} font-medium`}>
                        {status} ({percentage.toFixed(0)}%)
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                          onClick={() => handleSaveBudget(cat)}
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
          
          {/* Budget Progress Visualization */}
          <div className="mt-8">
            <h3 className="font-medium text-gray-700 mb-4">Budget Progress</h3>
            <div className="space-y-4">
              {categories.map((category, index) => {
                const spent = expensesByCategory[category] || 0;
                const budget = editedBudgets[category] || 0;
                const percentage = budget > 0 ? (spent / budget) * 100 : 0;

                return (
                  <div key={index}>
                    <div className="flex justify-between mb-1">
                      <span>{category}</span>
                      <span>${spent.toFixed(2)} / ${budget.toFixed(2)}</span>
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
      )}
    </div>
  );
};

export default CategoryBudgetManager;