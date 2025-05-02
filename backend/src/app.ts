import express from 'express';
import dotenv from 'dotenv';
import economeRoutes from './routes/routes';
import authRoutes from './routes/authRoutes';
import corsMiddleware from './middleware/corsMiddleware';

// Load environment variables
dotenv.config();

const app = express();

// Apply CORS before everything else
app.use(corsMiddleware);
// Handle OPTIONS requests explicitly
app.options('*', corsMiddleware);

// Apply JSON parser
app.use(express.json());

// Apply routes
app.use('/api', economeRoutes);
app.use('/api/auth', authRoutes);

// Root route
app.get('/', (req, res) => {
    res.send('Welcome to the Econo-me API');
});

// Health check route
app.get('/health', (req, res) => {
    res.status(200).send('Server is healthy');
});

// Test route
app.get('/api/test', (req, res) => {
    res.json({ message: 'Backend is running!' });
});

export default app;