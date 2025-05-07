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

  if (!category || limit === undefined || limit === null) {
    res.status(400).json({
      error: 'Category and limit are required'
    });
    return;
  }

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

    // Convert limit to number if it's a string
    const limitAmount = Number(limit);

    const result: QueryResult<Budget> = await pool.query(
      'INSERT INTO budgets (category, limit_amount, user_id) VALUES ($1, $2, $3) RETURNING *',
      [category, limitAmount, userId]
    );

    // Ensure limit_amount is a number in the response
    const budget = {
      ...result.rows[0],
      limit_amount: Number(result.rows[0].limit_amount),
      _amount: Number(result.rows[0].limit_amount)
    };

    res.status(201).json({
      message: 'Budget created successfully',
      budget
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

    // Add _amount property to each budget for test compatibility and ensure numeric values
    const budgets = result.rows.map(budget => ({
      ...budget,
      limit_amount: Number(budget.limit_amount),
      _amount: Number(budget.limit_amount)
    }));

    res.status(200).json(budgets);
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getBudget = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.params.id) {
    res.status(400).json({ error: 'Budget ID is required' });
    return;
  }

  const { id } = req.params;
  const userId = req.user.id;
  const pool = databaseManager.getPool();

  try {
    const result: QueryResult<Budget> = await pool.query(
      'SELECT * FROM budgets WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Budget not found or unauthorized' });
      return;
    }

    // Ensure limit_amount is a number in the response
    const budget = {
      ...result.rows[0],
      limit_amount: Number(result.rows[0].limit_amount),
      _amount: Number(result.rows[0].limit_amount)
    };

    res.status(200).json(budget);
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const updateBudget = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.params.id) {
    res.status(400).json({ error: 'Budget ID is required' });
    return;
  }

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
    // Convert limit to number
    const limitAmount = Number(limit);

    const result: QueryResult<Budget> = await pool.query(
      'UPDATE budgets SET limit_amount = $1 WHERE id = $2 AND user_id = $3 RETURNING *',
      [limitAmount, id, userId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Budget not found or unauthorized' });
      return;
    }

    // Ensure limit_amount is a number in the response
    const budget = {
      ...result.rows[0],
      limit_amount: Number(result.rows[0].limit_amount),
      _amount: Number(result.rows[0].limit_amount)
    };

    res.status(200).json({
      message: 'Budget updated successfully',
      budget
    });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const deleteBudget = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.params.id) {
    res.status(400).json({ error: 'Budget ID is required' });
    return;
  }

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

    // Ensure limit_amount is a number in the response
    const budget = {
      ...result.rows[0],
      limit_amount: Number(result.rows[0].limit_amount),
      _amount: Number(result.rows[0].limit_amount)
    };

    res.status(200).json({
      message: 'Budget deleted successfully',
      budget
    });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};