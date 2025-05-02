/**
 * API request types
 */

export interface IncomeRequest {
	source: string;
	amount: number;
	income_date: string;
  }
  
  export interface ExpenseRequest {
	category: string;
	amount: number;
	date?: string;
  }
  
  export interface SavingsGoalRequest {
	name: string;
	target_amount: number;
	current_amount?: number;
	target_date?: string | null;
  }
  
  export interface BudgetRequest {
	category: string;
	limit: number;
  }
  
  export interface BulkDeleteRequest {
	ids: number[];
  }