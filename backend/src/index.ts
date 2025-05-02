import app from './app';
import { databaseManager } from './utils/db';

// Import model initialization functions
import './models/expense';
import './models/budget';
import './models/income';
import './models/savingsGoal';

const PORT = process.env.PORT || 5003;

console.log('Starting Econo-me API server...');

// Function to start the server
const startServer = async () => {
  try {
    // Test database connection
    await databaseManager.testConnection();
    console.log(' Database connection successful');
    
    // Start the server
    const server = app.listen(PORT, () => {
      console.log(` Server is running on port ${PORT}`);
      console.log(` API available at http://localhost:${PORT}`);
      console.log(` Health check: http://localhost:${PORT}/health`);
    });
    
    // Handle server errors
    server.on('error', (error: any) => {
      if (error.code === 'EADDRINUSE') {
        console.error(` Port ${PORT} is already in use. Try another port.`);
      } else {
        console.error(' Server error:', error);
      }
      process.exit(1);
    });
  } catch (error) {
    console.error(' Failed to start server:', error);
    console.error('Please check your database connection settings in .env file');
    process.exit(1);
  }
};

// Start the server
startServer();

// Handle global errors
process.on('unhandledRejection', (reason, promise) => {
  console.error(' Unhandled Promise rejection:', reason);
});

process.on('uncaughtException', (error) => {
  console.error(' Uncaught Exception:', error);
  // Don't exit immediately to allow logging
  setTimeout(() => process.exit(1), 1000);
});