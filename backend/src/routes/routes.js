/**
 * Main Routes
 * 
 * This file contains Express routes for the financial management application.
 * It handles core financial data operations including incomes, expenses, 
 * savings goals, categories, and budgets.
 * 
 * @module routes
 */

const express = require('express');
const router = express.Router();
const economeController = require('../controllers/controller');
const authMiddleware = require('../middleware/authMiddleware');
const { pool } = require('../utils/db');
/**
 * Database connection check route
 * GET /db-check
 * 
 * Tests database connectivity and returns available tables
 * 
 * @returns {Object} Status and list of database tables
 */
router.get('/db-check', async (req, res) => {
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
		error: err.message
	  });
	}
});

/**
 * Income routes
 * 
 * GET /incomes - Retrieves all income records
 * POST /incomes - Creates a new income record
 */
router.get('/incomes', authMiddleware,economeController.getIncomes);
router.post('/incomes', authMiddleware,economeController.addIncome);
router.delete('/incomes/:id', authMiddleware, economeController.deleteIncome);

/**
 * Savings goal routes
 * 
 * GET /savings-goals - Retrieves all savings goals
 * POST /savings-goals - Creates a new savings goal
 */
router.get('/savings-goals',authMiddleware, economeController.getSavingsGoals);
router.post('/savings-goals', authMiddleware,economeController.addSavingsGoal);

/**
 * Category routes
 * 
 * GET /categories - Retrieves all expense/income categories
 */
router.get('/categories', economeController.getCategories);

/**
 * Expense routes
 * 
 * GET /expenses - Retrieves all expense records
 * POST /expenses - Creates a new expense record
 * PUT /expenses/:id - Updates an existing expense by ID
 * DELETE /expenses/:id - Deletes an expense by ID
 * POST /expenses/bulk-delete - Deletes multiple expenses in one operation
 */
router.post('/expenses', authMiddleware, economeController.addExpense); // now protected
router.get('/expenses', authMiddleware,economeController.getExpenses);
router.put('/expenses/:id', authMiddleware,economeController.updateExpense);
router.delete('/expenses/:id', authMiddleware,economeController.deleteExpense);
router.post('/expenses/bulk-delete',authMiddleware, economeController.bulkDeleteExpenses);

/**
 * Budget routes
 * 
 * GET /budgets - Retrieves all budget records
 * POST /budgets - Creates a new budget
 * PUT /budgets/:id - Updates an existing budget by ID
 * DELETE /budgets/:id - Deletes a budget by ID
 */
router.post('/budgets', authMiddleware,economeController.createBudget);
router.get('/budgets', authMiddleware,economeController.getBudgets);
router.put('/budgets/:id', authMiddleware,economeController.updateBudget);
router.delete('/budgets/:id', authMiddleware,economeController.deleteBudget);

module.exports = router;