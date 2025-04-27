import { Pool, PoolClient } from 'pg';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

class DatabaseManager {
  private pool: Pool;

  constructor() {
    // PostgreSQL Connection Pool
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/econo-me'
    });

    // Error handler for unexpected pool errors
    this.pool.on('error', (err) => {
      console.error('Unexpected error on PostgreSQL connection:', err);
      process.exit(-1);
    });
  }

  /**
   * Test Database Connection
   * Tests PostgreSQL raw connection
   */
  async testConnection(): Promise<boolean> {
    try {
      const client: PoolClient = await this.pool.connect();
      console.log('PostgreSQL connection successful');
      client.release();
      return true;
    } catch (err) {
      console.error('Database connection error:', err);
      throw err;
    }
  }

  /**
   * Get PostgreSQL connection pool
   */
  getPool(): Pool {
    return this.pool;
  }
}

// Create and export a singleton instance
export const databaseManager = new DatabaseManager();