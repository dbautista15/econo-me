/**
 * Financial Utilities Module
 * 
 * A collection of utility functions for financial calculations, data validation,
 * and data transformation to support dashboard visualizations and user interactions.
 */
import api from './api';
/**
 * Validates expense form inputs
 * @param {number|string} amount - The expense amount to validate
 * @param {string} expenseDate - The expense date in ISO format
 * @returns {Object} An object containing validation errors, if any
 */
export const validateExpenseForm = (amount, expenseDate) => {
	const errors = {};
	
	validateAmount(amount, errors);
	validateDate(expenseDate, errors);
	
	return errors;
  };
  
  /**
   * Validates expense amount
   * @param {number|string} amount - The expense amount to validate
   * @param {Object} errors - Object to store validation errors
   */
  const validateAmount = (amount, errors) => {
	const numAmount = parseFloat(amount);
	
	if (!amount) {
	  errors.amount = 'Amount is required';
	} else if (isNaN(numAmount)) {
	  errors.amount = 'Amount must be a number';
	} else if (numAmount <= 0) {
	  errors.amount = 'Amount must be greater than zero';
	} else if (numAmount > 100000) {
	  errors.amount = 'Amount seems unusually high. Please verify.';
	}
  };
  
  /**
   * Validates expense date
   * @param {string} expenseDate - The expense date in ISO format
   * @param {Object} errors - Object to store validation errors
   */
  const validateDate = (expenseDate, errors) => {
	if (!expenseDate) {
	  errors.date = 'Date is required';
	} else {
	  const selectedDate = new Date(expenseDate);
	  const today = new Date();
	  const oneYearAgo = new Date();
	  oneYearAgo.setFullYear(today.getFullYear() - 1);
	  
	  if (selectedDate > today) {
		errors.date = 'Date cannot be in the future';
	  } else if (selectedDate < oneYearAgo) {
		errors.date = 'Date cannot be more than one year in the past';
	  }
	}
  };
  
  
  /**
   * Calculates total expenses from expense categories
   * @param {Object} expensesByCategory - Object mapping categories to expense amounts
   * @returns {number} Total expenses across all categories
   */
  export const calculateTotals = (expensesByCategory) => {
	return Object.values(expensesByCategory).reduce((sum, value) => sum + value, 0);
  };
  
  /**
   * Calculates savings amount based on income and expenses
   * @param {number} income - Total income
   * @param {number} totalExpenses - Total expenses
   * @returns {number} Calculated savings
   */
  export const calculateSavings = (income, totalExpenses) => {
	return income - totalExpenses;
  };
  
  /**
   * Calculates budget status metrics
   * @param {number} totalExpenses - Total expenses
   * @param {number} spendingLimit - Budget limit
   * @returns {Object} Object containing budget percentage and over-budget flag
   */
  export const calculateBudgetStatus = (totalExpenses, spendingLimit) => {
	const budgetPercentage = spendingLimit > 0 ? (totalExpenses / spendingLimit) * 100 : 0;
	const isOverBudget = budgetPercentage > 100;
	return { budgetPercentage, isOverBudget };
  };
  
  
  /**
   * Transforms expenses by category into format for pie charts
   * @param {Object} expensesByCategory - Object mapping categories to expense amounts
   * @returns {Array} Array of objects with name and value properties
   */
  export const preparePieChartData = (expensesByCategory) => {
	if (!expensesByCategory || typeof expensesByCategory !== 'object') {
	  return [];
	}
	
	return Object.entries(expensesByCategory).map(([category, amount]) => ({
	  name: category,
	  value: amount
	}));
  };
  
  /**
   * Groups expenses by month and category for stacked charts
   * @param {Array} expenses - Array of expense objects
   * @param {Array} categories - Array of expense categories
   * @returns {Array} Formatted data for stacked bar chart
   */
  export const prepareMonthlyBreakdownData = (expenses, categories) => {
	// Group expenses by month and category
	const expensesByMonthAndCategory = groupExpensesByMonthAndCategory(expenses);
	
	// Convert to format for stacked bar chart
	return formatForStackedBarChart(expensesByMonthAndCategory, categories);
  };
  
  /**
   * Helper to group expenses by month and category
   * @param {Array} expenses - Array of expense objects
   * @returns {Object} Nested object grouping expenses by month and category
   */
  const groupExpensesByMonthAndCategory = (expenses) => {
	const result = {};
	
	expenses.forEach(expense => {
	  const expenseDate = expense.date ? new Date(expense.date) : new Date();
	  const month = expenseDate.toLocaleString('default', { month: 'short' });
	  
	  if (!result[month]) {
		result[month] = {};
	  }
	  
	  if (!result[month][expense.category]) {
		result[month][expense.category] = 0;
	  }
	  
	  result[month][expense.category] += parseFloat(expense.amount);
	});
	
	return result;
  };
  
  /**
   * Helper to format grouped expenses for stacked bar chart
   * @param {Object} groupedExpenses - Expenses grouped by month and category
   * @param {Array} categories - Array of expense categories
   * @returns {Array} Formatted data for stacked bar chart
   */
  const formatForStackedBarChart = (groupedExpenses, categories) => {
	return Object.keys(groupedExpenses).map(month => {
	  const monthData = { name: month };
	  
	  categories.forEach(category => {
		monthData[category] = groupedExpenses[month][category] || 0;
	  });
	  
	  return monthData;
	});
  };
  
  
  /**
   * Analyzes income entries to determine payment frequency pattern
   * @param {Array} incomeEntries - Array of income entry objects
   * @returns {string|null} Detected frequency pattern or null if insufficient data
   */
  export function estimatePayFrequency(incomeEntries) {
	if (!incomeEntries || incomeEntries.length < 2) return null;
  
	const sorted = [...incomeEntries].sort(
	  (a, b) => new Date(a.income_date) - new Date(b.income_date)
	);
  
	const gaps = calculateDaysGapsBetweenEntries(sorted);
	const avgGap = gaps.reduce((a, b) => a + b, 0) / gaps.length;
  
	return determineFrequencyFromGap(avgGap);
  }
  
  /**
   * Helper to calculate day gaps between income entries
   * @param {Array} sortedEntries - Chronologically sorted income entries
   * @returns {Array} Array of day gaps between entries
   */
  const calculateDaysGapsBetweenEntries = (sortedEntries) => {
	const gaps = [];
	
	for (let i = 1; i < sortedEntries.length; i++) {
	  const gap = (new Date(sortedEntries[i].income_date) - new Date(sortedEntries[i - 1].income_date)) / (1000 * 60 * 60 * 24);
	  gaps.push(gap);
	}
	
	return gaps;
  };
  
  /**
   * Helper to determine frequency category from average gap
   * @param {number} avgGap - Average gap in days between income entries
   * @returns {string} Frequency category
   */
  const determineFrequencyFromGap = (avgGap) => {
	if (avgGap <= 8) return 'weekly';
	if (avgGap <= 16) return 'biweekly';
	if (avgGap <= 31) return 'monthly';
	return 'irregular';
  };
  
  /**
   * Generates spending limit suggestions based on income history
   * @param {Array} incomes - Array of income objects
   * @returns {Object|null} Suggested limits object or null if insufficient data
   */
  export function getSuggestedLimit(incomes) {
	if (!incomes || incomes.length < 2) return null;
  
	const frequency = estimatePayFrequency(incomes);
	const sorted = [...incomes].sort(
	  (a, b) => new Date(b.income_date) - new Date(a.income_date)
	);
  
	const lastAmount = sorted[0]?.amount || 0;
	const lastDate = new Date(sorted[0]?.income_date);
	const nextDate = calculateNextPayDate(lastDate, frequency);
	const daysUntilNext = Math.max(1, Math.ceil((nextDate - new Date()) / (1000 * 60 * 60 * 24)));
  
	return {
	  daily: (lastAmount / daysUntilNext).toFixed(2),
	  frequency,
	  nextDate: nextDate.toISOString().split('T')[0]
	};
  }
  
  /**
   * Helper to calculate next expected payday based on frequency
   * @param {Date} lastDate - Date of most recent income
   * @param {string} frequency - Detected pay frequency
   * @returns {Date} Calculated next payday
   */
  const calculateNextPayDate = (lastDate, frequency) => {
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
  };

/**
 * Deletes an income entry by ID
 * @param {string|number} incomeId - The ID of the income to delete
 * @returns {Promise<Object>} The response data from the API
 * @throws {Error} If the deletion fails
 */
export const deleteIncome = async (incomeId) => {
	try {
	  const response = await api.delete(`/incomes/${incomeId}`);
	  return response.data;
	} catch (error) {
	  throw new Error(error.response?.data?.error || 'Failed to delete income');
	}
  };