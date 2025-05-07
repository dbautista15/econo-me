import { Response } from 'express';
import { databaseManager } from '../utils/db';
import { QueryResult } from 'pg';
import { 
  AuthenticatedRequest, 
  AuthenticatedRouteHandler,
  Income 
} from '../types';

/**
 * Get all income records ordered by date
 */
export const getIncomes: AuthenticatedRouteHandler = async (req, res) => {
  const userId = req.user.id;
  const pool = databaseManager.getPool();
  
  try {
    const result: QueryResult<Income> = await pool.query(
      'SELECT * FROM incomes WHERE user_id = $1 ORDER BY income_date DESC',
      [userId]
    );

    // Add _amount property for test compatibility and ensure numeric values
    const incomes = result.rows.map(income => ({
      ...income,
      amount: Number(income.amount),
      _amount: Number(income.amount)
    }));
    
    res.json(incomes);
  } catch (error) {
    console.error('Error getting incomes:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
};

/**
 * Get a specific income record by ID
 */
export const getIncome: AuthenticatedRouteHandler = async (req, res) => {
  if (!req.params.id) {
    res.status(400).json({ error: 'Income ID is required' });
    return;
  }

  const { id } = req.params;
  const userId = req.user.id;
  const pool = databaseManager.getPool();
  
  try {
    const result: QueryResult<Income> = await pool.query(
      'SELECT * FROM incomes WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Income not found or unauthorized' });
      return;
    }
    
    const income = {
      ...result.rows[0],
      amount: Number(result.rows[0].amount),
      _amount: Number(result.rows[0].amount)
    };
    
    res.json(income);
  } catch (error) {
    console.error('Error getting income:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
};

/**
 * Add a new income record
 */
export const addIncome: AuthenticatedRouteHandler = async (req, res) => {
  const pool = databaseManager.getPool();

  try {
    const { source, amount, income_date } = req.body;
    const userId = req.user.id;

    if (!source || amount === undefined || amount === null) {
      res.status(400).json({ error: 'Source and amount are required' });
      return;
    }

    // Convert amount to number
    const incomeAmount = Number(amount);
    
    // Use current date if not provided
    const incomeDate = income_date || new Date().toISOString();

    const result: QueryResult<Income> = await pool.query(
      'INSERT INTO incomes (source, amount, income_date, user_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [source, incomeAmount, incomeDate, userId]
    );

    const income = {
      ...result.rows[0],
      amount: Number(result.rows[0].amount),
      _amount: Number(result.rows[0].amount)
    };

    res.status(201).json({ 
      message: 'Income added successfully',
      income
    });
  } catch (error) {
    console.error('Error adding income:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
};

/**
 * Delete an income record by ID
 */
export const deleteIncome: AuthenticatedRouteHandler = async (req, res) => {
  if (!req.params.id) {
    res.status(400).json({ error: 'Income ID is required' });
    return;
  }

  const { id } = req.params;
  const userId = req.user.id;
  const pool = databaseManager.getPool();

  try {
    const result: QueryResult<Income> = await pool.query(
      'DELETE FROM incomes WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, userId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Income not found or unauthorized' });
      return;
    }

    const income = {
      ...result.rows[0],
      amount: Number(result.rows[0].amount),
      _amount: Number(result.rows[0].amount)
    };

    res.status(200).json({
      message: 'Income deleted successfully',
      income
    });
  } catch (error) {
    console.error('Error deleting income:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
};

/**
 * Update an income record
 */
export const updateIncome: AuthenticatedRouteHandler = async (req, res) => {
  if (!req.params.id) {
    res.status(400).json({ error: 'Income ID is required' });
    return;
  }

  const { id } = req.params;
  const { source, amount, income_date } = req.body;
  const userId = req.user.id;
  const pool = databaseManager.getPool();

  if (!source || amount === undefined || amount === null) {
    res.status(400).json({ error: 'Source and amount are required' });
    return;
  }

  try {
    // Convert amount to number
    const incomeAmount = Number(amount);

    const result: QueryResult<Income> = await pool.query(
      'UPDATE incomes SET source = $1, amount = $2, income_date = $3 WHERE id = $4 AND user_id = $5 RETURNING *',
      [source, incomeAmount, income_date, id, userId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Income not found or unauthorized' });
      return;
    }

    const income = {
      ...result.rows[0],
      amount: Number(result.rows[0].amount),
      _amount: Number(result.rows[0].amount)
    };

    res.status(200).json({
      message: 'Income updated successfully',
      income
    });
  } catch (error) {
    console.error('Error updating income:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
};