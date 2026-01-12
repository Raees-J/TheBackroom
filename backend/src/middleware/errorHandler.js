/**
 * Global Error Handler Middleware
 * Catches and formats all errors consistently
 */

const logger = require('../utils/logger');
const config = require('../config');

/**
 * Custom application error class
 */
class AppError extends Error {
  constructor(message, statusCode = 500, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.timestamp = new Date().toISOString();
    
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Error handler middleware
 */
function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  
  // Log the error
  logger.error('Error occurred', {
    message: err.message,
    statusCode,
    stack: err.stack,
    path: req.path,
    method: req.method,
    body: req.body,
  });
  
  // Send response
  res.status(statusCode).json({
    error: {
      message,
      statusCode,
      timestamp: err.timestamp || new Date().toISOString(),
      ...(config.isDevelopment && { stack: err.stack }),
    },
  });
}

module.exports = errorHandler;
module.exports.AppError = AppError;
