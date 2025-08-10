import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

// Import routes
import authRoutes from './routes/auth.js';
import projectRoutes from './routes/projects.js';

// Import database
import { createTables } from './database/migrate.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdn.jsdelivr.net"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.tailwindcss.com", "https://cdn.jsdelivr.net"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Per daug užklausų iš šio IP adreso, bandykite vėliau.'
});
app.use(limiter);

// Auth rate limiting (stricter)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 auth requests per windowMs
  message: 'Per daug autentifikacijos bandymų, bandykite vėliau.'
});

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/projects', projectRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint nerastas' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error:', err);
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: 'Validacijos klaida', details: err.message });
  }
  
  if (err.code === '23505') { // PostgreSQL unique constraint error
    return res.status(409).json({ error: 'Duomenys jau egzistuoja' });
  }
  
  res.status(500).json({ error: 'Serverio klaida' });
});

// Initialize database and start server
const startServer = async () => {
  try {
    console.log('🔧 Inicializuojama duomenų bazė...');
    await createTables();
    
    app.listen(PORT, () => {
      console.log(`🚀 Serveris paleistas: http://localhost:${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      console.log(`🔐 Auth API: http://localhost:${PORT}/api/auth`);
      console.log(`📁 Projects API: http://localhost:${PORT}/api/projects`);
    });
  } catch (error) {
    console.error('❌ Serverio paleidimo klaida:', error);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM gautas, uždaromas serveris...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT gautas, uždaromas serveris...');
  process.exit(0);
});

startServer();