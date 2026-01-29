/**
 * Auth Service
 * Handles user authentication and JWT tokens
 * 
 * SECURITY: Uses environment-based JWT secret
 * OWASP Reference: OWASP Authentication Cheat Sheet
 */

const jwt = require('jsonwebtoken');
const config = require('../config');
const logger = require('../utils/logger');

// SECURITY: JWT secret MUST be loaded from environment variables
// Never hardcode secrets in source code
const JWT_SECRET = config.jwt.secret || 'INSECURE_DEFAULT_SECRET_CHANGE_ME';
const JWT_EXPIRES_IN = config.jwt.expiresIn || '30d';

// Warn if using default secret
if (JWT_SECRET === 'INSECURE_DEFAULT_SECRET_CHANGE_ME') {
  logger.warn('⚠️  SECURITY WARNING: Using default JWT secret. Set JWT_SECRET environment variable!');
}

/**
 * Generate JWT token for authenticated user
 * @param {string} phoneNumber - User's phone number
 * @returns {string} JWT token
 */
function generateToken(phoneNumber) {
  try {
    const token = jwt.sign(
      {
        phoneNumber,
        type: 'auth',
        iat: Math.floor(Date.now() / 1000), // Issued at
      },
      JWT_SECRET,
      {
        expiresIn: JWT_EXPIRES_IN,
        issuer: 'the-backroom',
        audience: 'the-backroom-api',
      }
    );

    logger.info('Generated auth token', { phoneNumber });
    return token;
  } catch (error) {
    logger.error('Failed to generate token', { error: error.message });
    throw error;
  }
}

/**
 * Verify JWT token
 * @param {string} token - JWT token to verify
 * @returns {object} Verification result with user data
 */
function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: 'the-backroom',
      audience: 'the-backroom-api',
    });
    
    return {
      valid: true,
      phoneNumber: decoded.phoneNumber,
      issuedAt: decoded.iat,
      expiresAt: decoded.exp,
    };
  } catch (error) {
    logger.error('Token verification failed', { error: error.message });
    
    // Provide specific error messages
    if (error.name === 'TokenExpiredError') {
      return { valid: false, error: 'Token has expired' };
    } else if (error.name === 'JsonWebTokenError') {
      return { valid: false, error: 'Invalid token' };
    } else {
      return { valid: false, error: 'Token verification failed' };
    }
  }
}

/**
 * Extract token from Authorization header
 * @param {string} authHeader - Authorization header value
 * @returns {string|null} Extracted token or null
 */
function extractToken(authHeader) {
  if (!authHeader || typeof authHeader !== 'string') {
    return null;
  }
  
  if (!authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  return authHeader.substring(7).trim();
}

module.exports = {
  generateToken,
  verifyToken,
  extractToken,
};
