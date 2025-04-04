const { pool } = require('../utils/db');

const createRecurringTransactionTable = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS recurring_transactions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        category VARCHAR(255) NOT NULL,
        amount NUMERIC NOT NULL,
        description TEXT,
        frequency VARCHAR(50) NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE,
        last_processed_date DATE,
        next_due_date DATE,
        is_expense BOOLEAN DEFAULT true,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Recurring transactions table created successfully or already exists');
  } catch (err) {
    console.error('Error creating recurring transactions table:', err);
  }
};

createRecurringTransactionTable();
module.exports = { createRecurringTransactionTable };