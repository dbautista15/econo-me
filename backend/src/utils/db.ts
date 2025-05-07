import { Pool, PoolClient } from 'pg';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

class DatabaseManager {
  private pool: Pool;

  constructor() {

    const dbName = process.env.NODE_ENV === 'test' ? 'econo_me_test' : 'econo_me';


    // PostgreSQL Connection Pool
    const isProd = process.env.NODE_ENV === 'production';
    const connectionString = isProd ? process.env.PROD_DATABASE_URL : process.env.DEV_DATABASE_URL;
    
    this.pool = new Pool({
      connectionString,
      ssl: isProd ? { rejectUnauthorized: false } : false
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