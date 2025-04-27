import app from '../src/app';
import { databaseManager } from './utils/db';

// Import model initialization functions
import './models/expense';
import './models/budget';
import './models/income';
import './models/savingsGoal';

// Test database connection
databaseManager.testConnection().catch(err => {
    console.error('Failed to connect to the database:', err);
});

const PORT = process.env.PORT || 5003;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});