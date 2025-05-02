export interface QueryResultRow {}
export interface QueryResult<T> {}
import { User } from "../domain/user";
import { Expense,Income,SavingsGoal,Budget } from "../domain/finance";
export type DatabaseResponse<T extends QueryResultRow> = Promise<QueryResult<T>>;

export interface ApiSuccess<T> {
  message: string;
  data: T;
}

export interface ApiError {
  error: string;
  details?: string;
}

// Base response interface
export interface ApiResponseBase {
  message?: string;
  success?: boolean;
}

// User profile response
export interface ProfileResponse extends ApiResponseBase {
  user: User;
}

// Auth response for login/register
export interface AuthResponse extends ApiResponseBase {
  token: string;
  user: User;
}
// Common API response structure
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success?: boolean;
}
export type ExpenseResponse = ApiResponse<Expense>;
export type ExpensesListResponse = ApiResponse<Expense[]>;
export type AddExpenseResponse = ApiResponse<Expense>;
export type IncomeResponse = ApiResponse<Income>;
export type IncomeListResponse = ApiResponse<Income[]>;
export type AddIncomeResponse = ApiResponse<Income>;
export type SavingsGoalResponse = ApiResponse<SavingsGoal>;
export type SavingsGoalListResponse = ApiResponse<SavingsGoal[]>;
export type AddSavingsGoalResponse = ApiResponse<SavingsGoal>;
export type BudgetResponse = ApiResponse<Budget>;
export type BudgetListResponse = ApiResponse<Budget[]>;
export type AddBudgetResponse = ApiResponse<Budget>;