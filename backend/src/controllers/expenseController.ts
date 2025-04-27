import { Response } from 'express';
import { databaseManager } from '../utils/db';
import { QueryResult } from 'pg';
import { 
  AuthenticatedRequest, 
  Expense 
} from '../types';

export const getExpenses = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const userId = req.user.id;
  const pool = databaseManager.getPool();
  
  try {
    const result: QueryResult<Expense> = await pool.query(
      'SELECT * FROM expenses WHERE user_id = $1 ORDER BY id DESC',
      [userId]
    );
  
    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
};

export const addExpense = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const pool = databaseManager.getPool();

  try {
    const { category, amount, date } = req.body;
    const userId = req.user.id;
    
    // Use current date if not provided
    const expenseDate = date || new Date().toISOString().split('T')[0];

    const result: QueryResult<Expense> = await pool.query(
      'INSERT INTO expenses (category, amount, expense_date, user_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [category, amount, expenseDate, userId]
    );

    res.status(201).json({
      message: 'Expense added successfully',
      expense: result.rows[0]
    });
  } catch (error) {
    console.error('Error adding expense:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
};

export const updateExpense = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { category, amount } = req.body;
  const userId = req.user.id;
  const pool = databaseManager.getPool();

  try {
    const result: QueryResult<Expense> = await pool.query(
      'UPDATE expenses SET category = $1, amount = $2 WHERE id = $3 AND user_id = $4 RETURNING *',
      [category, amount, id, userId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Expense not found or unauthorized' });
      return;
    }

    res.status(200).json({
      message: 'Expense updated successfully',
      expense: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
};

export const deleteExpense = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const userId = req.user.id;
  const pool = databaseManager.getPool();

  try {
    const result: QueryResult<Expense> = await pool.query(
      'DELETE FROM expenses WHERE id = $1 AND user_id = $2 RETURNING *', 
      [id, userId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Expense not found or unauthorized' });
      return;
    }

    res.status(200).json({
      message: 'Expense deleted successfully',
      expense: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
};

export const bulkDeleteExpenses = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { ids } = req.body;
  const userId = req.user.id;
  const pool = databaseManager.getPool();
  
  if (!Array.isArray(ids) || ids.length === 0) {
    res.status(400).json({ message: 'No valid IDs provided' });
    return;
  }

  try {
    const result: QueryResult<Expense> = await pool.query(
      'DELETE FROM expenses WHERE id = ANY($1) AND user_id = $2 RETURNING *',
      [ids, userId]
    );

    res.status(200).json({
      message: `Successfully deleted ${result.rowCount} expenses`,
      deletedIds: result.rows.map(row => row.id)
    });
  } catch (error) {
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
};