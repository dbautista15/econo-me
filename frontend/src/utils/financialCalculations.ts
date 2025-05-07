import { Income, Expense, Suggestion } from '../../../types';
import { transformations } from '../utils/transformations';

/**
 * Financial calculations for budgeting and spending analysis
 */
export const financialCalculations = {

  /**
   * Finds the largest expense category
   */
  findLargestExpenseCategory: (expensesByCategory: Record<string, number>): { name: string; value: number } => {
    if (!expensesByCategory || Object.keys(expensesByCategory).length === 0) {
      return { name: 'None', value: 0 };
    }

    // Find the entry with the largest value
    const largestEntry = Object.entries(expensesByCategory)
      .sort((a, b) => b[1] - a[1])[0];

    // Return a properly formatted object
    return {
      name: largestEntry[0],   // The category name (string)
      value: largestEntry[1]   // The expense value (number)
    };
  },

  /**
   * Calculates savings rate as a percentage of income
   */
  calculateSavingsRate: (savings: number, income: number): number => {
    return income > 0 ? (savings / income) * 100 : 0;
  },

  /**
   * Calculates the percentage of budget used
   */
  calculateBudgetUsage: (expenses: number, budget: number): number => {
    return budget > 0 ? (expenses / budget) * 100 : 0;
  },

  /**
   * Calculates budget status metrics
   */
  calculateBudgetStatus: (totalExpenses: number, spendingLimit: number): {
    budgetPercentage: number;
    isOverBudget: boolean;
    remainingBudget: number;
  } => {
    const budgetPercentage = transformations.calculatePercentage(totalExpenses, spendingLimit);
    const isOverBudget = budgetPercentage > 100;
    const remainingBudget = isOverBudget ? 0 : spendingLimit - totalExpenses;

    return {
      budgetPercentage,
      isOverBudget,
      remainingBudget
    };
  },

  /**
   * Calculates total expenses from expense categories
   */
  calculateTotalExpenses: (expensesByCategory: Record<string, number>): number => {
    return transformations.sumValues(Object.values(expensesByCategory));
  },

  /**
   * Calculates savings amount based on income and expenses
   */
  calculateSavings: (income: number, totalExpenses: number): number => {
    return income - totalExpenses;
  },


  /**
   * Analyzes income entries to determine payment frequency pattern
   */
  estimatePayFrequency: (incomeEntries: Income[]): string | null => {
    if (!incomeEntries || incomeEntries.length < 2) return null;

    const sorted = [...incomeEntries].sort(
      (a, b) => new Date(a.income_date).getTime() - new Date(b.income_date).getTime()
    );

    const gaps = calculateDaysGapsBetweenEntries(sorted);
    const avgGap = transformations.sumValues(gaps) / gaps.length;

    return determineFrequencyFromGap(avgGap);
  },

  /**
   * Generates spending limit suggestions based on income history
   */
  // Inside getSuggestedLimit function
  getSuggestedLimit: (incomes: Income[]): Suggestion | null => {
    // Basic validation
    if (!incomes || incomes.length < 2) return null;

    // Filter out entries with invalid dates
    const validIncomes = incomes.filter(income =>
      income && income.income_date && !isNaN(new Date(income.income_date).getTime())
    );

    // If not enough valid incomes remain, return null
    if (validIncomes.length < 2) return null;

    const frequency = financialCalculations.estimatePayFrequency(validIncomes);
    const sorted = [...validIncomes].sort(
      (a, b) => new Date(b.income_date).getTime() - new Date(a.income_date).getTime()
    );

    const lastAmount = sorted[0]?.amount || 0;
    const lastDate = new Date(sorted[0]?.income_date);

    // Additional validation for lastDate
    if (isNaN(lastDate.getTime())) {
      console.error('Invalid date detected in getSuggestedLimit');
      return null;
    }

    const nextDate = calculateNextPayDate(lastDate, frequency || 'biweekly');
    const daysUntilNext = Math.max(1, Math.ceil((nextDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)));

    return {
      daily: (lastAmount / daysUntilNext),
      frequency: frequency || null,
      nextDate: nextDate.toISOString().split('T')[0]
    };
  }
};

// Helper functions for financial calculations
function calculateDaysGapsBetweenEntries(sortedEntries: Income[]): number[] {
  const gaps: number[] = [];

  for (let i = 1; i < sortedEntries.length; i++) {
    const gap = (new Date(sortedEntries[i].income_date).getTime() -
      new Date(sortedEntries[i - 1].income_date).getTime()) / (1000 * 60 * 60 * 24);
    gaps.push(gap);
  }

  return gaps;
}

function determineFrequencyFromGap(avgGap: number): string {
  if (avgGap <= 8) return 'weekly';
  if (avgGap <= 16) return 'biweekly';
  if (avgGap <= 31) return 'monthly';
  return 'irregular';
}

function calculateNextPayDate(lastDate: Date, frequency: string): Date {
  const nextDate = new Date(lastDate);

  switch (frequency) {
    case 'weekly':
      nextDate.setDate(lastDate.getDate() + 7);
      break;
    case 'biweekly':
      nextDate.setDate(lastDate.getDate() + 14);
      break;
    case 'monthly':
      nextDate.setMonth(lastDate.getMonth() + 1);
      break;
    default:
      // For irregular, assume biweekly as a safe default
      nextDate.setDate(lastDate.getDate() + 14);
  }

  return nextDate;
}
