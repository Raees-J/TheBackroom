/**
 * Rate Limiter Middleware
 * Protects against abuse and API rate limits
 */

const logger = require('./logger');

// Simple in-memory rate limiter
const requestCounts = new Map();

/**
 * Clean up old entries periodically
 */
setInterval(() => {
  const now = Date.now();
  for (const [key, data] of requestCounts.entries()) {
    if (now - data.windowStart > 60000) {
      requestCounts.delete(key);
    }
  }
}, 60000);

/**
 * Create rate limiter middleware
 * @param {object} options - Rate limiter options
 * @returns {Function} - Express middleware
 */
function createRateLimiter(options = {}) {
  const {
    windowMs = 60000,      // 1 minute window
    maxRequests = 30,       // Max requests per window
    keyGenerator = (req) => req.body?.From || req.ip,
  } = options;

  return (req, res, next) => {
    const key = keyGenerator(req);
    const now = Date.now();

    let data = requestCounts.get(key);

    if (!data || now - data.windowStart > windowMs) {
      data = { count: 0, windowStart: now };
    }

    data.count++;
    requestCounts.set(key, data);

    if (data.count > maxRequests) {
      logger.warn('Rate limit exceeded', { key, count: data.count });
      
      return res.status(429).json({
        error: 'Too many requests',
        message: 'Please slow down and try again in a minute.',
        retryAfter: Math.ceil((data.windowStart + windowMs - now) / 1000),
      });
    }

    next();
  };
}

module.exports = { createRateLimiter };
