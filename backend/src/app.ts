import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import economeRoutes from './routes/routes';
import authRoutes from './routes/authRoutes';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', economeRoutes);
app.use('/api/auth', authRoutes);

// Root route
app.get('/', (req: Request, res: Response) => {
    res.send('Welcome to the Econo-me API');
});

// Test route
app.get('/api/test', (req: Request, res: Response) => {
    res.json({ message: 'Backend is running!' });
});

export default app;