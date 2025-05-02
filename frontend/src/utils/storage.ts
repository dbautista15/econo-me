import { Income, Budget, SavingsGoal } from '../../../types';

// Define a type for storage keys
type StorageKey = typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS];

// Constants with proper typing
const STORAGE_KEYS = {
  INCOME: 'econo-me-income',
  SAVINGS_GOAL: 'econo-me-savings-goal',
  SPENDING_LIMIT: 'econo-me-spending-limit',
  AUTH_TOKEN: 'token', // Match existing key in api.js
  EXPENSES: 'econo-me-expenses',
  CATEGORIES: 'econo-me-categories',
  PREFERENCES: 'econo-me-preferences'
} as const;

/**
 * Enhanced storage utilities with typed interfaces
 */
export const storageUtils = {
  /**
   * Retrieve a value from local storage with type safety
   */
  getStoredValue: <T>(key: StorageKey, defaultValue: T = null as unknown as T): T => {
    try {
      const value = localStorage.getItem(key);
      if (value === null) return defaultValue;
      
      // Try to parse as JSON, fall back to raw value if it fails
      try {
        return JSON.parse(value) as T;
      } catch (e) {
        return value as unknown as T;
      }
    } catch (error) {
      console.error(`Error reading from localStorage: ${error}`);
      return defaultValue;
    }
  },
  
  /**
   * Store a value in local storage
   */
  storeValue: (key: StorageKey, value: any): boolean => {
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
  },
  
  /**
   * Retrieve the stored income
   */
  getIncome: (): number => {
    return storageUtils.getStoredValue<number>(STORAGE_KEYS.INCOME, 0);
  },
  
  /**
   * Store the income
   */
  storeIncome: (income: number): boolean => {
    return storageUtils.storeValue(STORAGE_KEYS.INCOME, income);
  },
  
  /**
   * Retrieve the savings goal
   */
  getSavingsGoal: (): number => {
    return storageUtils.getStoredValue<number>(STORAGE_KEYS.SAVINGS_GOAL, 0);
  },
  
  /**
   * Store the savings goal
   */
  storeSavingsGoal: (goal: number): boolean => {
    return storageUtils.storeValue(STORAGE_KEYS.SAVINGS_GOAL, goal);
  },
  
  /**
   * Retrieve the spending limit
   */
  getSpendingLimit: (): number => {
    return storageUtils.getStoredValue<number>(STORAGE_KEYS.SPENDING_LIMIT, 0);
  },
  
  /**
   * Store the spending limit
   */
  storeSpendingLimit: (limit: number): boolean => {
    return storageUtils.storeValue(STORAGE_KEYS.SPENDING_LIMIT, limit);
  },
  
  /**
   * Get the auth token
   */
  getAuthToken: (): string | null => {
    return storageUtils.getStoredValue<string | null>(STORAGE_KEYS.AUTH_TOKEN, null);
  },
  
  /**
   * Store the auth token
   */
  storeAuthToken: (token: string): boolean => {
    return storageUtils.storeValue(STORAGE_KEYS.AUTH_TOKEN, token);
  }
};