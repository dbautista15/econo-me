const { Sequelize } = require('sequelize');
require('dotenv').config();

// Create Sequelize instance
const sequelize = new Sequelize(
  process.env.DB_NAME, 
  process.env.DB_USER, 
  process.env.DB_PASSWORD, 
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,     // Maximum number of connection in pool
      min: 0,     // Minimum number of connection in pool
      acquire: 30000,  // Maximum time to acquire a connection
      idle: 10000      // Connection can be idle before being released
    },
    dialectOptions: {
      // Additional PostgreSQL specific options
      ssl: process.env.DB_SSL === 'true' ? { 
        require: true,
        rejectUnauthorized: false 
      } : false
    }
  }
);

// Import models
const User = require('./models/User')(sequelize);

// Define associations if needed
// Example: User.hasMany(Posts)

const syncDatabase = async () => {
	try {
	  // This will create tables if they don't exist
	  await sequelize.sync({ 
		// alter: true // Uncomment to alter existing tables 
		// force: true // Uncomment to drop and recreate tables (DANGEROUS!)
	  });
	  console.log('Database synchronized successfully');
	} catch (error) {
	  console.error('Unable to synchronize the database:', error);
	}
  };

module.exports = {
  sequelize,
  User,
  syncDatabase
};