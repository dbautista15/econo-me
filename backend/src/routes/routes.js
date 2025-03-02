const express = require('express');
const router = express.Router();
const economeController = require('../controllers/controller');

router.post('/expenses',economeController.addExpense);
// here we would define other

module.exports = router;