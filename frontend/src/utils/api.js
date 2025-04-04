import axios from 'axios';
const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: 'http://localhost:3000/api', // Your backend API base URL
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

export const addExpense = async (expenseData) => {
  const response = await fetch(`${API_BASE_URL}/expenses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(expenseData)
  });

  if (!response.ok) {
    throw new Error('Failed to add expense');
  }
  return await response.json();
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
// frontend/src/utils/api.js - Add these new functions

// User settings
export const fetchUserSettings = async () => {
	const response = await api.get('/settings');
	return response.data;
  };
  
  export const updateUserSettings = async (settingsData) => {
	const response = await api.put('/settings', settingsData);
	return response.data;
  };
  
  // User profile
  export const fetchUserProfile = async () => {
	const response = await api.get('/auth/profile/details');
	return response.data;
  };
  
  export const updateUserProfile = async (profileData) => {
	const response = await api.put('/auth/profile/details', profileData);
	return response.data;
  };
  
  // Recurring transactions
  export const fetchRecurringTransactions = async () => {
	const response = await api.get('/recurring');
	return response.data;
  };
  
  export const createRecurringTransaction = async (transactionData) => {
	const response = await api.post('/recurring', transactionData);
	return response.data;
  };
  
  export const updateRecurringTransaction = async (id, transactionData) => {
	const response = await api.put(`/recurring/${id}`, transactionData);
	return response.data;
  };
  
  export const deleteRecurringTransaction = async (id) => {
	const response = await api.delete(`/recurring/${id}`);
	return response.data;
  };
  
  export const processRecurringTransactions = async () => {
	const response = await api.post('/recurring/process');
	return response.data;
  };