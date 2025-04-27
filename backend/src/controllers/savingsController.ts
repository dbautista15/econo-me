import { Response } from 'express';
import { databaseManager } from '../utils/db';
import { QueryResult } from 'pg';
import { 
  AuthenticatedRequest, 
  SavingsGoal 
} from '../types';

/**
 * Get all savings goals ordered by creation date
 */
export const getSavingsGoals = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const userId = req.user.id;
  const pool = databaseManager.getPool();
  
  try {
    const result: QueryResult<SavingsGoal> = await pool.query(
      'SELECT * FROM savings_goals WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error getting savings goals:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
};

/**
 * Add a new savings goal
 */
export const addSavingsGoal = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const pool = databaseManager.getPool();

  try {
    const { name, target_amount, current_amount, target_date } = req.body;
    const userId = req.user.id;

    const result: QueryResult<SavingsGoal> = await pool.query(
      'INSERT INTO savings_goals (name, target_amount, current_amount, target_date, user_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, target_amount, current_amount || 0, target_date, userId]
    );

    res.status(201).json({ savingsGoal: result.rows[0] });
  } catch (error) {
    console.error('Error adding savings goal:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
};