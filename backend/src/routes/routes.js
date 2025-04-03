const express = require('express');
const router = express.Router();
const economeController = require('../controllers/controller');

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