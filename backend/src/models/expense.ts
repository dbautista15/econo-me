import { databaseManager } from '../utils/db';

export const createExpenseTable = async (): Promise<void> => {
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
    }
};

createExpenseTable();