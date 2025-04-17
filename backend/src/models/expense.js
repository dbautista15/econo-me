const { pool } = require('../utils/db');

const createExpenseTable = async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS expenses (
                id SERIAL PRIMARY KEY,
                category VARCHAR(255) NOT NULL,
                amount NUMERIC NOT NULL,
                expense_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('Expenses table created successfully or already exists');
    } catch (err) {
        console.error('Error creating expenses table:', err);
    }
};

createExpenseTable();
module.exports = { createExpenseTable };