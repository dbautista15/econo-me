const { Pool } = require ('pg');
require ('dotenv').config();

const pool = new Pool({
	connectionString: process.env.DATABASE_URL
});

//Here we are testing the connection
pool.connect((err, client, release) => {
	if (err){
		return console.error('Error connecting to the database', err.stack);
	}
	console.log('Connecteed to database successfully');
});

module,exports = pool;