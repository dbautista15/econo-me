import { Request, Response } from 'express';
import { databaseManager } from '../utils/db';
import { QueryResult } from 'pg';
import { 
  ExpenseCategory 
} from '../types';

export const getCategories = async (req: Request, res: Response): Promise<void> => {
  const pool = databaseManager.getPool();

  try {
    const result: QueryResult<{category: string}> = await pool.query('SELECT DISTINCT category FROM expenses');
    const distinctCategories = result.rows.map(row => row.category);

    const defaultCategories = Object.values(ExpenseCategory);

    // Merge distinct categories with defaults, removing duplicates
    const combinedCategories = [...new Set([...distinctCategories, ...defaultCategories])];

    res.status(200).json(combinedCategories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      message: 'Failed to fetch categories',
      defaultCategories: Object.values(ExpenseCategory)
    });
  }
};