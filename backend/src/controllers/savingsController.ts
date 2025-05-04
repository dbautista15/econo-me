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
// In savingsController.ts, add:
/**
 * Update a savings goal
 */
export const updateSavingsGoal = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const pool = databaseManager.getPool();
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const { name, target_amount, current_amount, target_date } = req.body;
    
    // Validate required fields
    if (!target_amount) {
      res.status(400).json({ error: 'Target amount is required' });
      return;
    }

    const result: QueryResult<SavingsGoal> = await pool.query(
      'UPDATE savings_goals SET name = $1, target_amount = $2, current_amount = $3, target_date = $4 WHERE id = $5 AND user_id = $6 RETURNING *',
      [name, target_amount, current_amount || 0, target_date, id, userId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Savings goal not found or unauthorized' });
      return;
    }

    res.status(200).json({ 
      message: 'Savings goal updated successfully',
      savingsGoal: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating savings goal:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
};
/**
 * Delete a savings goal
 */
export const deleteSavingsGoal = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const userId = req.user.id;
  const pool = databaseManager.getPool();

  try {
    const result: QueryResult<SavingsGoal> = await pool.query(
      'DELETE FROM savings_goals WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, userId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Savings goal not found or unauthorized' });
      return;
    }

    res.status(200).json({
      message: 'Savings goal deleted successfully',
      savingsGoal: result.rows[0]
    });
  } catch (error) {
    console.error('Error deleting savings goal:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
};