/**
 * @fileoverview Financial Controller Module
 * 
 * This module contains all controller functions for the financial operations
 * of my econo-me application. It handles database operations for incomes,
 * expenses, savings goals, budgets, and categories.
 * 
 * @module controllers/controller
 * @requires ../utils/db
 * @requires ../services/services
 */

const { pool } = require('../utils/db');
const Econome = require('../services/services');
const authMiddleware = require('../middleware/authMiddleware');

const economeService = new Econome();

/**
 * @namespace IncomeControllers
 * @description Controllers for income-related operations
 */

/**
 * Get all income records ordered by date
 * 
 * @function getIncomes
 * @memberof IncomeControllers
 * @async
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with income data or error
 */
exports.getIncomes = async (req, res) => {
    const userId = req.user.id;
  
    try {
      const result = await pool.query(
        'SELECT * FROM incomes WHERE user_id = $1 ORDER BY income_date DESC',
        [userId]
      );
      res.json(result.rows);
    } catch (error) {
      console.error('Error getting incomes:', error);
      res.status(500).json({ error: error.message });
    }
  };
  
  
/**
 * Add a new income record
 * 
 * @function addIncome
 * @memberof IncomeControllers
 * @async
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {string} req.body.source - Income source description
 * @param {number} req.body.amount - Income amount
 * @param {string} req.body.date - Income date
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with created income data or error
 */
exports.addIncome = async (req, res) => {
    try {
      const { source, amount, income_date } = req.body;
      const userId = req.user.id;
  
      const result = await pool.query(
        'INSERT INTO incomes (source, amount, income_date, user_id) VALUES ($1, $2, $3, $4) RETURNING *',
        [source, amount, income_date, userId]
      );
  
      res.status(201).json({ income: result.rows[0] });
    } catch (error) {
      console.error('Error adding income:', error);
      res.status(500).json({ error: error.message });
    }
  };
  /**
 * Delete an income record by ID
 * 
 * @function deleteIncome
 * @memberof IncomeControllers
 * @async
 * @param {Object} req - Express request object
 * @param {Object} req.params - URL parameters
 * @param {string} req.params.id - Income ID to delete
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with deleted income data or error
 */
exports.deleteIncome = async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;
  
    try {
      const result = await pool.query(
        'DELETE FROM incomes WHERE id = $1 AND user_id = $2 RETURNING *',
        [id, userId]
      );
  
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Income not found or unauthorized' });
      }
  
      res.status(200).json({
        message: 'Income deleted successfully',
        income: result.rows[0]
      });
    } catch (err) {
      console.error('Error deleting income:', err);
      res.status(500).json({ error: err.message });
    }
  };
  
  
/**
 * @namespace SavingsGoalControllers
 * @description Controllers for savings goal operations
 */

/**
 * Get all savings goals ordered by creation date
 * 
 * @function getSavingsGoals
 * @memberof SavingsGoalControllers
 * @async
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with savings goals data or error
 */
exports.getSavingsGoals = async (req, res) => {
    const userId = req.user.id;
  
    try {
      const result = await pool.query(
        'SELECT * FROM savings_goals WHERE user_id = $1 ORDER BY created_at DESC',
        [userId]
      );
      res.json(result.rows);
    } catch (error) {
      console.error('Error getting savings goals:', error);
      res.status(500).json({ error: error.message });
    }
  };
  
  
/**
 * Add a new savings goal
 * 
 * @function addSavingsGoal
 * @memberof SavingsGoalControllers
 * @async
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {string} req.body.name - Goal name
 * @param {number} req.body.target_amount - Target amount to save
 * @param {number} req.body.current_amount - Current amount saved (defaults to 0)
 * @param {string} req.body.target_date - Target date to reach goal
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with created savings goal data or error
 */
exports.addSavingsGoal = async (req, res) => {
    try {
      const { name, target_amount, current_amount, target_date } = req.body;
      const userId = req.user.id;
  
      const result = await pool.query(
        'INSERT INTO savings_goals (name, target_amount, current_amount, target_date, user_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [name, target_amount, current_amount || 0, target_date, userId]
      );
  
      res.status(201).json({ savingsGoal: result.rows[0] });
    } catch (error) {
      console.error('Error adding savings goal:', error);
      res.status(500).json({ error: error.message });
    }
  };
  

