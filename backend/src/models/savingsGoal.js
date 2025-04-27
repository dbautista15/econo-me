/**
 * Savings Goal Model - SQL Implementation
 * =====================================
 * @module models/savingsGoal
 * @requires ../utils/db
 */
const { pool } = require('../utils/db');
/**
 * Creates the savings_goals table in the database if it doesn't exist
 *
 * @function createSavingsGoalTable
 * @async
 * 
 * @description
 * Creates a table with the following columns:
 * - id: SERIAL PRIMARY KEY - Auto-incrementing identifier
 * - name: VARCHAR(255) NOT NULL - Goal name/description
 * - target_amount: NUMERIC NOT NULL - Target amount to save
 * - current_amount: NUMERIC DEFAULT 0 - Current progress toward goal
 * - target_date: DATE - Target date to reach goal
 * - created_at: TIMESTAMP DEFAULT CURRENT_TIMESTAMP - Date goal was created
 * 
 * @example
 * // Table is created automatically when the module is imported
 * const { createSavingsGoalTable } = require('./models/savingsGoal');
 * 
 * // To manually create/verify the table:
 * await createSavingsGoalTable();
 */


const createSavingsGoalTable = async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS savings_goals (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                target_amount NUMERIC NOT NULL,
                current_amount NUMERIC DEFAULT 0,
                target_date DATE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('Savings goals table created successfully or already exists');
    } catch (err) {
        console.error('Error creating savings goals table:', err);
    }
};

createSavingsGoalTable();
module.exports = { createSavingsGoalTable };