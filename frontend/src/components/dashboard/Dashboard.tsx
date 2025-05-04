import React from 'react';
import { DashboardProps } from '../../../../types';
import {
  useExpenseManagement,
  useIncomeManagement,
  useBudgetManagement
} from '../../hooks';
import { Section } from '../ui/Section';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { FinancialSummary } from './FinancialSummary';
import DeleteExpenses from '../expensetracker/DeleteExpenses';
import { ExpenseDistribution } from '../expensetracker/ExpenseDistribution';
import AddExpenseForm from '../expensetracker/AddExpenseForm';
import ExpenseFilter from '../expensetracker/ExpenseFilter';
import { CategoryBudgetManager } from '../budget/CategoryBudgetManager';
import { FinancialInsights } from './FinancialInsights';
import IncomeGoals from '../budget/IncomeGoals';
import { ExpenseForm } from '../../../../types';
import SavingsGoalManager from '../budget/SavingsGoalManager';
import { SavingsGoalApiData } from '../../../../types';
import RecentExpensesTable from '../expensetracker/RecentExpensesTable';
import { IncomeEntryForm } from '../budget/IncomeEntryForm';
import { IncomeList } from '../budget/IncomeList';
import { BasicIncomeForm } from '../budget/BasicIncomeForm';
/**
 * The Dashboard component receives all the financial data from the container
 * and coordinates between different financial management components
 */
