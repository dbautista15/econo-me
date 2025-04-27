import { databaseManager } from '../utils/db';

export const createBudgetTable = async (): Promise<void> => {
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
    }
};

createBudgetTable();