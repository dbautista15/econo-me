export const validateExpenseForm = (amount, expenseDate) => {
	const errors = {};
	
	// Validate amount
	if (!amount) {
	  errors.amount = 'Amount is required';
	} else if (isNaN(parseFloat(amount))) {
	  errors.amount = 'Amount must be a number';
	} else if (parseFloat(amount) <= 0) {
	  errors.amount = 'Amount must be greater than zero';
	} else if (parseFloat(amount) > 100000) {
	  errors.amount = 'Amount seems unusually high. Please verify.';
	}
	
	// Validate date
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
	
	return errors;
  };
  
  // Financial calculations
  export const calculateTotals = (expensesByCategory) => {
	const totalExpenses = Object.values(expensesByCategory).reduce((sum, value) => sum + value, 0);
	return totalExpenses;
  };
  
  export const calculateSavings = (income, totalExpenses) => {
	return income - totalExpenses;
  };
  
  export const calculateBudgetStatus = (totalExpenses, spendingLimit) => {
	const budgetPercentage = spendingLimit > 0 ? (totalExpenses / spendingLimit) * 100 : 0;
	const isOverBudget = budgetPercentage > 100;
	return { budgetPercentage, isOverBudget };
  };
  
  export const preparePieChartData = (expensesByCategory) => {
	return Object.keys(expensesByCategory).map((key) => ({
	  name: key,
	  value: expensesByCategory[key]
	}));
  };
  
  // Format expenses by month and category for stacked chart
  export const prepareMonthlyBreakdownData = (expenses, categories) => {
	// Group expenses by month and category
	const expensesByMonthAndCategory = {};
	
	expenses.forEach(expense => {
	  const expenseDate = expense.date ? new Date(expense.date) : new Date();
	  const month = expenseDate.toLocaleString('default', { month: 'short' });
	  
	  if (!expensesByMonthAndCategory[month]) {
		expensesByMonthAndCategory[month] = {};
	  }
	  
	  if (!expensesByMonthAndCategory[month][expense.category]) {
		expensesByMonthAndCategory[month][expense.category] = 0;
	  }
	  
	  expensesByMonthAndCategory[month][expense.category] += parseFloat(expense.amount);
	});
	
	// Convert to format for stacked bar chart
	return Object.keys(expensesByMonthAndCategory).map(month => {
	  const monthData = { name: month };
	  
	  categories.forEach(category => {
		monthData[category] = expensesByMonthAndCategory[month][category] || 0;
	  });
	  
	  return monthData;
	});
  };
  