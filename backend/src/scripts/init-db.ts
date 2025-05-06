import { databaseManager } from '../utils/db';

/**
 * Create users table
 */
const createUserTable = async (): Promise<void> => {
  const pool = databaseManager.getPool();
  
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) NOT NULL UNIQUE,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Users table created successfully or already exists');
  } catch (err) {
    console.error('Error creating users table:', err);
    throw err; // Rethrow to stop the initialization process if users table fails
  }
};

/**
 * Create expenses table
 */
const createExpenseTable = async (): Promise<void> => {
  const pool = databaseManager.getPool();
  
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS expenses (
        id SERIAL PRIMARY KEY,
        category VARCHAR(255) NOT NULL,
        amount NUMERIC NOT NULL,
        expense_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        user_id INTEGER NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);
    console.log('Expenses table created successfully or already exists');
  } catch (err) {
    console.error('Error creating expenses table:', err);
    throw err;
  }
};

/**
 * Create incomes table
 */
const createIncomeTable = async (): Promise<void> => {
  const pool = databaseManager.getPool();
  
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS incomes (
        id SERIAL PRIMARY KEY,
        source VARCHAR(255) NOT NULL,
        amount NUMERIC NOT NULL,
        income_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        user_id INTEGER NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);
    console.log('Incomes table created successfully or already exists');
  } catch (err) {
    console.error('Error creating incomes table:', err);
    throw err;
  }
};

/**
 * Create budgets table
 */
const createBudgetTable = async (): Promise<void> => {
  const pool = databaseManager.getPool();
  
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS budgets (
        id SERIAL PRIMARY KEY,
        category VARCHAR(255) NOT NULL,
        limit_amount NUMERIC NOT NULL,
        user_id INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);
    console.log('Budgets table created successfully or already exists');
  } catch (err) {
    console.error('Error creating budgets table:', err);
    throw err;
  }
};

/**
 * Create savings goals table
 */
const createSavingsGoalTable = async (): Promise<void> => {
  const pool = databaseManager.getPool();
  
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS savings_goals (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        target_amount NUMERIC NOT NULL,
        current_amount NUMERIC DEFAULT 0,
        target_date DATE,
        user_id INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);
    console.log('Savings goals table created successfully or already exists');
  } catch (err) {
    console.error('Error creating savings goals table:', err);
    throw err;
  }
};

/**
 * Initialize all database tables in correct order
 */
const initializeDatabase = async (): Promise<void> => {
  try {
    // Ensure database connection works
    await databaseManager.testConnection();
    console.log('Database connection successful');
    
    // Create tables in order of dependencies
    await createUserTable();
    await createExpenseTable();
    await createIncomeTable();
    await createBudgetTable();
    await createSavingsGoalTable();
    
    console.log('Database initialization completed successfully');
    
    // Close the pool to allow the script to exit
    const pool = databaseManager.getPool();
    await pool.end();
  } catch (err) {
    console.error('Database initialization failed:', err);
    process.exit(1);
  }
};

// Run initialization
initializeDatabase().then(() => {
  console.log('Database setup complete, exiting initialization script');
  process.exit(0);
}).catch(err => {
  console.error('Unexpected error during database initialization:', err);
  process.exit(1);
});