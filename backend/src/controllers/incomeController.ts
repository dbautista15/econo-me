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
    res.json(result.rows);
  } catch (error) {
    console.error('Error getting incomes:', error);
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

    const result: QueryResult<Income> = await pool.query(
      'INSERT INTO incomes (source, amount, income_date, user_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [source, amount, income_date, userId]
    );

    res.status(201).json({ income: result.rows[0] });
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

    res.status(200).json({
      message: 'Income deleted successfully',
      income: result.rows[0]
    });
  } catch (error) {
    console.error('Error deleting income:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
};