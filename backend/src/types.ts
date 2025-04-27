/**
 * Common TypeScript types and interfaces
 * 
 * This file contains shared type definitions used throughout the application
 */

import { Request,Response } from 'express';
import { QueryResult, QueryResultRow } from 'pg';
import express from 'express';

export function wrapAuthenticatedHandler(handler: AuthenticatedRouteHandler): express.RequestHandler {
  return ((req, res, next) => {
    handler(req as AuthenticatedRequest, res).catch(next);
  }) as express.RequestHandler;
}
export type AuthenticatedRouteHandler = (
	req: AuthenticatedRequest, 
	res: Response
  ) => Promise<void>;
  /**
 * User interface representing authenticated user data
 */
export interface User {
  id: number;
  username: string;
  email: string;
  created_at: Date;
}

/**
 * Extended Request interface with authenticated user
 */
export interface AuthenticatedRequest extends Request {
  user: User;
}

/**
 * Income record interface
 */
export interface Income {
  id: number;
  source: string;
  amount: number;
  income_date: Date;
  user_id: number;
  created_at: Date;
}

/**
 * Expense categories enum for type safety
 */
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

/**
 * Expense record interface
 */
export interface Expense {
  id: number;
  category: string;
  amount: number;
  expense_date: Date;
  user_id: number;
  created_at: Date;
}

/**
 * Savings goal interface
 */
export interface SavingsGoal {
  id: number;
  name: string;
  target_amount: number;
  current_amount: number;
  target_date: Date | null;
  user_id: number;
  created_at: Date;
}

/**
 * Budget record interface
 */
export interface Budget {
  id: number;
  category: string;
  limit_amount: number;
  user_id: number;
  created_at: Date;
}

/**
 * Generic database response type
 */
export type DatabaseResponse<T extends QueryResultRow> = Promise<QueryResult<T>>;

/**
 * API response interfaces
 */
export interface ApiSuccess<T> {
  message: string;
  data: T;
}

export interface ApiError {
  error: string;
  details?: string;
}

/**
 * Request body interfaces
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