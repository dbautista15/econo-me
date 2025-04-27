import React from 'react';

const FinancialInsights = ({ 
  expensesByCategory, 
  totalExpenses, 
  income, 
  savings, 
  isOverBudget, 
  spendingLimit,
  suggestion,
  onApplySuggestion
}) => {
  // Find largest expense category
  const largestCategory = Object.entries(expensesByCategory).length > 0 
    ? Object.entries(expensesByCategory).sort((a, b) => b[1] - a[1])[0] 
    : ['none', 0];
  
  const largestPercentage = totalExpenses > 0 
    ? ((largestCategory[1] / totalExpenses) * 100).toFixed(0) 
    : 0;
  
  const savingsRate = income > 0 ? ((savings / income) * 100).toFixed(0) : 0;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md md:col-span-2">
      <h2 className="text-xl font-semibold mb-4">Financial Insights</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-blue-50 rounded-md">
          <h3 className="font-medium text-gray-700">Spending Breakdown</h3>
          <p className="mt-2">
            Your largest expense category is: {largestCategory[0]}, 
            at {largestPercentage}% of total spending.
          </p>
        </div>

        <div className="p-4 bg-blue-50 rounded-md">
          <h3 className="font-medium text-gray-700">Savings Rate</h3>
          <p className="mt-2">
            You're saving {savingsRate}% of your income.
            {income > 0 && parseInt(savingsRate) >= 20
              ? ' Great job!'
              : ' Consider increasing your savings rate to 20%.'}
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
        
        {suggestion && (
          <div className="mt-6 p-4 bg-white border border-gray-200 rounded shadow-sm">
            <h3 className="text-sm font-semibold text-gray-800 mb-2">📊 Suggested Spending Limit</h3>
            <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
              <li><strong>Pay frequency:</strong> {suggestion.frequency}</li>
              <li><strong>Next paycheck:</strong> {suggestion.nextDate}</li>
              <li><strong>Daily spending limit:</strong> ${suggestion.daily}</li>
            </ul>
            <button
              className="mt-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-1.5 px-4 rounded"
              onClick={() => onApplySuggestion(parseFloat(suggestion.daily) * 7)}
            >
              Apply Weekly Limit
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FinancialInsights;