import { databaseManager } from '../utils/db';

export const createIncomeTable = async (): Promise<void> => {
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
    }
};

createIncomeTable();