import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { transformations } from '../../utils';
import { chartUtils } from '../../utils/chartUtils';

// Component Imports
import { FinancialOverview } from './FinancialOverview';
import ExpenseTableWithFilter from '../expense-tracker/ExpenseTableWithFilter';
import CategoryBreakdownChart from '../layout/ui/CategoryBreakdownChart';
import SavingsGoalManager from '../budget-tracker/SavingsGoalManager';
import { IncomeEntryForm } from '../income-tracker/IncomeEntryForm';
import ExpenseManager from '../expense-tracker/ExpenseManager';
import { CategoryBudgetManager } from '../budget-tracker/CategoryBudgetManager';
import Notification from '../layout/ui/Notification';
import { LoadingSpinner } from '../layout/ui/LoadingSpinner';

// Type Imports
import {
  Expense,
  Income,
  SavingsGoal,
  UnifiedDashboardProps
} from '../../../../types';

export const UnifiedDashboard: React.FC<UnifiedDashboardProps> = () => {
  // Notification State
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
  } | null>(null);

  // Financial Data State
  const [financialData, setFinancialData] = useState({
    income: 0,
    expenses: [] as Expense[],
    incomes: [] as Income[],
    categories: [] as string[],
    expensesByCategory: {} as Record<string, number>,
    savingsGoal: 0,
    spendingLimit: 0
  });

  // Loading and Error States
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

// Success Message Handler
const handleSuccessMessage = (message: string) => {
  setNotification({ message, type: 'success' });
  setTimeout(() => setNotification(null), 5000);
  
  // Always refresh all financial data when any success happens
  fetchFinancialData();
};

  // Error Message Handler
  const handleErrorMessage = (message: string) => {
    setNotification({ message, type: 'error' });
    setTimeout(() => setNotification(null), 5000);
  };

  // Fetch Financial Data
  const fetchFinancialData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [
        categoriesData,
        expensesData,
        incomesData,
        budgetsData,
        savingsGoalsData
      ] = await Promise.all([
        api.get<string[]>('/categories'),
        api.get<Expense[]>('/expenses'),
        api.get<Income[]>('/incomes'),
        api.get<any[]>('/budgets'),
        api.get<SavingsGoal[]>('/savings-goals')
      ]);

      // Process expenses
      const expensesList = Array.isArray(expensesData) ? expensesData : [];

      // Calculate expenses by category
      const expensesByCat: Record<string, number> = {};
      expensesList.forEach(expense => {
        const category = expense.category || 'Uncategorized';
        expensesByCat[category] = (expensesByCat[category] || 0) +
          transformations.parseAmount(expense.amount);
      });

      // Process incomes
      const incomesList = Array.isArray(incomesData) ? incomesData : [];
      const incomeTotal = incomesList.reduce(
        (sum, income) => sum + transformations.parseAmount(income.amount),
        0
      );

      // Process budgets
      const budgets = Array.isArray(budgetsData) ? budgetsData : [];
      const totalBudget = budgets.find(b => b.category === 'Total');
      const spendingLimit = totalBudget
        ? transformations.parseAmount(totalBudget.limit_amount)
        : 0;

      // Process savings goals
      const goalsList = Array.isArray(savingsGoalsData) ? savingsGoalsData : [];
      const goalTotal = goalsList.reduce(
        (sum, goal) => sum + transformations.parseAmount(goal.target_amount),
        0
      );

      // Update state
      setFinancialData({
        income: incomeTotal,
        expenses: expensesList,
        incomes: incomesList,
        categories: Array.isArray(categoriesData) ? categoriesData : [],
        expensesByCategory: expensesByCat,
        savingsGoal: goalTotal,
        spendingLimit
      });
    } catch (error) {
      console.error('Error fetching financial data:', error);
      setError('Failed to load financial data. Please try again.');
      handleErrorMessage('Failed to load financial data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Initial data load
  useEffect(() => {
    fetchFinancialData();
  }, []);

  // Derived calculations
  const totalExpenses = financialData.expenses.reduce(
    (sum, expense) => sum + transformations.parseAmount(expense.amount),
    0
  );
  const savings = financialData.income - totalExpenses;
  const savingsProgress = financialData.savingsGoal > 0
    ? Math.min(100, (savings / financialData.savingsGoal) * 100)
    : 0;
  const budgetPercentage = financialData.spendingLimit > 0
    ? (totalExpenses / financialData.spendingLimit) * 100
    : 0;
  const isOverBudget = budgetPercentage > 100;

  // Chart data preparation
  const pieChartData = chartUtils.preparePieChartData(financialData.expensesByCategory);
  const chartColors = chartUtils.generateCategoryColors(financialData.categories);

  // Render loading state
  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Notification Area */}
      {notification && (
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}

      {/* Main Dashboard Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Financial Overview & Expense Management */}
        <div className="lg:col-span-2 space-y-6">
          {/* Financial Overview */}
          <FinancialOverview
            income={financialData.income}
            totalExpenses={totalExpenses}
            savings={savings}
            budgetPercentage={budgetPercentage}
            isOverBudget={isOverBudget}
            savingsProgress={savingsProgress}
            savingsGoal={financialData.savingsGoal}
            spendingLimit={financialData.spendingLimit}
            expensesByCategory={financialData.expensesByCategory}
          />

          {/* Expense Distribution */}
          <CategoryBreakdownChart
            onSuccess={handleSuccessMessage}
            pieChartData={pieChartData}
            colors={chartColors}
          />
          
          {/* Expense Manager */}
          <ExpenseManager
            onSuccess={handleSuccessMessage}
            onError={handleErrorMessage}
          />

          {/* Expense Table with Filtering */}
          <ExpenseTableWithFilter
            onSuccess={handleSuccessMessage}
            expenses={financialData.expenses}
            categories={financialData.categories}
            onFilterChange={(filteredExpenses) => {
              console.log('Filtered Expenses:', filteredExpenses);
            }}
          />
        </div>

        {/* Right Column - Budget & Income Management */}
        <div className="space-y-6">
          {/* Budget Management */}
          <CategoryBudgetManager
            onSuccess={handleSuccessMessage}
            onError={handleErrorMessage}
          />
          
          {/* Income Entry Form */}
          <IncomeEntryForm
            onAddIncomeSuccess={fetchFinancialData}
            onSuccess={handleSuccessMessage}
          />
          
          {/* Savings Goal Manager */}
          <SavingsGoalManager 
          />
          
        </div>
      </div>
    </div>
  );
};

export default UnifiedDashboard;