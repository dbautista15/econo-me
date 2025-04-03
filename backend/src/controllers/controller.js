const { pool } = require('../utils/db');
const Econome = require('../services/services');

// Initialize a service instance
const economeService = new Econome();

exports.addExpense = async (req, res) => {
    const { category, amount } = req.body;
    try {
        // Insert expense into the database
        const result = await pool.query(
            'INSERT INTO expenses (category, amount) VALUES ($1, $2) RETURNING *', 
            [category, amount]
        );
        
        // Update the service state
        economeService.addExpense(category, amount);
        
        res.status(201).json({ 
            message: 'Expense added successfully',
            expense: result.rows[0]
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
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