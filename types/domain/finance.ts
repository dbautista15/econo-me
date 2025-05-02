/**
 * Core financial data models
 */

export interface Expense {
	id: number;
	category: string;
	amount: number;
	expense_date: string | Date;
	description?: string;
	user_id?: number;
	created_at?: string | Date;
	date?: string; // For compatibility with existing code
  }
  
  export interface Income {
	id: number;
	source: string;
	amount: number;
	date: string;
	income_date: string | Date; // For compatibility with backend
	user_id: number;
	created_at?: string | Date;
  }
  
  export interface Budget {
	id: number;
	category: string;
	limit_amount: number;
	user_id: number;
	created_at: Date;
  }
  
  export interface SavingsGoal {
	id?: number;
	name: string;
	target_amount: number;
	current_amount: number;
	target_date: string | Date | null;
	user_id?: number;
	created_at?: Date;
  }
  
  export interface RawSuggestion {
	daily: string;  // The raw value from calculations (as string)
	frequency: string | null;
	nextDate: string;
	id?: number;
	title?: string;
	description?: string;
	limit?: number;
  }
  
  export interface Suggestion {
	daily: number;  // Processed as number for UI components
	frequency: string | null;
	nextDate: string;
	id?: number;
	title?: string;
	description?: string;
	limit?: number;
  }
  
  export interface CategorySummary {
	[category: string]: number;
  }
  
  export enum ExpenseCategory {
	Food = 'Food',
	Transportation = 'Transportation',
	Housing = 'Housing',
	Utilities = 'Utilities',
	Entertainment = 'Entertainment',
	Healthcare = 'Healthcare',
	DiningOut = 'Dining Out',
	Shopping = 'Shopping'
  }
  
  export interface ExpenseForm {
	category: string;
	amount: string | number;
	date: string;
  }