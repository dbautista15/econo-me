// Keys used for localStorage
const STORAGE_KEYS = {
	INCOME: 'econo-me-income',
	SAVINGS_GOAL: 'econo-me-savings-goal',
	SPENDING_LIMIT: 'econo-me-spending-limit',
	AUTH_TOKEN: 'token', // Match existing key in api.js
  };
  
  // Get a value from localStorage with proper error handling
  const getStoredValue = (key, defaultValue = null) => {
	try {
	  const value = localStorage.getItem(key);
	  if (value === null) return defaultValue;
	  
	  // Try to parse as JSON, fall back to raw value if it fails
	  try {
		return JSON.parse(value);
	  } catch (e) {
		return value;
	  }
	} catch (error) {
	  console.error(`Error reading from localStorage: ${error}`);
	  return defaultValue;
	}
  };
  
  // Store a value in localStorage with proper error handling
  const storeValue = (key, value) => {
	try {
	  // Convert objects/arrays to JSON strings
	  const valueToStore = typeof value === 'object' 
		? JSON.stringify(value) 
		: value;
	  
	  localStorage.setItem(key, valueToStore);
	  return true;
	} catch (error) {
	  console.error(`Error writing to localStorage: ${error}`);
	  return false;
	}
  };
  
  // Specific functions for financial data
  const getIncome = () => parseFloat(getStoredValue(STORAGE_KEYS.INCOME, 0));
  const getSavingsGoal = () => parseFloat(getStoredValue(STORAGE_KEYS.SAVINGS_GOAL, 0));
  const getSpendingLimit = () => parseFloat(getStoredValue(STORAGE_KEYS.SPENDING_LIMIT, 0));
  
  const saveIncome = (value) => storeValue(STORAGE_KEYS.INCOME, value);
  const saveSavingsGoal = (value) => storeValue(STORAGE_KEYS.SAVINGS_GOAL, value);
  const saveSpendingLimit = (value) => storeValue(STORAGE_KEYS.SPENDING_LIMIT, value);
  
  export {
	STORAGE_KEYS,
	getStoredValue,
	storeValue,
	getIncome,
	getSavingsGoal,
	getSpendingLimit,
	saveIncome, 
	saveSavingsGoal,
	saveSpendingLimit
  };