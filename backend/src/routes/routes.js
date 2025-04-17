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
// Income routes
router.get('/incomes', economeController.getIncomes);
router.post('/incomes', economeController.addIncome);
// Savings goal routes
router.get('/savings-goals', economeController.getSavingsGoals);
router.post('/savings-goals', economeController.addSavingsGoal);

router.get('/categories', economeController.getCategories);
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

router.delete('/expenses/:id', economeController.deleteExpense);
router.post('/expenses/bulk-delete', economeController.bulkDeleteExpenses);



module.exports = router;