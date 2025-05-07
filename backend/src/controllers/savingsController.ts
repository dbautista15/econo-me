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

    // Add _amount properties for test compatibility and ensure numeric values
    const savingsGoals = result.rows.map(goal => ({
      ...goal,
      target_amount: Number(goal.target_amount),
      current_amount: Number(goal.current_amount),
      _amount: Number(goal.target_amount)
    }));

    res.json(savingsGoals);
  } catch (error) {
    console.error('Error getting savings goals:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
};

/**
 * Get a single savings goal by ID
 */
export const getSavingsGoal = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.params.id) {
    res.status(400).json({ error: 'Savings goal ID is required' });
    return;
  }

  const { id } = req.params;
  const userId = req.user.id;
  const pool = databaseManager.getPool();
  
  try {
    const result: QueryResult<SavingsGoal> = await pool.query(
      'SELECT * FROM savings_goals WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Savings goal not found or unauthorized' });
      return;
    }

    const savingsGoal = {
      ...result.rows[0],
      target_amount: Number(result.rows[0].target_amount),
      current_amount: Number(result.rows[0].current_amount),
      _amount: Number(result.rows[0].target_amount)
    };

    res.json(savingsGoal);
  } catch (error) {
    console.error('Error getting savings goal:', error);
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

    if (!name || target_amount === undefined || target_amount === null) {
      res.status(400).json({ error: 'Name and target amount are required' });
      return;
    }

    // Convert amounts to numbers
    const targetAmount = Number(target_amount);
    const currentAmount = current_amount !== undefined && current_amount !== null ? 
      Number(current_amount) : 0;

    const result: QueryResult<SavingsGoal> = await pool.query(
      'INSERT INTO savings_goals (name, target_amount, current_amount, target_date, user_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, targetAmount, currentAmount, target_date, userId]
    );

    const savingsGoal = {
      ...result.rows[0],
      target_amount: Number(result.rows[0].target_amount),
      current_amount: Number(result.rows[0].current_amount),
      _amount: Number(result.rows[0].target_amount)
    };

    res.status(201).json({ 
      message: 'Savings goal created successfully',
      savingsGoal
    });
  } catch (error) {
    console.error('Error adding savings goal:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
};

/**
 * Update a savings goal
 */
export const updateSavingsGoal = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.params.id) {
    res.status(400).json({ error: 'Savings goal ID is required' });
    return;
  }
  
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const { name, target_amount, current_amount, target_date } = req.body;
    const pool = databaseManager.getPool();
    
    // Validate required fields
    if (!target_amount) {
      res.status(400).json({ error: 'Target amount is required' });
      return;
    }

    // Convert amounts to numbers
    const targetAmount = Number(target_amount);
    const currentAmount = current_amount !== undefined && current_amount !== null ? 
      Number(current_amount) : 0;

    const result: QueryResult<SavingsGoal> = await pool.query(
      'UPDATE savings_goals SET name = $1, target_amount = $2, current_amount = $3, target_date = $4 WHERE id = $5 AND user_id = $6 RETURNING *',
      [name, targetAmount, currentAmount, target_date, id, userId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Savings goal not found or unauthorized' });
      return;
    }

    const savingsGoal = {
      ...result.rows[0],
      target_amount: Number(result.rows[0].target_amount),
      current_amount: Number(result.rows[0].current_amount),
      _amount: Number(result.rows[0].target_amount)
    };

    res.status(200).json({ 
      message: 'Savings goal updated successfully',
      savingsGoal
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
  if (!req.params.id) {
    res.status(400).json({ error: 'Savings goal ID is required' });
    return;
  }
  
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

    const savingsGoal = {
      ...result.rows[0],
      target_amount: Number(result.rows[0].target_amount),
      current_amount: Number(result.rows[0].current_amount),
      _amount: Number(result.rows[0].target_amount)
    };

    res.status(200).json({
      message: 'Savings goal deleted successfully',
      savingsGoal
    });
  } catch (error) {
    console.error('Error deleting savings goal:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
};