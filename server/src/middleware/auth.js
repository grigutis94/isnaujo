import jwt from 'jsonwebtoken';
import { getDB } from '../database/db.js';

export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const db = await getDB();
    
    // Check if session exists in database
    const session = await db.get(
      'SELECT * FROM user_sessions WHERE user_id = ? AND expires_at > datetime("now")',
      [decoded.userId]
    );

    if (!session) {
      return res.status(401).json({ error: 'Invalid or expired session' });
    }

    // Get user data
    const user = await db.get(
      'SELECT id, name, email, role FROM users WHERE id = ?',
      [decoded.userId]
    );

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(403).json({ error: 'Invalid token' });
  }
};

export const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

export const createSession = async (userId, token) => {
  const db = await getDB();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

  await db.run(
    'INSERT INTO user_sessions (user_id, token_hash, expires_at) VALUES (?, ?, ?)',
    [userId, token, expiresAt.toISOString()]
  );
};

export const deleteSession = async (userId) => {
  const db = await getDB();
  await db.run(
    'DELETE FROM user_sessions WHERE user_id = ?',
    [userId]
  );
};