const Dashboard: React.FC<DashboardProps> = ({
  income,
  incomes,
  savingsGoal, // This is the single value
  savingsGoals, // This is the array
  spendingLimit,
  expenses,
  categories,
  expensesByCategory,
  categoryBudgets,
  loading,
  filter,
  filteredExpenses,
  totalExpenses,
  savings,
  savingsProgress,
  budgetPercentage,
  isOverBudget,
  suggestion,
  fetchData,
  setFilter,
  onSuccessMessage,
  onErrorMessage
}) => {
  // Initialize management hooks with callback objects
  const {
    addExpense,
    deleteExpenses,
    deleteExpense
  } = useExpenseManagement({
    onSuccess: onSuccessMessage,
    onError: onErrorMessage,
    onUpdate: fetchData
  });

  const {
    loading: incomeLoading,
    addIncome,
    deleteIncome,
    updateIncome,
    simpleUpdateIncome
  } = useIncomeManagement({
    onSuccess: onSuccessMessage,
    onError: onErrorMessage,
    onUpdate: fetchData
  });

  const {
    updateBudget,
    updateSavingsGoal,
    getSavingsGoals,
    deleteSavingsGoal,
    addSavingsGoal,
    updateSavingsGoalComplete,
    adjustSavingsGoalAmount
  } = useBudgetManagement({
    onSuccess: onSuccessMessage,
    onError: onErrorMessage,
    onUpdate: fetchData
  });

  // Handler for adding a new savings goal
  const handleAddSavingsGoal = async (goalData: SavingsGoalApiData): Promise<boolean> => {
    return addSavingsGoal(goalData);
  };

  // Handler for updating a savings goal
  const handleUpdateSavingsGoal = async (
    id: number,
    goalData: Partial<SavingsGoalApiData>
  ): Promise<boolean> => {
    return updateSavingsGoalComplete(id, goalData);
  };

  // Handler for adjusting a savings goal amount
  const handleAdjustSavingsGoalAmount = async (
    id: number,
    amount: number,
    isDeposit: boolean
  ): Promise<boolean> => {
    return adjustSavingsGoalAmount(id, amount, isDeposit);
  };

  // Handler for updating spending limit
  const handleUpdateSpendingLimit = (limit: number): void => {
    updateBudget('Total', limit, '/budgets', 'limit_amount');
  };

  // Handler for updating income
  const handleUpdateIncome = (value: number): void => {
    if (simpleUpdateIncome(value)) {
      onSuccessMessage('Income updated successfully');
    } else {
      onErrorMessage('Failed to update income');
    }
  };

  if (loading) return <LoadingSpinner />;

  // Get the 5 most recent expenses for display
  // Ensure all expenses have proper amount (number) and date properties
  const recentExpenses = [...expenses]
    .map(expense => ({
      ...expense,
      // Ensure amount is a number
      amount: typeof expense.amount === 'string'
        ? parseFloat(expense.amount)
        : expense.amount,
      // Ensure date is properly set
      expense_date: expense.expense_date || expense.expense_date || new Date().toISOString(),
    }))
    .sort((a, b) => {
      const dateA = new Date(a.expense_date);
      const dateB = new Date(b.expense_date);
      return dateB.getTime() - dateA.getTime();
    })
    .slice(0, 5);

  return (
    <div className="container mx-auto p-4">
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
          onApplySuggestion={(limit) => updateBudget('Total', limit, '/budgets', 'limit_amount')}
        />

        {/* Expense Distribution */}
        <ExpenseDistribution
          expensesByCategory={expensesByCategory}
          totalExpenses={totalExpenses}
        />

        {/* Category Budget Manager */}
        <CategoryBudgetManager
          categories={categories}
          expensesByCategory={expensesByCategory}
          categoryBudgets={categoryBudgets}
          onUpdateBudget={updateBudget}
          onSaveBudget={updateBudget}
        />

        {/* Financial Summary */}
        <FinancialSummary
          income={income}
          totalExpenses={totalExpenses}
          savings={savings}
          budgetPercentage={budgetPercentage}
          isOverBudget={isOverBudget}
          savingsProgress={savingsProgress}
          savingsGoal={savingsGoal} // Pass the single value here
          incomes={incomes}
          onAddIncome={addIncome}
          onDeleteIncome={deleteIncome}
        />

        {/* Simple Income Management */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Income Management</h2>
          <BasicIncomeForm
            currentIncome={income}
            onSubmit={handleUpdateIncome}
            loading={incomeLoading}
          />

          <div className="mt-6">
            <h3 className="text-lg font-medium mb-3">Income Entries</h3>
            <IncomeEntryForm />
            <div className="mt-4">
              <IncomeList
                incomes={incomes}
                onUpdate={fetchData}
                onSuccess={onSuccessMessage}
                onError={onErrorMessage}
              />
            </div>
          </div>
        </div>

        {/* Add Expense, Delete Expenses, and Filter Expenses */}
        <div className="col-span-1 md:col-span-2 bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Manage Financials</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Add New Expense */}
            <AddExpenseForm
              categories={categories}
              onAddExpense={(data: ExpenseForm) => addExpense(data)}
            />

            {/* Delete Expense */}
            <DeleteExpenses
              onSuccess={onSuccessMessage}
              onError={onErrorMessage}
            />

            <Section title="Expense Analysis" full={true}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Expense Filter */}
                <div className="md:col-span-1">
                  <h3 className="text-lg font-medium mb-3">Filter Expenses</h3>
                  <ExpenseFilter
                    filter={filter}
                    setFilter={setFilter}
                    categories={categories}
                  />
                </div>

                {/* Recent Expenses */}
                <div className="md:col-span-2">
                  <h3 className="text-lg font-medium mb-3">Recent Transactions</h3>
                  <RecentExpensesTable expenses={recentExpenses} />
                </div>
              </div>
            </Section>

          </div>
          {/* Add Savings Goal Manager tab option */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4">Savings Goals</h3>
            <SavingsGoalManager
              savingsGoals={savingsGoals || []}
              onSuccessMessage={onSuccessMessage}
              onErrorMessage={onErrorMessage}
              onUpdate={fetchData}
              onAddGoal={handleAddSavingsGoal}
              onDeleteGoal={deleteSavingsGoal}
              onUpdateGoal={handleUpdateSavingsGoal}
              onAdjustGoalAmount={handleAdjustSavingsGoalAmount}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;