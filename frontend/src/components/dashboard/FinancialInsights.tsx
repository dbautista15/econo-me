import React from 'react';
import { FinancialInsightsProps } from '../../../../types';
import { transformations } from '../../utils/transformations';
import { financialCalculations } from '../../utils/financialCalculations';
import {Insight} from '../ui/Insight';

export const FinancialInsights: React.FC<FinancialInsightsProps> = ({ 
  expensesByCategory, 
  totalExpenses, 
  income, 
  savings, 
  isOverBudget, 
  spendingLimit,
  suggestion,
  onApplySuggestion
}) => {
  // Find largest expense category using financialCalculations
  const largestCategory = financialCalculations.findLargestExpenseCategory(expensesByCategory);
  
  // Calculate percentages and financial ratios
  const largestPercentage = totalExpenses > 0 
    ? transformations.calculatePercentage(largestCategory.value, totalExpenses)
    : 0;
  
  const savingsRate = financialCalculations.calculateSavingsRate(savings, income);
  const budgetDifference = Math.abs(totalExpenses - spendingLimit);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md md:col-span-2">
      <h2 className="text-xl font-semibold mb-4">Financial Insights</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-blue-50 rounded-md">
          <h3 className="font-medium text-gray-700">Spending Breakdown</h3>
          <p className="mt-2">
            Your largest expense category is: {largestCategory.name}, 
            at {transformations.formatPercentage(largestPercentage)}% of total spending.
          </p>
        </div>

        <div className="p-4 bg-blue-50 rounded-md">
          <h3 className="font-medium text-gray-700">Savings Rate</h3>
          <p className="mt-2">
            You're saving {transformations.formatPercentage(savingsRate)}% of your income.
            {income > 0 && savingsRate >= 20
              ? ' Great job!'
              : ' Consider increasing your savings rate to 20%.'}
          </p>
        </div>

        <div className="p-4 bg-blue-50 rounded-md">
          <h3 className="font-medium text-gray-700">Budget Status</h3>
          <p className="mt-2">
            {isOverBudget
              ? `You are $${transformations.formatCurrency(budgetDifference)} over your budget.`
              : `You are $${transformations.formatCurrency(budgetDifference)} under your budget.`}
          </p>
        </div>
        
        {suggestion && (
          <div className="mt-6 p-4 bg-white border border-gray-200 rounded shadow-sm">
            <h3 className="text-sm font-semibold text-gray-800 mb-2">📊 Suggested Spending Limit</h3>
            <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
              <li><strong>Pay frequency:</strong> {suggestion.frequency}</li>
              <li><strong>Next paycheck:</strong> {suggestion.nextDate}</li>
              <li><strong>Daily limit:</strong> ${suggestion.daily}</li>
            </ul>
            <button
              className="mt-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-1.5 px-4 rounded"
              onClick={() => onApplySuggestion(transformations.parseAmount(suggestion.daily) * 7)}
            >
              Apply Weekly Limit
            </button>
          </div>
        )}
      </div>
    </div>
  );
};