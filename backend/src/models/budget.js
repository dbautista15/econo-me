const { pool } = require('../utils/db');

const createBudgetTable = async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS budgets (
                id SERIAL PRIMARY KEY,
                category VARCHAR(255) NOT NULL UNIQUE,
                limit_amount NUMERIC NOT NULL
            )
        `);
        console.log('Budgets table created successfully or already exists');
    } catch (err) {
        console.error('Error creating budgets table:', err);
    }
};

createBudgetTable();
module.exports = { createBudgetTable };