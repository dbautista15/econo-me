import jwt from 'jsonwebtoken';
import { databaseManager } from '../src/utils/db';

/**
 * Generate a test JWT token with a specific user ID
 */
export const generateTestToken = (userId: number): string => {
  return jwt.sign(
    { id: userId, email: 'test@example.com', username: 'testuser' },
    process.env.JWT_SECRET || 'your-default-secret-key',
    { expiresIn: '1h' }
  );
};

/**
 * Clear all test user data from the database
 */
export const clearUserData = async (userId: number): Promise<void> => {
  const pool = databaseManager.getPool();
  
  try {
    // Clear in order of dependencies to avoid constraint issues
    await pool.query('DELETE FROM expenses WHERE user_id = $1', [userId]);
    await pool.query('DELETE FROM incomes WHERE user_id = $1', [userId]);
    await pool.query('DELETE FROM budgets WHERE user_id = $1', [userId]);
    await pool.query('DELETE FROM savings_goals WHERE user_id = $1', [userId]);
    // Don't delete the test user itself, as we're reusing it for multiple tests
  } catch (err) {
    console.error('Error clearing test data:', err);
  }
};

/**
 * Create a test budget for testing
 */
export const createTestBudget = async (
  userId: number, 
  category: string, 
  limit_amount: number
): Promise<{ id: number; category: string; limit_amount: number }> => {
  const pool = databaseManager.getPool();
  
  try {
    // First check if a budget with this category already exists for this user
    const existingBudget = await pool.query(
      'SELECT * FROM budgets WHERE user_id = $1 AND category = $2',
      [userId, category]
    );
    
    // If it exists, return it rather than creating a duplicate
    if (existingBudget.rows.length > 0) {
      return existingBudget.rows[0];
    }
    
    // Otherwise, create a new budget
    const result = await pool.query(
      'INSERT INTO budgets (category, limit_amount, user_id) VALUES ($1, $2, $3) RETURNING id, category, limit_amount',
      [category, limit_amount, userId]
    );
    
    return result.rows[0];
  } catch (err) {
    console.error(`Error creating test budget for category ${category}:`, err);
    throw err;
  }
};

/**
 * Create a test expense for testing
 */
export const createTestExpense = async (
  userId: number, 
  category: string, 
  amount: number
): Promise<{ id: number; category: string; amount: number }> => {
  const pool = databaseManager.getPool();
  
  try {
    const result = await pool.query(
      'INSERT INTO expenses (category, amount, user_id) VALUES ($1, $2, $3) RETURNING id, category, amount',
      [category, amount, userId]
    );
    
    return result.rows[0];
  } catch (err) {
    console.error(`Error creating test expense for category ${category}:`, err);
    throw err;
  }
};

/**
 * Create a test income for testing
 */
export const createTestIncome = async (
  userId: number, 
  source: string, 
  amount: number
): Promise<{ id: number; source: string; amount: number }> => {
  const pool = databaseManager.getPool();
  
  try {
    const result = await pool.query(
      'INSERT INTO incomes (source, amount, user_id) VALUES ($1, $2, $3) RETURNING id, source, amount',
      [source, amount, userId]
    );
    
    return result.rows[0];
  } catch (err) {
    console.error(`Error creating test income for source ${source}:`, err);
    throw err;
  }
};

/**
 * Create a test savings goal for testing
 */
export const createTestSavingsGoal = async (
  userId: number, 
  name: string, 
  target_amount: number
): Promise<{ id: number; name: string; target_amount: number }> => {
  const pool = databaseManager.getPool();
  
  try {
    const result = await pool.query(
      'INSERT INTO savings_goals (name, target_amount, user_id) VALUES ($1, $2, $3) RETURNING id, name, target_amount',
      [name, target_amount, userId]
    );
    
    return result.rows[0];
  } catch (err) {
    console.error(`Error creating test savings goal for ${name}:`, err);
    throw err;
  }
};