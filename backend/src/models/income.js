/**
 * Income Model - SQL Implementation
 * ================================
 * @module models/income
 * @requires ../utils/db
 */
const { pool } = require('../utils/db');
/**
 * Creates the incomes table in the database if it doesn't exist
 *
 * @function createIncomeTable
 * @async
 * 
 * @description
 * Creates a table with the following columns:
 * - id: SERIAL PRIMARY KEY - Auto-incrementing identifier
 * - source: VARCHAR(255) NOT NULL - Income source description
 * - amount: NUMERIC NOT NULL - Income amount
 * - income_date: TIMESTAMP DEFAULT CURRENT_TIMESTAMP - Date of income
 * 
 * @example
 * // Table is created automatically when the module is imported
 * const { createIncomeTable } = require('./models/income');
 * 
 * // To manually create/verify the table:
 * await createIncomeTable();
 */


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