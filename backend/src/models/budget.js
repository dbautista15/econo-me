const { pool } = require('../utils/db');



const createBudgetTable = async () => {
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS budgets (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          category VARCHAR(255) NOT NULL,
          limit_amount NUMERIC NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT unique_user_category UNIQUE (user_id, category)
        )
      `);
      console.log('Budgets table created successfully or already exists');
    } catch (err) {
      console.error('Error creating budgets table:', err);
    }
  };

createBudgetTable();
module.exports = { createBudgetTable };