/**
 * @namespace CategoryControllers
 * @description Controllers for expense category operations
 */

/**
 * Get all distinct expense categories, combined with default categories
 * 
 * @function getCategories
 * @memberof CategoryControllers
 * @async
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with combined category list or error with default categories
 */
exports.getCategories = async (req, res) => {
    try {
        const result = await pool.query('SELECT DISTINCT category FROM expenses');
        const distinctCategories = result.rows.map(row => row.category);

        const defaultCategories = [
            'Food', 'Transportation', 'Housing', 'Utilities', 'Entertainment', 
            'Healthcare', 'Dining Out', 'Shopping'
        ];

        // Merge distinct categories with defaults, removing duplicates
        const combinedCategories = [...new Set([...distinctCategories, ...defaultCategories])];

        res.status(200).json(combinedCategories);
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({
            message: 'Failed to fetch categories',
            defaultCategories: [
                'Food', 'Transportation', 'Housing', 'Utilities', 'Entertainment', 
                'Healthcare', 'Dining Out', 'Shopping'
            ]
        });
    }
};

/**
 * @namespace ExpenseControllers
 * @description Controllers for expense operations
 */

/**
 * Add a new expense record with validation
 * 
 * @function addExpense
 * @memberof ExpenseControllers
 * @async
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {string} req.body.category - Expense category
 * @param {number} req.body.amount - Expense amount
 * @param {string} req.body.date - Expense date (optional, defaults to current date)
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with created expense data or error
 */
exports.addExpense = async (req, res) => {
    const { category, amount, date } = req.body;
    
    try {
        // Validate inputs
        if (!category || !amount) {
            return res.status(400).json({ error: 'Category and amount are required' });
        }

        // Parse and validate amount
        const parsedAmount = parseFloat(amount);
        if (isNaN(parsedAmount) || parsedAmount <= 0) {
            return res.status(400).json({ error: 'Invalid amount' });
        }

        // Validate date (optional)
        const expenseDate = date ? new Date(date) : new Date();
        if (isNaN(expenseDate.getTime())) {
            return res.status(400).json({ error: 'Invalid date' });
        }


        const userId = req.user.id; //assuming you're using auth middleware
        // Insert expense into the database
        const result = await pool.query(
          'INSERT INTO expenses (category, amount, expense_date, user_id) VALUES ($1, $2, $3, $4) RETURNING *',
          [category, parsedAmount, expenseDate, userId] // ✅ all 4 values matched
        );
        

        // Update the service state
        economeService.addExpense(category, parsedAmount);

        res.status(201).json({
            message: 'Expense added successfully',
            expense: result.rows[0]
        });
    } catch (err) {
        console.error('Error adding expense:', err);
        res.status(500).json({ error: 'Failed to add expense', details: err.message });
    }
};

/**
 * Get all expense records ordered by ID (most recent first)
 * 
 * @function getExpenses
 * @memberof ExpenseControllers
 * @async
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with expense data or error
 */
