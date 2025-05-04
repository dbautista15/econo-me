import express, { Request, Response } from 'express';
import { databaseManager } from '../utils/db';
import * as controllers from '../controllers';
import authMiddleware from '../middleware/authMiddleware';
import { User, AuthenticatedRouteHandler,AuthenticatedRequest,Income,Expense,wrapAuthenticatedHandler } from '../types';

const router = express.Router();

router.get('/db-check', async (req: Request, res: Response): Promise<void> => {
  const pool = databaseManager.getPool();

  try {
    const client = await pool.connect();
    const tablesQuery = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    
    const tables = tablesQuery.rows.map(row => row.table_name);
    client.release();
    
    res.status(200).json({
      status: 'Database connection successful',
      tables: tables
    });
  } catch (err) {
    res.status(500).json({
      status: 'Database connection failed',
      error: err instanceof Error ? err.message : 'Unknown error'
    });
  }
});

// Income routes
router.get('/incomes', authMiddleware, wrapAuthenticatedHandler(controllers.getIncomes));
router.post('/incomes', authMiddleware, wrapAuthenticatedHandler(controllers.addIncome));
router.delete('/incomes/:id', authMiddleware, wrapAuthenticatedHandler(controllers.deleteIncome));
router.put('/incomes/:id', authMiddleware, wrapAuthenticatedHandler(controllers.updateIncome));

// Savings goal routes
router.get('/savings-goals', authMiddleware, wrapAuthenticatedHandler(controllers.getSavingsGoals));
router.post('/savings-goals', authMiddleware, wrapAuthenticatedHandler(controllers.addSavingsGoal));
router.put('/savings-goals/:id', authMiddleware, wrapAuthenticatedHandler(controllers.updateSavingsGoal));
router.delete('/savings-goals/:id', authMiddleware, wrapAuthenticatedHandler(controllers.deleteSavingsGoal));


router.get('/categories',controllers.getCategories);

// Expense routes
router.post('/expenses', authMiddleware, wrapAuthenticatedHandler(controllers.addExpense));
router.get('/expenses', authMiddleware, wrapAuthenticatedHandler(controllers.getExpenses));
router.put('/expenses/:id', authMiddleware, wrapAuthenticatedHandler(controllers.updateExpense));
router.delete('/expenses/:id', authMiddleware, wrapAuthenticatedHandler(controllers.deleteExpense));
router.post('/expenses/bulk-delete', authMiddleware, wrapAuthenticatedHandler(controllers.bulkDeleteExpenses));

// Budget routes
router.post('/budgets', authMiddleware, wrapAuthenticatedHandler(controllers.createBudget));
router.get('/budgets', authMiddleware, wrapAuthenticatedHandler(controllers.getBudgets));
router.put('/budgets/:id', authMiddleware, wrapAuthenticatedHandler(controllers.updateBudget));
router.delete('/budgets/:id', authMiddleware, wrapAuthenticatedHandler(controllers.deleteBudget));

export default router;