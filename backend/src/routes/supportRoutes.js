/**
 * Support Routes
 * Handles AI-powered support chat with security hardening
 * 
 * SECURITY FEATURES:
 * - Rate limiting (10 messages per minute per user)
 * - Message validation and sanitization
 * - Field whitelisting
 * - Content length limits
 */

const express = require('express');
const router = express.Router();
const supportService = require('../services/supportService');
const logger = require('../utils/logger');
const { supportChatLimiter } = require('../middleware/rateLimiter');
const {
  validateMessageMiddleware,
  allowOnlyFields,
} = require('../middleware/validation');

/**
 * POST /api/support/chat
 * Send a message to the support AI
 * 
 * SECURITY:
 * - Rate limited: 10 messages per minute per user/IP
 * - Message validation and sanitization
 * - Only accepts 'message' field
 * - Max message length: 500 characters
 */
router.post(
  '/chat',
  supportChatLimiter, // Rate limit: 10 per minute
  allowOnlyFields(['message']), // Reject unexpected fields
  validateMessageMiddleware, // Validate and sanitize message
  async (req, res) => {
    try {
      const { message } = req.body;

      logger.info('Support chat message received', {
        messageLength: message.length,
        ip: req.ip,
      });

      const result = await supportService.getChatResponse(message);

      logger.info('Support chat response sent', {
        responseLength: result.response.length,
        isRelevant: result.isRelevant,
        ip: req.ip,
      });

      res.json({
        success: true,
        response: result.response,
        isRelevant: result.isRelevant,
      });
    } catch (error) {
      logger.error('Support chat failed', {
        error: error.message,
        ip: req.ip,
      });

      res.status(500).json({
        error: 'Failed to process your message',
        message: 'Please try again later or contact us via WhatsApp at +27839300255',
      });
    }
  }
);

module.exports = router;
