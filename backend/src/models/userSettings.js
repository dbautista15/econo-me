const { pool } = require('../utils/db');

const createUserSettingsTable = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_settings (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        monthly_income NUMERIC DEFAULT 0,
        spending_limit NUMERIC DEFAULT 0,
        savings_goal NUMERIC DEFAULT 0,
        theme VARCHAR(50) DEFAULT 'light',
        notification_enabled BOOLEAN DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT unique_user_settings UNIQUE (user_id)
      )
    `);
    console.log('User settings table created successfully or already exists');
  } catch (err) {
    console.error('Error creating user settings table:', err);
  }
};

createUserSettingsTable();
module.exports = { createUserSettingsTable };