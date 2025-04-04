const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const authMiddleware = require('../middleware/authMiddleware');
const express = require('express');
const cors = require('cors');
const app = express();

// Add this before your routes
app.use(cors({
  origin: 'http://localhost:3000', // Your frontend URL
  credentials: true
}));
// Settings routes (protected)
router.get('/', authMiddleware, settingsController.getUserSettings);
router.put('/', authMiddleware, settingsController.updateUserSettings);

module.exports = router;