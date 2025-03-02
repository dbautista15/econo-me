const pool = require('../utils/db');

exports.addExpense = async (req, res) => {
    const { category, amount } = req.body;
    try {
        // Insert expense into the database
        await pool.query('INSERT INTO expenses (category, amount) VALUES ($1, $2)', [category, amount]);
        res.status(201).json({ message: 'Expense added successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Other methods like categorizeExpenses, setSpendingLimit, setSavingsGoal, etc.