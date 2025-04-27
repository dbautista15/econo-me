import { databaseManager } from '../utils/db';

export const createSavingsGoalTable = async (): Promise<void> => {
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
    }
};

createSavingsGoalTable();