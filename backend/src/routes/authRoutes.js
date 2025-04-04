const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

const cors = require('cors');
const app = express();

// Add this before your routes
app.use(cors({
  origin: 'http://localhost:3000', // Your frontend URL
  credentials: true
}));
// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);

// Protected routes (require authentication)
router.get('/profile', authMiddleware, authController.getProfile);
router.put('/profile', authMiddleware, authController.updateProfile);
router.put('/change-password', authMiddleware, authController.changePassword);

// Profile management routes
router.get('/profile/details', authMiddleware, authController.getProfileDetails);
router.put('/profile/details', authMiddleware, authController.updateProfileDetails);

module.exports = router;