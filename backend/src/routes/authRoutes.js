/**
 * Auth Routes
 * Handles authentication endpoints with security hardening
 * 
 * SECURITY FEATURES:
 * - Rate limiting (5 requests per 15 min for auth, 3 OTP per hour)
 * - Input validation and sanitization
 * - Field whitelisting (reject unexpected fields)
 * - Detailed error logging
 */

const express = require('express');
const router = express.Router();
const smsService = require('../services/smsService');
const authService = require('../services/authService');
const logger = require('../utils/logger');
const { authLimiter, otpSendLimiter } = require('../middleware/rateLimiter');
const {
  validatePhoneNumberMiddleware,
  validateOTPMiddleware,
  allowOnlyFields,
} = require('../middleware/validation');

/**
 * POST /api/auth/send-otp
 * Send OTP code to phone number
 * 
 * SECURITY:
 * - Rate limited: 3 requests per hour per IP+phone
 * - Phone number validation and sanitization
 * - Only accepts 'phoneNumber' field
 */
router.post(
  '/send-otp',
  otpSendLimiter, // Rate limit: 3 per hour
  allowOnlyFields(['phoneNumber']), // Reject unexpected fields
  validatePhoneNumberMiddleware, // Validate and sanitize phone number
  async (req, res) => {
    try {
      const { phoneNumber } = req.body;

      await smsService.sendOTP(phoneNumber);

      logger.info('OTP sent successfully', {
        phoneNumber,
        ip: req.ip,
      });

      res.json({
        success: true,
        message: 'Verification code sent',
      });
    } catch (error) {
      logger.error('Send OTP failed', {
        error: error.message,
        phoneNumber: req.body.phoneNumber,
        ip: req.ip,
      });

      res.status(500).json({
        error: 'Failed to send verification code',
        message: 'Please try again later',
      });
    }
  }
);

/**
 * POST /api/auth/verify-otp
 * Verify OTP code and return auth token
 * 
 * SECURITY:
 * - Rate limited: 5 requests per 15 minutes per IP
 * - Phone number and OTP validation
 * - Only accepts 'phoneNumber' and 'code' fields
 * - Prevents brute force attacks
 */
router.post(
  '/verify-otp',
  authLimiter, // Rate limit: 5 per 15 minutes
  allowOnlyFields(['phoneNumber', 'code']), // Reject unexpected fields
  validatePhoneNumberMiddleware, // Validate phone number
  validateOTPMiddleware, // Validate OTP code
  async (req, res) => {
    try {
      const { phoneNumber, code } = req.body;

      const verification = smsService.verifyOTP(phoneNumber, code);

      if (!verification.valid) {
        logger.warn('OTP verification failed', {
          phoneNumber,
          error: verification.error,
          ip: req.ip,
        });

        return res.status(401).json({
          error: 'Verification failed',
          message: verification.error,
        });
      }

      // Generate auth token
      const token = authService.generateToken(phoneNumber);

      logger.info('User authenticated successfully', {
        phoneNumber,
        ip: req.ip,
      });

      res.json({
        success: true,
        token,
        phoneNumber,
        expiresIn: '30d',
      });
    } catch (error) {
      logger.error('Verify OTP failed', {
        error: error.message,
        phoneNumber: req.body.phoneNumber,
        ip: req.ip,
      });

      res.status(500).json({
        error: 'Verification failed',
        message: 'Please try again later',
      });
    }
  }
);

/**
 * POST /api/auth/dev-login
 * DEV ONLY: Login without OTP for development/design work
 * 
 * SECURITY: Only works in development mode
 * Remove this endpoint before production!
 */
router.post(
  '/dev-login',
  allowOnlyFields(['phoneNumber']),
  validatePhoneNumberMiddleware,
  async (req, res) => {
    // Only allow in development
    if (process.env.NODE_ENV === 'production') {
      return res.status(404).json({ error: 'Not found' });
    }

    try {
      const { phoneNumber } = req.body;

      // Generate auth token directly (skip OTP)
      const token = authService.generateToken(phoneNumber);

      logger.info('Dev login successful', {
        phoneNumber,
        ip: req.ip,
      });

      res.json({
        success: true,
        token,
        phoneNumber,
        expiresIn: '30d',
        message: 'DEV MODE: Logged in without OTP',
      });
    } catch (error) {
      logger.error('Dev login failed', {
        error: error.message,
        phoneNumber: req.body.phoneNumber,
        ip: req.ip,
      });

      res.status(500).json({
        error: 'Login failed',
        message: 'Please try again later',
      });
    }
  }
);

module.exports = router;