exports.getExpenses = async (req, res) => {
    const userId = req.user.id; // from my authMiddleware
  
    try {
      const result = await pool.query(
        'SELECT * FROM expenses WHERE user_id = $1 ORDER BY id DESC',
        [userId]
      );
  
      res.status(200).json(result.rows);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };
  

/**
 * Update an existing expense record
 * 
 * @function updateExpense
 * @memberof ExpenseControllers
 * @async
 * @param {Object} req - Express request object
 * @param {Object} req.params - URL parameters
 * @param {string} req.params.id - Expense ID to update
 * @param {Object} req.body - Request body
 * @param {string} req.body.category - Updated expense category
 * @param {number} req.body.amount - Updated expense amount
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with updated expense data or error
 */
exports.updateExpense = async (req, res) => {
    const { id } = req.params;
    const { category, amount } = req.body;

    try {
        const result = await pool.query(
            'UPDATE expenses SET category = $1, amount = $2 WHERE id = $3 RETURNING *',
            [category, amount, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Expense not found' });
        }

        res.status(200).json({
            message: 'Expense updated successfully',
            expense: result.rows[0]
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * Delete an expense record by ID
 * 
 * @function deleteExpense
 * @memberof ExpenseControllers
 * @async
 * @param {Object} req - Express request object
 * @param {Object} req.params - URL parameters
 * @param {string} req.params.id - Expense ID to delete
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with deleted expense data or error
 */
exports.deleteExpense = async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query('DELETE FROM expenses WHERE id = $1 RETURNING *', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Expense not found' });
        }

        res.status(200).json({
            message: 'Expense deleted successfully',
            expense: result.rows[0]
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * @namespace BudgetControllers
 * @description Controllers for budget management operations
 */

/**
 * Create a new budget for a category
 * 
 * @function createBudget
 * @memberof BudgetControllers
 * @async
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {string} req.body.category - Budget category
 * @param {number} req.body.limit - Budget limit amount
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with created budget data or error
 */
exports.createBudget = async (req, res) => {
    const { category, limit } = req.body;
    const userId = req.user.id;
  
    try {
      const existingBudget = await pool.query(
        'SELECT * FROM budgets WHERE category = $1 AND user_id = $2',
        [category, userId]
      );
  
      if (existingBudget.rows.length > 0) {
        return res.status(400).json({
          message: 'A budget for this category already exists'
        });
      }
  
      const result = await pool.query(
        'INSERT INTO budgets (category, limit_amount, user_id) VALUES ($1, $2, $3) RETURNING *',
        [category, limit, userId]
      );
  
      res.status(201).json({
        message: 'Budget created successfully',
        budget: result.rows[0]
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };
  

/**
 * Get all budget records
 * 
 * @function getBudgets
 * @memberof BudgetControllers
 * @async
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with budget data or error
 */
exports.getBudgets = async (req, res) => {
    const userId = req.user.id;
  
    try {
      const result = await pool.query(
        'SELECT * FROM budgets WHERE user_id = $1',
        [userId]
      );
      res.status(200).json(result.rows);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };
  

/**
 * Update an existing budget's limit amount
 * 
 * @function updateBudget
 * @memberof BudgetControllers
 * @async
 * @param {Object} req - Express request object
 * @param {Object} req.params - URL parameters
 * @param {string} req.params.id - Budget ID to update
 * @param {Object} req.body - Request body
 * @param {number} req.body.limit - Updated budget limit amount
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with updated budget data or error
 */
exports.updateBudget = async (req, res) => {
    const { id } = req.params;
    const { limit } = req.body;

    try {
        const result = await pool.query(
            'UPDATE budgets SET limit_amount = $1 WHERE id = $2 RETURNING *',
            [limit, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Budget not found' });
        }

        res.status(200).json({
            message: 'Budget updated successfully',
            budget: result.rows[0]
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * Delete a budget record by ID
 * 
 * @function deleteBudget
 * @memberof BudgetControllers
 * @async
 * @param {Object} req - Express request object
 * @param {Object} req.params - URL parameters
 * @param {string} req.params.id - Budget ID to delete
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with deleted budget data or error
 */
exports.deleteBudget = async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query('DELETE FROM budgets WHERE id = $1 RETURNING *', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Budget not found' });
        }

        res.status(200).json({
            message: 'Budget deleted successfully',
            budget: result.rows[0]
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * @namespace BulkOperationControllers
 * @description Controllers for bulk operations
 */

/**
 * Delete multiple expenses in a single operation
 * 
 * @function bulkDeleteExpenses
 * @memberof BulkOperationControllers
 * @async
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {Array<number>} req.body.ids - Array of expense IDs to delete
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with delete count and deleted IDs or error
 */
exports.bulkDeleteExpenses = async (req, res) => {
    const { ids } = req.body;
    
    if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ message: 'No valid IDs provided' });
    }

    try {
        const result = await pool.query(
            'DELETE FROM expenses WHERE id = ANY($1) RETURNING *',
            [ids]
        );

        res.status(200).json({
            message: `Successfully deleted ${result.rowCount} expenses`,
            deletedIds: result.rows.map(row => row.id)
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};