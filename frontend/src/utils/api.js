import axios from 'axios';

const API_BASE_URL = 'http://localhost:5003/api';

const api = axios.create({
  baseURL: 'http://localhost:5003/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add a request interceptor to include token if exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;

// Expense-related API calls
export const fetchExpenses = async () => {
  const response = await fetch(`${API_BASE_URL}/expenses`);
  if (!response.ok) {
    throw new Error('Failed to fetch expenses');
  }
  return await response.json();
};
export const fetchCategories = async () => {
	try {
	  const response = await axios.get('/api/categories'); // Adjust endpoint as needed
	  return response.data;
	} catch (error) {
	  console.error('Error fetching categories', error);
	  return [
		'Food', 
		'Transportation', 
		'Housing', 
		'Utilities', 
		'Entertainment'
	  ]; // Fallback categories
	}
  };
// In utils/api.js
export const addExpense = async (expenseData) => {
	try {
	  // Ensure date is a valid ISO string
	  const formattedExpense = {
		...expenseData,
		date: new Date(expenseData.date).toISOString(),
		amount: parseFloat(expenseData.amount)
	  };
  
	  const response = await fetch('/api/expenses', {
		method: 'POST',
		headers: { 
		  'Content-Type': 'application/json' 
		},
		body: JSON.stringify(formattedExpense)
	  });
  
	  if (!response.ok) {
		const errorData = await response.json();
		throw new Error(errorData.message || 'Failed to add expense');
	  }
  
	  return await response.json();
	} catch (error) {
	  console.error('Error in addExpense:', error);
	  throw error;
	}
  };

// Budget-related API calls
export const fetchBudgets = async () => {
  const response = await fetch(`${API_BASE_URL}/budgets`);
  if (!response.ok) {
    throw new Error('Failed to fetch budgets');
  }
  return await response.json();
};

export const updateBudget = async (id, amount) => {
  const response = await fetch(`${API_BASE_URL}/budgets/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ limit_amount: amount })
  });

  if (!response.ok) {
    throw new Error('Failed to update budget');
  }
  return await response.json();
};

export const createBudget = async (category, amount) => {
  const response = await fetch(`${API_BASE_URL}/budgets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ category, limit_amount: amount })
  });

  if (!response.ok) {
    throw new Error('Failed to create budget');
  }
  return await response.json();
};