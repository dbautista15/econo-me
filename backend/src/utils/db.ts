import { Pool, PoolClient } from 'pg';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

class DatabaseManager {
  private pool: Pool;

  constructor() {
    // Debug log to verify environment variables are loaded
    console.log('NODE_ENV:', process.env.NODE_ENV);
    
    // Force production mode if running on Render
    const isProd = process.env.NODE_ENV === 'production' || Boolean(process.env.RENDER);
    console.log('Running in production mode:', isProd);
    
    // Get the appropriate connection string
    const connectionString = isProd ? process.env.PROD_DATABASE_URL : process.env.DEV_DATABASE_URL;
    
    // Debug log the first few characters of the connection string to verify it's present (don't log the full string for security)
    if (connectionString) {
      console.log('Database connection string available. First 15 chars:', connectionString.substring(0, 15) + '...');
    } else {
      console.error('ERROR: Database connection string is undefined!');
      if (isProd) {
        console.error('PROD_DATABASE_URL environment variable is missing or empty');
      } else {
        console.error('DEV_DATABASE_URL environment variable is missing or empty');
      }
    }

    try {
      // PostgreSQL Connection Pool
      this.pool = new Pool({
        connectionString,
        ssl: isProd ? { rejectUnauthorized: false } : false
      });

      // Error handler for unexpected pool errors
      this.pool.on('error', (err) => {
        console.error('Unexpected error on PostgreSQL connection:', err);
        // Don't exit in production, just log the error
        if (!isProd) {
          process.exit(-1);
        }
      });
      
      console.log('PostgreSQL pool initialized successfully');
    } catch (err) {
      console.error('Failed to initialize PostgreSQL pool:', err);
      throw err;
    }
  }

  /**
   * Test Database Connection
   * Tests PostgreSQL raw connection
   */
  async testConnection(): Promise<boolean> {
    try {
      console.log('Testing PostgreSQL connection...');
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