import { Response } from 'express';
import { databaseManager } from '../utils/db';
import { QueryResult } from 'pg';
import {
  AuthenticatedRequest,
  Budget
} from '../types';

export const createBudget = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { category, limit } = req.body;
  const userId = req.user.id;
  const pool = databaseManager.getPool();

  try {
    const existingBudget: QueryResult<Budget> = await pool.query(
      'SELECT * FROM budgets WHERE category = $1 AND user_id = $2',
      [category, userId]
    );

    if (existingBudget.rows.length > 0) {
      res.status(400).json({
        message: 'A budget for this category already exists'
      });
      return;
    }

    const result: QueryResult<Budget> = await pool.query(
      'INSERT INTO budgets (category, limit_amount, user_id) VALUES ($1, $2, $3) RETURNING *',
      [category, limit, userId]
    );

    res.status(201).json({
      message: 'Budget created successfully',
      budget: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getBudgets = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const userId = req.user.id;
  const pool = databaseManager.getPool();

  try {
    const result: QueryResult<Budget> = await pool.query(
      'SELECT * FROM budgets WHERE user_id = $1',
      [userId]
    );
    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const updateBudget = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { limit } = req.body;
  const userId = req.user.id;
  const pool = databaseManager.getPool();

  if (limit === undefined || limit === null) {
    res.status(400).json({ 
      error: 'Budget limit is required'
    });
    return;
  }

  try {
    const result: QueryResult<Budget> = await pool.query(
      'UPDATE budgets SET limit_amount = $1 WHERE id = $2 AND user_id = $3 RETURNING *',
      [limit, id, userId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Budget not found or unauthorized' });
      return;
    }

    res.status(200).json({
      message: 'Budget updated successfully',
      budget: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const deleteBudget = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const userId = req.user.id;
  const pool = databaseManager.getPool();

  try {
    const result: QueryResult<Budget> = await pool.query(
      'DELETE FROM budgets WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, userId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Budget not found or unauthorized' });
      return;
    }

    res.status(200).json({
      message: 'Budget deleted successfully',
      budget: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};