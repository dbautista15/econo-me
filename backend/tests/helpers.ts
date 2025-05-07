import jwt from 'jsonwebtoken';
import { databaseManager } from '../src/utils/db';

export const JWT_SECRET = process.env.JWT_SECRET || 'your-default-secret-key';

// Helper functions for tests
export const generateTestToken = (userId: number = 1): string => {
  return jwt.sign({ id: userId, email: 'test@example.com' }, JWT_SECRET, { expiresIn: '1h' });
};

// Clear test user data from database
export const clearUserData = async (userId: number): Promise<void> => {
  const pool = databaseManager.getPool();
  await pool.query('DELETE FROM budgets WHERE user_id = $1', [userId]);
  await pool.query('DELETE FROM expenses WHERE user_id = $1', [userId]);
  await pool.query('DELETE FROM incomes WHERE user_id = $1', [userId]);
  await pool.query('DELETE FROM savings_goals WHERE user_id = $1', [userId]);
};

// Helper functions to create test data
export const createTestBudget = async (userId: number, category: string, limit: number): Promise<any> => {
  const pool = databaseManager.getPool();
  const result = await pool.query(
    'INSERT INTO budgets (category, limit_amount, user_id) VALUES ($1, $2, $3) RETURNING *',
    [category, limit, userId]
  );
  return result.rows[0];
};

export const createTestExpense = async (userId: number, category: string, amount: number): Promise<any> => {
  const pool = databaseManager.getPool();
  const result = await pool.query(
    'INSERT INTO expenses (category, amount, expense_date, user_id) VALUES ($1, $2, $3, $4) RETURNING *',
    [category, amount, new Date(), userId]
  );
  return result.rows[0];
};

export const createTestIncome = async (userId: number, source: string, amount: number): Promise<any> => {
  const pool = databaseManager.getPool();
  const result = await pool.query(
    'INSERT INTO incomes (source, amount, income_date, user_id) VALUES ($1, $2, $3, $4) RETURNING *',
    [source, amount, new Date(), userId]
  );
  return result.rows[0];
};

export const createTestSavingsGoal = async (userId: number, name: string, targetAmount: number): Promise<any> => {
  const pool = databaseManager.getPool();
  const result = await pool.query(
    'INSERT INTO savings_goals (name, target_amount, current_amount, target_date, user_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    [name, targetAmount, 0, new Date(), userId]
  );
  return result.rows[0];
};