import { ExpenseForm, FormErrors } from '../../../types';
import { transformations } from './transformations';

/**
 * Common validation rules for financial data
 */
export const validators = {
  /**
   * Validates amount fields (income, expense, budget)
   */
  validateAmount: (
    amount: number | string, 
    errors: FormErrors, 
    field: string = 'amount',
    min: number = 0,
    max: number = 1000000
  ): void => {
    const numAmount = transformations.parseAmount(amount);
    
    if (!amount && amount !== 0) {
      errors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
    } else if (isNaN(numAmount)) {
      errors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} must be a number`;
    } else if (numAmount <= min) {
      errors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} must be greater than ${min}`;
    } else if (numAmount > max) {
      errors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} seems unusually high. Please verify.`;
    }
  },
  
  /**
   * Validates date fields (income, expense)
   */
  validateDate: (date: string, errors: FormErrors, field: string = 'date'): void => {
    if (!date) {
      errors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
    } else {
      const selectedDate = new Date(date);
      const today = new Date();
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(today.getFullYear() - 1);
      
      if (selectedDate > today) {
        errors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} cannot be in the future`;
      } else if (selectedDate < oneYearAgo) {
        errors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} cannot be more than one year in the past`;
      }
    }
  },
  
  /**
   * Validates a complete expense form
   */
  validateExpenseForm: (expenseData: ExpenseForm): FormErrors => {
    const errors: FormErrors = {};
    
    validators.validateAmount(expenseData.amount, errors, 'amount', 0, 100000);
    validators.validateDate(expenseData.date, errors);
    
    return errors;
  },
  
  /**
   * Validates income form
   */
  validateIncomeForm: (amount: number | string, incomeDate: string): FormErrors => {
    const errors: FormErrors = {};
    
    validators.validateAmount(amount, errors);
    validators.validateDate(incomeDate, errors);
    
    return errors;
  },
  
  /**
   * Validates spending limit
   */
  validateSpendingLimit: (limit: number | string): FormErrors => {
    const errors: FormErrors = {};
    validators.validateAmount(limit, errors, 'limit', -1, 1000000);
    return errors;
  },
  
  /**
   * Validates savings goal
   */
  validateSavingsGoal: (goal: number | string): FormErrors => {
    const errors: FormErrors = {};
    validators.validateAmount(goal, errors, 'goal', -1, 1000000);
    return errors;
  }
};