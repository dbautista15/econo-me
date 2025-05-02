import { ChartDataPoint, LineChartDataPoint, StackedBarChartDataPoint } from '../../../types';
import { transformations } from './transformations';

export const chartUtils = {
	/**
	 * Generates colors for chart categories
	 */
	generateCategoryColors: (categories: string[]): string[] => {
	  return categories.map((_, i) => {
		const hue = (i * 137) % 360;
		return `hsl(${hue}, 70%, 50%)`;
	  });
	},
  
	/**
	 * Prepares pie chart data from expenses by category
	 */
	preparePieChartData: (expensesByCategory: Record<string, number>): ChartDataPoint[] => {
	  if (!expensesByCategory || typeof expensesByCategory !== 'object') {
		return [];
	  }
  
	  return Object.entries(expensesByCategory).map(([category, amount]) => ({
		name: category,
		value: amount
	  }));
	},
  
	/**
	 * Prepares bar chart data for categories
	 */
	prepareCategoryData: (
	  categories: string[], 
	  expensesByCategory: Record<string, number>
	): ChartDataPoint[] => {
	  return categories.map(category => ({
		name: category,
		value: expensesByCategory[category] || 0
	  }));
	},
  
	/**
	 * Groups expenses by month and category for charts
	 */
	groupExpensesByMonthAndCategory: (
	  expenses: Array<{
		category: string;
		amount: number;
		date?: string | Date;
		expense_date?: string | Date;
	  }>
	): Record<string, Record<string, number>> => {
	  const result: Record<string, Record<string, number>> = {};
  
	  if (!Array.isArray(expenses)) {
		return result;
	  }
  
	  expenses.forEach(expense => {
		// Handle both date and expense_date fields for flexibility
		const dateField = expense.date || expense.expense_date;
  
		if (!dateField || !expense.category) {
		  return; // Skip entries with missing required data
		}
  
		const expenseDate = new Date(dateField);
  
		// Skip invalid dates
		if (isNaN(expenseDate.getTime())) {
		  return;
		}
  
		const month = expenseDate.toLocaleString('default', { month: 'short' });
		const amount = transformations.parseAmount(expense.amount);
  
		// Skip if amount is not a valid number
		if (isNaN(amount)) {
		  return;
		}
  
		// Initialize month object if it doesn't exist
		if (!result[month]) {
		  result[month] = {};
		}
  
		// Initialize category for this month if it doesn't exist
		if (!result[month][expense.category]) {
		  result[month][expense.category] = 0;
		}
  
		// Add expense amount to the appropriate category for this month
		result[month][expense.category] += amount;
	  });
  
	  return result;
	},
  
	/**
	 * Formats grouped expenses for stacked bar chart
	 */
	formatForStackedBarChart: (
	  groupedExpenses: Record<string, Record<string, number>>,
	  categories: string[]
	): StackedBarChartDataPoint[] => {
	  // Get list of months (keys from groupedExpenses)
	  const months = Object.keys(groupedExpenses);
  
	  if (months.length === 0 || !Array.isArray(categories) || categories.length === 0) {
		return [];
	  }
  
	  // Define month order for consistent display
	  const monthOrder = [
		'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
		'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
	  ];
  
	  // Sort months in chronological order
	  const sortedMonths = months.sort((a, b) => {
		return monthOrder.indexOf(a) - monthOrder.indexOf(b);
	  });
  
	  // Create data points for each month
	  return sortedMonths.map(month => {
		// Start with month name
		const monthData: StackedBarChartDataPoint = {
		  name: month
		};
  
		// Add value for each category (use 0 if no data)
		categories.forEach(category => {
		  const categoryExpenses = groupedExpenses[month];
		  monthData[category] = categoryExpenses && categoryExpenses[category]
			? categoryExpenses[category]
			: 0;
		});
  
		return monthData;
	  });
	},
  
	/**
	 * Prepares monthly breakdown data for stacked charts
	 */
	prepareMonthlyBreakdownData: (
	  expenses: Array<{
		category: string;
		amount: number;
		date?: string | Date;
		expense_date?: string | Date;
	  }>,
	  categories: string[]
	): StackedBarChartDataPoint[] => {
	  // Group expenses by month and category
	  const expensesByMonthAndCategory = chartUtils.groupExpensesByMonthAndCategory(expenses);
  
	  // Convert to format for stacked bar chart
	  return chartUtils.formatForStackedBarChart(expensesByMonthAndCategory, categories);
	}
  };