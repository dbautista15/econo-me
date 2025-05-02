import { Request, Response } from 'express';
import { databaseManager } from '../utils/db';
import { QueryResult } from 'pg';
import { ExpenseCategory } from '../types';

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