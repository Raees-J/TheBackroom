/**
 * Rate Limiting Middleware
 * Implements IP-based and user-based rate limiting following OWASP best practices
 * 
 * OWASP References:
 * - OWASP API Security Top 10 - API4:2023 Unrestricted Resource Consumption
 * - OWASP Cheat Sheet: Denial of Service Prevention
 */

const rateLimit = require('express-rate-limit');
const logger = require('../utils/logger');

/**
 * Create a custom rate limit handler with graceful 429 responses
 */
const createRateLimitHandler = (message) => (req, res) => {
  logger.warn('Rate limit exceeded', {
    ip: req.ip,
    path: req.path,
    user: req.user?.phoneNumber || 'anonymous',
  });

  res.status(429).json({
    error: 'Too Many Requests',
    message,
    retryAfter: res.getHeader('Retry-After'),
  });
};

/**
 * General API rate limiter
 * Limits: 100 requests per 15 minutes per IP
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: createRateLimitHandler(
    'Too many requests from this IP, please try again after 15 minutes'
  ),
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.path === '/health' || req.path === '/health/ready';
  },
});

/**
 * Strict rate limiter for authentication endpoints
 * Limits: 5 requests per 15 minutes per IP
 * Prevents brute force attacks on OTP verification
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false, // Count all requests, even successful ones
  handler: createRateLimitHandler(
    'Too many authentication attempts, please try again after 15 minutes'
  ),
});

/**
 * OTP send rate limiter
 * Limits: 3 OTP requests per hour per IP
 * Prevents SMS bombing and abuse
 */
const otpSendLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Limit each IP to 3 OTP requests per hour
  standardHeaders: true,
  legacyHeaders: false,
  handler: createRateLimitHandler(
    'Too many OTP requests, please try again after 1 hour'
  ),
  // Rate limit by IP (default behavior handles IPv6 correctly)
});

/**
 * Webhook rate limiter
 * Limits: 60 requests per minute per IP
 * Protects WhatsApp webhook endpoint from abuse
 */
const webhookLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60, // Limit each IP to 60 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  handler: createRateLimitHandler(
    'Webhook rate limit exceeded, please slow down'
  ),
});

/**
 * Support chat rate limiter
 * Limits: 10 messages per minute per user
 * Prevents spam in support chat
 */
const supportChatLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // Limit each user to 10 messages per minute
  standardHeaders: true,
  legacyHeaders: false,
  handler: createRateLimitHandler(
    'Too many messages, please slow down'
  ),
  // Rate limit by IP (default behavior handles IPv6 correctly)
});

/**
 * Dashboard API rate limiter
 * Limits: 30 requests per minute per user
 * Protects authenticated API endpoints
 */
const dashboardLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // Limit each user to 30 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  handler: createRateLimitHandler(
    'Too many API requests, please slow down'
  ),
  // Rate limit by authenticated user (no custom keyGenerator needed)
  skip: (req) => false, // Apply to all requests
});

module.exports = {
  apiLimiter,
  authLimiter,
  otpSendLimiter,
  webhookLimiter,
  supportChatLimiter,
  dashboardLimiter,
};
