import { body, validationResult } from 'express-validator';
import { User } from '../models/User.js';
import { generateToken, createSession, deleteSession } from '../middleware/auth.js';

export const registerValidation = [
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Vardas turi būti 2-100 simbolių'),
  body('email').isEmail().normalizeEmail().withMessage('Neteisingas el. pašto formatas'),
  body('password').isLength({ min: 6 }).withMessage('Slaptažodis turi būti mažiausiai 6 simbolių')
];

export const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Neteisingas el. pašto formatas'),
  body('password').notEmpty().withMessage('Slaptažodis privalomas')
];

export const register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validacijos klaida', 
        details: errors.array() 
      });
    }

    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({ error: 'Vartotojas su tokiu el. paštu jau egzistuoja' });
    }

    // Create new user
    const user = await User.create({ name, email, password });
    
    // Generate JWT token
    const token = generateToken(user.id);
    
    // Create session
    await createSession(user.id, token);

    res.status(201).json({
      message: 'Registracija sėkminga',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Serverio klaida' });
  }
};

export const login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validacijos klaida', 
        details: errors.array() 
      });
    }

    const { email, password } = req.body;

    // Find user by email
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Neteisingas el. paštas arba slaptažodis' });
    }

    // Verify password
    const isValidPassword = await User.verifyPassword(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Neteisingas el. paštas arba slaptažodis' });
    }

    // Update last login
    await User.updateLastLogin(user.id);

    // Generate JWT token
    const token = generateToken(user.id);
    
    // Delete old sessions and create new one
    await deleteSession(user.id);
    await createSession(user.id, token);

    res.json({
      message: 'Prisijungimas sėkmingas',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Serverio klaida' });
  }
};

export const logout = async (req, res) => {
  try {
    await deleteSession(req.user.id);
    res.json({ message: 'Atsijungimas sėkmingas' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Serverio klaida' });
  }
};

export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'Vartotojas nerastas' });
    }

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ error: 'Serverio klaida' });
  }
};