import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { databaseManager } from '../utils/db';
import { QueryResult } from 'pg';
import { User, AuthenticatedRequest } from '../types';

interface JwtPayload extends Pick<User, 'id' | 'email' | 'username' | 'created_at'> {
  iat?: number;
  exp?: number;
}

const authMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const pool = databaseManager.getPool();
  
  // Get token from header
  const token = req.header('Authorization')?.replace('Bearer ', '');

  // Check if no token
  if (!token) {
    res.status(401).json({ message: 'No token, authorization denied' });
    return;
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-default-secret-key') as JwtPayload;
    
    // Check if user exists in database
    const result: QueryResult<User> = await pool.query(
      'SELECT id, username, email, created_at FROM users WHERE id = $1',
      [decoded.id]
    );
    
    if (result.rows.length === 0) {
      res.status(401).json({ message: 'Token is not valid' });
      return;
    }
    
    // Add user from payload to request object
    (req as AuthenticatedRequest).user = decoded;
    next();
  } catch (err) {
    console.error('Token verification error:', err instanceof Error ? err.message : 'Unknown error');
    res.status(401).json({ message: 'Token is not valid' });
  }
};

export default authMiddleware;