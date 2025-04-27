/**
 * Expense Model - SQL Implementation
 * =================================
 * @module models/expense
 * @requires ../utils/db
 */
const { pool } = require('../utils/db');
/**
 * Creates the expenses table in the database if it doesn't exist
 *
 * @function createExpenseTable
 * @async
 * 
 * @description
 * Creates a table with the following columns:
 * - id: SERIAL PRIMARY KEY - Auto-incrementing identifier
 * - category: VARCHAR(255) NOT NULL - Expense category
 * - amount: NUMERIC NOT NULL - Expense amount
 * - expense_date: TIMESTAMP DEFAULT CURRENT_TIMESTAMP - Date of expense
 * 
 * @example
 * // Table is created automatically when the module is imported
 * const { createExpenseTable } = require('./models/expense');
 * 
 * // To manually create/verify the table:
 * await createExpenseTable();
 */

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