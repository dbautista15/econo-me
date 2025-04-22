const { pool } = require('../utils/db');
const Econome = require('../services/services');
const economeService = new Econome();

// Income controllers
exports.getIncomes = async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM incomes ORDER BY income_date DESC');
      res.json(result.rows);
    } catch (error) {
      console.error('Error getting incomes:', error);
      res.status(500).json({ error: error.message });
    }
  };
  
  exports.addIncome = async (req, res) => {
    try {
      const { source, amount, date } = req.body;
      
      const result = await pool.query(
        'INSERT INTO incomes (source, amount, income_date) VALUES ($1, $2, $3) RETURNING *',
        [source, amount, date]
      );
      
      res.status(201).json({ income: result.rows[0] });
    } catch (error) {
      console.error('Error adding income:', error);
      res.status(500).json({ error: error.message });
    }
  };
  
  // Savings Goal controllers
  exports.getSavingsGoals = async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM savings_goals ORDER BY created_at DESC');
      res.json(result.rows);
    } catch (error) {
      console.error('Error getting savings goals:', error);
      res.status(500).json({ error: error.message });
    }
  };
  
  exports.addSavingsGoal = async (req, res) => {
    try {
      const { name, target_amount, current_amount, target_date } = req.body;
      
      const result = await pool.query(
        'INSERT INTO savings_goals (name, target_amount, current_amount, target_date) VALUES ($1, $2, $3, $4) RETURNING *',
        [name, target_amount, current_amount || 0, target_date]
      );
      
      res.status(201).json({ savingsGoal: result.rows[0] });
    } catch (error) {
      console.error('Error adding savings goal:', error);
      res.status(500).json({ error: error.message });
    }
  };
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

        // Insert expense into the database
        const result = await pool.query(
            'INSERT INTO expenses (category, amount, expense_date) VALUES ($1, $2, $3) RETURNING *',
            [category, parsedAmount, date]
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

exports.getExpenses = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM expenses ORDER BY id DESC');
        res.status(200).json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

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

// Budget management
exports.createBudget = async (req, res) => {
    const { category, limit } = req.body;

    try {
        // First, check if a budget for this category already exists
        const existingBudget = await pool.query(
            'SELECT * FROM budgets WHERE category = $1',
            [category]
        );

        if (existingBudget.rows.length > 0) {
            return res.status(400).json({
                message: 'A budget for this category already exists'
            });
        }

        const result = await pool.query(
            'INSERT INTO budgets (category, limit_amount) VALUES ($1, $2) RETURNING *',
            [category, limit]
        );

        res.status(201).json({
            message: 'Budget created successfully',
            budget: result.rows[0]
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getBudgets = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM budgets');
        res.status(200).json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

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
// Add this to your controller
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
