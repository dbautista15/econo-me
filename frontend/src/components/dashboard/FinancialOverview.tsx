import React, { useState } from 'react';
import { transformations } from '../../utils/transformations';
import { financialCalculations } from '../../utils/financialCalculations';
import { Progress } from '../layout/ui/Progress';
import { Insight } from '../layout/ui/Insight';

export interface FinancialOverview {
  // Financial summary data
  income: number;
  totalExpenses: number;
  savings: number;
  budgetPercentage: number;
  isOverBudget: boolean;
  savingsProgress: number;
  savingsGoal: number;
  spendingLimit: number;
  
  // Financial insights data
  expensesByCategory: Record<string, number>;
  
  // Callbacks
  onApplySuggestion?: (amount: number) => void;
}

export const FinancialOverview: React.FC<FinancialOverview> = ({
  income,
  totalExpenses,
  savings,
  budgetPercentage,
  isOverBudget,
  savingsProgress,
  savingsGoal,
  spendingLimit,
  expensesByCategory,
  onApplySuggestion
}) => {
  // State to manage which view is active
  const [activeView, setActiveView] = useState<'summary' | 'insights'>('summary');
  
  // Calculate insights data
  const largestCategory = financialCalculations.findLargestExpenseCategory(expensesByCategory);
  const largestPercentage = totalExpenses > 0 
    ? transformations.calculatePercentage(largestCategory.value, totalExpenses)
    : 0;
  const savingsRate = financialCalculations.calculateSavingsRate(savings, income);
  const budgetDifference = Math.abs(totalExpenses - spendingLimit);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      {/* Tab navigation */}
      <div className="flex border-b mb-4">
        <button
          className={`px-4 py-2 font-medium ${activeView === 'summary' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
          onClick={() => setActiveView('summary')}
        >
          Financial Summary
        </button>
        <button
          className={`px-4 py-2 font-medium ${activeView === 'insights' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
          onClick={() => setActiveView('insights')}
        >
          Financial Insights
        </button>
      </div>

      {/* Summary View */}
      {activeView === 'summary' && (
        <>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-sm text-gray-600">Monthly Income</p>
              <p className="text-2xl font-bold">${transformations.formatCurrency(income)}</p>
            </div>

            <div>
              <p className="text-sm text-gray-600">Total Expenses</p>
              <p className="text-2xl font-bold">${transformations.formatCurrency(totalExpenses)}</p>
            </div>
          </div>

          <div className="mb-6">
            <Progress
              label="Budget Usage"
              percent={budgetPercentage}
              color={isOverBudget ? 'bg-red-500' : 'bg-green-500'}
            />
          </div>

          <div className="mb-6">
            <Progress
              label={`Overall Financial Health (${transformations.formatCurrency(savings)} of ${transformations.formatCurrency(savingsGoal)})`}
              percent={savingsProgress}
              color="bg-blue-500"
            />
          </div>

          <div className="border-t pt-4 mt-4">
            <p className="text-sm text-gray-600">Remaining Income</p>
            <p className={`text-2xl font-bold ${savings < 0 ? 'text-red-600' : 'text-green-600'}`}>
              ${transformations.formatCurrency(savings)}
            </p>
          </div>
        </>
      )}

      {/* Insights View */}
      {activeView === 'insights' && (
        <>
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
          </div>
          

          
          <Insight 
            label="Quick Tip" 
            text={isOverBudget 
              ? "Consider reducing spending in your largest category to get back on track."
              : "You're doing well! Consider putting your extra savings into an emergency fund or investment account."
            } 
          />
        </>
      )}
    </div>
  );
};

export default FinancialOverview;