const { pool } = require('../utils/db');

const createIncomeTable = async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS incomes (
                id SERIAL PRIMARY KEY,
                source VARCHAR(255) NOT NULL,
                amount NUMERIC NOT NULL,
                income_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('Incomes table created successfully or already exists');
    } catch (err) {
        console.error('Error creating incomes table:', err);
    }
};

createIncomeTable();
module.exports = { createIncomeTable };