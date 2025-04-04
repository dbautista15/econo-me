const express = require('express');
const router = express.Router();
const economeController = require('../controllers/controller');

router.get('/db-check', async (req, res) => {
	try {
	  const client = await pool.connect();
	  const tablesQuery = await client.query(`
		SELECT table_name 
		FROM information_schema.tables 
		WHERE table_schema = 'public'
	  `);
	  
	  const tables = tablesQuery.rows.map(row => row.table_name);
	  client.release();
	  
	  res.status(200).json({
		status: 'Database connection successful',
		tables: tables
	  });
	} catch (err) {
	  res.status(500).json({
		status: 'Database connection failed',
		error: err.message
	  });
	}
  });
// Expense routes
router.post('/expenses', economeController.addExpense);
router.get('/expenses', economeController.getExpenses);
router.put('/expenses/:id', economeController.updateExpense);
router.delete('/expenses/:id', economeController.deleteExpense);

// Budget routes
router.post('/budgets', economeController.createBudget);
router.get('/budgets', economeController.getBudgets);
router.put('/budgets/:id', economeController.updateBudget);
router.delete('/budgets/:id', economeController.deleteBudget);

module.exports = router;