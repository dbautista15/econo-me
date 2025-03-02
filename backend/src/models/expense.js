const pool = require('../utils/db');

const createExpenseTable = async () => {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS expenses (
            id SERIAL PRIMARY KEY,
            category VARCHAR(255) NOT NULL,
            amount NUMERIC NOT NULL
        )
    `);
};

createExpenseTable();
module.exports = pool;