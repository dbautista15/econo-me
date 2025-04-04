const express = require('express');
const router = express.Router();
const recurringController = require('../controllers/recurringController');
const authMiddleware = require('../middleware/authMiddleware');
const express = require('express');
const cors = require('cors');
const app = express();

// Add this before your routes
app.use(cors({
  origin: 'http://localhost:3000', // Your frontend URL
  credentials: true
}));
// Apply auth middleware to all routes
router.use(authMiddleware);

// Recurring transaction routes
router.get('/', recurringController.getRecurringTransactions);
router.post('/', recurringController.createRecurringTransaction);
router.put('/:id', recurringController.updateRecurringTransaction);
router.delete('/:id', recurringController.deleteRecurringTransaction);
router.post('/process', recurringController.processDueTransactions);

module.exports = router;