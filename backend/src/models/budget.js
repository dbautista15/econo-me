/**
 * Budget Model - SQL Implementation
 * ================================
 * @module models/budget
 * @requires ../utils/db
 */
const { pool } = require('../utils/db');
/**
 * Creates the budgets table in the database if it doesn't exist
 *
 * @function createBudgetTable
 * @async
 * 
 * @description
 * Creates a table with the following columns:
 * - id: SERIAL PRIMARY KEY - Auto-incrementing identifier
 * - category: VARCHAR(255) NOT NULL UNIQUE - Budget category name (unique)
 * - limit_amount: NUMERIC NOT NULL - Budget limit amount
 * 
 * @example
 * // Table is created automatically when the module is imported
 * const { createBudgetTable } = require('./models/budget');
 * 
 * // To manually create/verify the table:
 * await createBudgetTable();
 */

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