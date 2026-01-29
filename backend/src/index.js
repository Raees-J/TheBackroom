/**
 * THE BACKROOM - Main Application Entry Point
 * AI-powered inventory management via WhatsApp
 * 🆓 FREE STACK: Gemini + WhatsApp Cloud API + Supabase
 * 
 * SECURITY HARDENING:
 * - Helmet security headers
 * - Rate limiting on all endpoints
 * - Input validation and sanitization
 * - JWT authentication
 * - CORS protection
 * - Request logging
 */

const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const config = require('./config');
const logger = require('./utils/logger');
const errorHandler = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimiter');
const webhookRoutes = require('./routes/webhook');
const healthRoutes = require('./routes/health');
const authRoutes = require('./routes/authRoutes');
const apiRoutes = require('./routes/apiRoutes');
const supportRoutes = require('./routes/supportRoutes');

const app = express();

// ===========================================
// SECURITY MIDDLEWARE
// ===========================================

/**
 * Helmet - Security headers
 * OWASP Reference: Security Misconfiguration Prevention
 */
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true,
  },
}));

/**
 * Request logging
 * Logs all requests for security auditing
 */
app.use(morgan('combined', {
  stream: { write: (message) => logger.info(message.trim()) }
}));

/**
 * Body parsing with size limits
 * Prevents DoS attacks via large payloads
 */
app.use(express.json({ limit: '10kb' })); // Limit JSON body to 10KB
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

/**
 * Trust proxy
 * Required for rate limiting behind reverse proxies (Render, Vercel, etc.)
 */
app.set('trust proxy', 1);

/**
 * Global rate limiter
 * Applies to all routes except health checks
 */
app.use(apiLimiter);

// ===========================================
// ROUTES
// ===========================================

// Health check endpoints (no rate limiting)
app.use('/health', healthRoutes);

// WhatsApp webhook endpoints
app.use('/webhook', webhookRoutes);

// Auth endpoints (strict rate limiting applied in routes)
app.use('/api/auth', authRoutes);

// API endpoints (authentication required, applied in routes)
app.use('/api', apiRoutes);

// Support chat endpoints (rate limiting applied in routes)
app.use('/api/support', supportRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'The Backroom',
    description: 'AI-powered inventory management via WhatsApp',
    version: '1.0.0',
    status: 'running',
    security: {
      rateLimit: 'enabled',
      authentication: 'JWT',
      encryption: 'TLS',
    },
    stack: {
      llm: 'Gemini 2.0 Flash-Lite (FREE)',
      messaging: 'WhatsApp Cloud API (FREE)',
      database: 'Supabase PostgreSQL (FREE)',
    },
  });
});

// 404 handler
app.use((req, res) => {
  logger.warn('404 Not Found', {
    method: req.method,
    path: req.path,
    ip: req.ip,
  });
  
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`,
  });
});

// Global error handler
app.use(errorHandler);

// ===========================================
// SERVER STARTUP
// ===========================================

const PORT = config.port;

app.listen(PORT, '0.0.0.0', async () => {
  logger.info(`🚀 The Backroom is running on port ${PORT}`);
  logger.info(`📱 WhatsApp webhook: http://localhost:${PORT}/webhook/whatsapp`);
  logger.info(`💚 Health check: http://localhost:${PORT}/health`);
  logger.info(`🌍 Environment: ${config.nodeEnv}`);
  logger.info(`🔒 Security: Rate limiting, JWT auth, input validation enabled`);
  logger.info(`🆓 FREE STACK: Gemini + WhatsApp Cloud + Supabase`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Export for testing
module.exports = app;
