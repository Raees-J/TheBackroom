/**
 * Input Validation and Sanitization Middleware
 * Implements strict schema-based validation following OWASP best practices
 * 
 * OWASP References:
 * - OWASP API Security Top 10 - API3:2023 Broken Object Property Level Authorization
 * - OWASP API Security Top 10 - API8:2023 Security Misconfiguration
 * - OWASP Input Validation Cheat Sheet
 */

const logger = require('../utils/logger');

/**
 * Sanitize string input
 * Removes potentially dangerous characters and limits length
 */
function sanitizeString(str, maxLength = 1000) {
  if (typeof str !== 'string') return '';
  
  // Remove null bytes and control characters
  let sanitized = str.replace(/\0/g, '').replace(/[\x00-\x1F\x7F]/g, '');
  
  // Trim whitespace
  sanitized = sanitized.trim();
  
  // Limit length
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }
  
  return sanitized;
}

/**
 * Validate and sanitize phone number
 * Accepts South African format: +27XXXXXXXXX
 */
function validatePhoneNumber(phoneNumber) {
  if (!phoneNumber || typeof phoneNumber !== 'string') {
    return { valid: false, error: 'Phone number is required' };
  }

  const sanitized = sanitizeString(phoneNumber, 20);
  
  // South African phone number format: +27 followed by 9 digits
  const phoneRegex = /^\+27[0-9]{9}$/;
  
  if (!phoneRegex.test(sanitized)) {
    return {
      valid: false,
      error: 'Invalid phone number format. Use +27XXXXXXXXX (e.g., +27821234567)',
    };
  }

  return { valid: true, value: sanitized };
}

/**
 * Validate OTP code
 * Must be exactly 6 digits
 */
function validateOTP(code) {
  if (!code) {
    return { valid: false, error: 'Verification code is required' };
  }

  const sanitized = sanitizeString(String(code), 10);
  
  // Must be exactly 6 digits
  const otpRegex = /^[0-9]{6}$/;
  
  if (!otpRegex.test(sanitized)) {
    return {
      valid: false,
      error: 'Invalid verification code. Must be 6 digits',
    };
  }

  return { valid: true, value: sanitized };
}

/**
 * Validate JWT token format
 */
function validateToken(token) {
  if (!token || typeof token !== 'string') {
    return { valid: false, error: 'Token is required' };
  }

  const sanitized = sanitizeString(token, 500);
  
  // JWT format: header.payload.signature
  const jwtRegex = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/;
  
  if (!jwtRegex.test(sanitized)) {
    return { valid: false, error: 'Invalid token format' };
  }

  return { valid: true, value: sanitized };
}

/**
 * Validate message text
 * Limits length and removes dangerous content
 */
function validateMessage(message) {
  if (!message || typeof message !== 'string') {
    return { valid: false, error: 'Message is required' };
  }

  const sanitized = sanitizeString(message, 500);
  
  if (sanitized.length === 0) {
    return { valid: false, error: 'Message cannot be empty' };
  }

  if (sanitized.length > 500) {
    return { valid: false, error: 'Message too long (max 500 characters)' };
  }

  return { valid: true, value: sanitized };
}

/**
 * Validate pagination parameters
 */
function validatePagination(page, limit) {
  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);

  if (isNaN(pageNum) || pageNum < 1) {
    return { valid: false, error: 'Invalid page number' };
  }

  if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
    return { valid: false, error: 'Invalid limit (must be between 1 and 100)' };
  }

  return { valid: true, page: pageNum, limit: limitNum };
}

/**
 * Middleware: Validate phone number in request body
 */
const validatePhoneNumberMiddleware = (req, res, next) => {
  const { phoneNumber } = req.body;
  const validation = validatePhoneNumber(phoneNumber);

  if (!validation.valid) {
    logger.warn('Phone number validation failed', {
      ip: req.ip,
      error: validation.error,
    });
    return res.status(400).json({ error: validation.error });
  }

  // Replace with sanitized value
  req.body.phoneNumber = validation.value;
  next();
};

/**
 * Middleware: Validate OTP in request body
 */
const validateOTPMiddleware = (req, res, next) => {
  const { code } = req.body;
  const validation = validateOTP(code);

  if (!validation.valid) {
    logger.warn('OTP validation failed', {
      ip: req.ip,
      error: validation.error,
    });
    return res.status(400).json({ error: validation.error });
  }

  // Replace with sanitized value
  req.body.code = validation.value;
  next();
};

/**
 * Middleware: Validate message in request body
 */
const validateMessageMiddleware = (req, res, next) => {
  const { message } = req.body;
  const validation = validateMessage(message);

  if (!validation.valid) {
    logger.warn('Message validation failed', {
      ip: req.ip,
      error: validation.error,
    });
    return res.status(400).json({ error: validation.error });
  }

  // Replace with sanitized value
  req.body.message = validation.value;
  next();
};

/**
 * Middleware: Reject unexpected fields in request body
 * Prevents mass assignment vulnerabilities
 */
const allowOnlyFields = (allowedFields) => (req, res, next) => {
  const receivedFields = Object.keys(req.body);
  const unexpectedFields = receivedFields.filter(
    field => !allowedFields.includes(field)
  );

  if (unexpectedFields.length > 0) {
    logger.warn('Unexpected fields in request', {
      ip: req.ip,
      path: req.path,
      unexpectedFields,
    });
    return res.status(400).json({
      error: 'Invalid request',
      message: `Unexpected fields: ${unexpectedFields.join(', ')}`,
    });
  }

  next();
};

/**
 * Middleware: Validate query parameters
 */
const validateQueryParams = (allowedParams) => (req, res, next) => {
  const receivedParams = Object.keys(req.query);
  const unexpectedParams = receivedParams.filter(
    param => !allowedParams.includes(param)
  );

  if (unexpectedParams.length > 0) {
    logger.warn('Unexpected query parameters', {
      ip: req.ip,
      path: req.path,
      unexpectedParams,
    });
    return res.status(400).json({
      error: 'Invalid request',
      message: `Unexpected query parameters: ${unexpectedParams.join(', ')}`,
    });
  }

  next();
};

module.exports = {
  // Validation functions
  sanitizeString,
  validatePhoneNumber,
  validateOTP,
  validateToken,
  validateMessage,
  validatePagination,
  
  // Middleware
  validatePhoneNumberMiddleware,
  validateOTPMiddleware,
  validateMessageMiddleware,
  allowOnlyFields,
  validateQueryParams,
};
