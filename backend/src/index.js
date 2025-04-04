const app = require('./app');
const { pool } = require('./utils/db');
const { sequelize, testConnection } = require('./utils/db');

// Correctly import the User model
const User = require('./models/user')(sequelize);

// Test database connection
testConnection().catch(err => {
    console.error('Failed to connect to the database:', err);
});

// Require models to ensure tables are created
require('./models/expense');
require('./models/budget');

// Sync models (optional)
sequelize.sync({ alter: true }) // Be careful with this in production
  .then(() => console.log('Database models synchronized'))
  .catch(err => console.error('Error synchronizing database models:', err));

const PORT = process.env.PORT || 5003;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});