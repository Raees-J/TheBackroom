/**
 * Authentication Middleware
 * Verifies JWT tokens and protects routes
 * 
 * OWASP References:
 * - OWASP API Security Top 10 - API2:2023 Broken Authentication
 * - OWASP Authentication Cheat Sheet
 */

const authService = require('../services/authService');
const { validateToken } = require('./validation');
const logger = require('../utils/logger');

/**
 * Middleware to verify JWT token
 * Protects routes that require authentication
 */
function requireAuth(req, res, next) {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      logger.warn('Missing authorization header', {
        ip: req.ip,
        path: req.path,
      });
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authorization header is required',
      });
    }

    const token = authService.extractToken(authHeader);
    
    if (!token) {
      logger.warn('Invalid authorization header format', {
        ip: req.ip,
        path: req.path,
      });
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid authorization header format. Use: Bearer <token>',
      });
    }

    // Validate token format
    const tokenValidation = validateToken(token);
    if (!tokenValidation.valid) {
      logger.warn('Invalid token format', {
        ip: req.ip,
        path: req.path,
      });
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid token format',
      });
    }

    // Verify token signature and expiration
    const verification = authService.verifyToken(token);
    
    if (!verification.valid) {
      logger.warn('Token verification failed', {
        ip: req.ip,
        path: req.path,
        error: verification.error,
      });
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid or expired token',
      });
    }

    // Attach user info to request
    req.user = {
      phoneNumber: verification.phoneNumber,
    };

    logger.debug('User authenticated', {
      phoneNumber: verification.phoneNumber,
      path: req.path,
    });

    next();
  } catch (error) {
    logger.error('Authentication error', {
      error: error.message,
      ip: req.ip,
      path: req.path,
    });
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Authentication failed',
    });
  }
}

/**
 * Optional authentication middleware
 * Attaches user info if token is present, but doesn't require it
 */
function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return next();
    }

    const token = authService.extractToken(authHeader);
    
    if (!token) {
      return next();
    }

    const verification = authService.verifyToken(token);
    
    if (verification.valid) {
      req.user = {
        phoneNumber: verification.phoneNumber,
      };
    }

    next();
  } catch (error) {
    // Don't fail on optional auth errors
    logger.debug('Optional auth failed', { error: error.message });
    next();
  }
}

module.exports = {
  requireAuth,
  optionalAuth,
};
