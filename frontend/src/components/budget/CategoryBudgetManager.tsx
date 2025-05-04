import React, { useState } from 'react';
import { renderBarChart } from '../ui/Charts';
import { CategoryBudgetManagerProps } from '../../../../types';
import { chartUtils } from '../../utils/chartUtils';
import { transformations } from '../../utils/transformations';
import { financialCalculations } from '../../utils/financialCalculations';

export const CategoryBudgetManager: React.FC<CategoryBudgetManagerProps> = ({
  categories,
  expensesByCategory,
  categoryBudgets,
  colors = [],
  onUpdateBudget,
  onSaveBudget,
}) => {
  const [editedBudgets, setEditedBudgets] = useState<Record<string, number>>(categoryBudgets);
  const [activeTab, setActiveTab] = useState<'chart' | 'budget'>('chart');

  // Use chartUtils to prepare data consistently
  const chartData = chartUtils.prepareCategoryData(categories, expensesByCategory);
  const chartColors = colors.length > 0 ? colors : chartUtils.generateCategoryColors(categories);

  // Function that returns an iterator of values to use as keys
  const getKeys = function* () {
    yield* [0]; // Yield value index (assuming each data point has only one value)
  };

  const handleBudgetChange = (cat: string, val: string) => {
    const num = transformations.parseAmount(val);
    setEditedBudgets(prev => ({ ...prev, [cat]: num }));
    onUpdateBudget?.(cat, num);
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

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex border-b mb-4">
        {['chart', 'budget'].map(tab => (
          <button
            key={tab}
            className={`px-4 py-2 font-medium ${activeTab === tab ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
            onClick={() => setActiveTab(tab as 'chart' | 'budget')}
          >
            {tab === 'chart' ? 'Spending Breakdown' : 'Budget Management'}
          </button>
        ))}
      </div>

      {activeTab === 'chart' ? (
        <div className="h-64">
          {chartData.length > 0 ? (
            renderBarChart(
              chartData,
              chartColors  // Just pass the colors array directly
            )
          ) : (
            <div className="flex h-full items-center justify-center">
              <p className="text-gray-500">No spending data to display</p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="mt-2 mb-4">
            <p className="text-sm text-gray-600">
              Set budget limits for each spending category. Progress bars show how much of each budget has been used.
            </p>
          </div>

          {categories.length === 0 ? (
            <p className="text-gray-500">No categories available</p>
          ) : (
            categories.map((category) => {
              const spent = expensesByCategory[category] || 0;
              const budget = editedBudgets[category] || 0;
              const percentage = getCategoryBudgetPercentage(category);

              return (
                <div key={category} className="border rounded-lg p-4 shadow-sm">
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
                </div>
              );
            })
          )}

          {categories.length > 0 && onSaveBudget && (
            <div className="flex justify-end mt-4">
              <button
                onClick={() => {
                  // Save all budgets
                  Object.entries(editedBudgets).forEach(([category, limit]) => {
                    onSaveBudget?.(category, limit);
                  });
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
              >
                Save All Budgets
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};