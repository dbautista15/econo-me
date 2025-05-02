import cors from 'cors';
import { Request, Response, NextFunction } from 'express';

// CORS configuration with very permissive settings for development
const corsOptions = {
  origin: true, // Allow any origin in development
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Export the middleware
export default cors(corsOptions);