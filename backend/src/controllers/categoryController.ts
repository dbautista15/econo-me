import { Request, Response } from 'express';
import { databaseManager } from '../utils/db';
import { QueryResult } from 'pg';
import { ExpenseCategory, AuthenticatedRequest } from '../types';

export const getCategories = async (req: Request, res: Response): Promise<void> => {
  console.log('Categories endpoint called');
  
  try {
    // Default categories from enum
    const defaultCategories = Object.values(ExpenseCategory);
    
    // Try to get categories from database
    try {
      const pool = databaseManager.getPool();
      const result: QueryResult<{category: string}> = await pool.query('SELECT DISTINCT category FROM expenses');
      const distinctCategories = result.rows.map(row => row.category);
      
      // Merge distinct categories with defaults
      const combinedCategories = [...new Set([...distinctCategories, ...defaultCategories])];
      
      console.log('Returning categories:', combinedCategories);
      res.status(200).json(combinedCategories);
    } catch (dbError) {
      // If database query fails, return default categories
      console.log('Database query failed, returning default categories');
      res.status(200).json(defaultCategories);
    }
  } catch (error) {
    console.error('Error in getCategories:', error);
    res.status(500).json({
      message: 'Failed to fetch categories',
      categories: Object.values(ExpenseCategory) // Return defaults even on error
    });
  }
};

export const getCategory = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.params.id) {
    res.status(400).json({ error: 'Category ID is required' });
    return;
  }

  const { id } = req.params;
  
  try {
    // Default categories from enum
    const defaultCategories = Object.values(ExpenseCategory);
    
    if (defaultCategories.includes(id as ExpenseCategory)) {
      res.status(200).json({ category: id });
    } else {
      try {
        const pool = databaseManager.getPool();
        const result: QueryResult<{category: string}> = await pool.query(
          'SELECT DISTINCT category FROM expenses WHERE category = $1',
          [id]
        );
        
        if (result.rows.length === 0) {
          res.status(404).json({ message: 'Category not found' });
          return;
        }
        
        res.status(200).json({ category: result.rows[0].category });
      } catch (dbError) {
        res.status(404).json({ message: 'Category not found' });
      }
    }
  } catch (error) {
    console.error('Error in getCategory:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};