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
  
    // Add _amount property for test compatibility
    const expenses = result.rows.map(expense => ({
      ...expense,
      _amount: expense.amount
    }));

    res.status(200).json(expenses);
  } catch (error) {
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
};

export const getExpense = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.params.id) {
    res.status(400).json({ error: 'Expense ID is required' });
    return;
  }

  const { id } = req.params;
  const userId = req.user.id;
  const pool = databaseManager.getPool();
  
  try {
    const result: QueryResult<Expense> = await pool.query(
      'SELECT * FROM expenses WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
  
    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Expense not found' });
      return;
    }

    res.status(200).json({
      ...result.rows[0],
      _amount: result.rows[0].amount
    });
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
    
    if (!category || amount === undefined || amount === null) {
      res.status(400).json({ error: 'Category and amount are required' });
      return;
    }
    
    // Use current date if not provided
    const expenseDate = date || new Date().toISOString().split('T')[0];

    // Convert amount to number if it's a string
    const expenseAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

    const result: QueryResult<Expense> = await pool.query(
      'INSERT INTO expenses (category, amount, expense_date, user_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [category, expenseAmount, expenseDate, userId]
    );

    res.status(201).json({
      message: 'Expense added successfully',
      expense: {
        ...result.rows[0],
        _amount: result.rows[0].amount
      }
    });
  } catch (error) {
    console.error('Error adding expense:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
};

export const updateExpense = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.params.id) {
    res.status(400).json({ error: 'Expense ID is required' });
    return;
  }

  const { id } = req.params;
  const { category, amount } = req.body;
  const userId = req.user.id;
  const pool = databaseManager.getPool();

  if (!category || amount === undefined || amount === null) {
    res.status(400).json({ error: 'Category and amount are required' });
    return;
  }

  try {
    // Convert amount to number if it's a string
    const expenseAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

    const result: QueryResult<Expense> = await pool.query(
      'UPDATE expenses SET category = $1, amount = $2 WHERE id = $3 AND user_id = $4 RETURNING *',
      [category, expenseAmount, id, userId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Expense not found' });
      return;
    }

    res.status(200).json({
      message: 'Expense updated successfully',
      expense: {
        ...result.rows[0],
        _amount: result.rows[0].amount
      }
    });
  } catch (error) {
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
};

export const deleteExpense = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.params.id) {
    res.status(400).json({ error: 'Expense ID is required' });
    return;
  }

  const { id } = req.params;
  const userId = req.user.id;
  const pool = databaseManager.getPool();

  try {
    const result: QueryResult<Expense> = await pool.query(
      'DELETE FROM expenses WHERE id = $1 AND user_id = $2 RETURNING *', 
      [id, userId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Expense not found' });
      return;
    }

    res.status(200).json({
      message: 'Expense deleted successfully',
      expense: {
        ...result.rows[0],
        _amount: result.rows[0].amount
      }
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

    // Map expenses with _amount for test compatibility
    const expenses = result.rows.map(expense => ({
      ...expense,
      _amount: expense.amount
    }));

    res.status(200).json({
      message: `Successfully deleted ${result.rowCount} expenses`,
      deletedExpenses: expenses
    });
  } catch (error) {
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
};