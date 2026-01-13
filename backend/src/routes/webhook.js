/**
 * WhatsApp Webhook Routes
 * Handles incoming messages from WhatsApp Cloud API (Meta)
 */

const express = require('express');
const router = express.Router();
const config = require('../config');
const logger = require('../utils/logger');
const inventoryController = require('../controllers/inventoryController');
const whatsappService = require('../services/whatsappService');
const sheetsService = require('../services/sheetsService');

// Initialize spreadsheet on first load
let spreadsheetInitialized = false;
async function ensureSpreadsheetInitialized() {
  if (!spreadsheetInitialized) {
    try {
      logger.info('Starting spreadsheet initialization...');
      await sheetsService.initializeSpreadsheet();
      spreadsheetInitialized = true;
      logger.info('Spreadsheet initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize spreadsheet', { 
        error: error.message,
        stack: error.stack 
      });
      throw error;
    }
  } else {
    logger.info('Spreadsheet already initialized, skipping');
  }
}

/**
 * GET /webhook/whatsapp
 * Webhook verification endpoint (required by Meta)
 */
router.get('/whatsapp', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  logger.info('Webhook verification request', { mode, token: token ? '***' : 'missing' });

  if (mode === 'subscribe' && token === config.whatsapp.verifyToken) {
    logger.info('Webhook verified successfully');
    return res.status(200).send(challenge);
  }

  logger.warn('Webhook verification failed');
  return res.sendStatus(403);
});

/**
 * POST /webhook/whatsapp
 * Main webhook endpoint for incoming WhatsApp messages
 */
router.post('/whatsapp', async (req, res) => {
  try {
    // Always respond 200 quickly to acknowledge receipt
    res.sendStatus(200);

    logger.info('Webhook received', { body: JSON.stringify(req.body) });

    // Ensure spreadsheet is initialized
    try {
      await ensureSpreadsheetInitialized();
      logger.info('Spreadsheet initialization check complete');
    } catch (initError) {
      logger.error('FATAL: Spreadsheet initialization failed', { 
        error: initError.message,
        stack: initError.stack 
      });
      return;
    }

    // Extract message data from webhook payload
    const messageData = whatsappService.extractMessageData(req.body);

    if (!messageData) {
      // Not a message event (could be status update, etc.)
      logger.debug('Non-message webhook event received');
      return;
    }

    logger.info('Incoming WhatsApp message', {
      from: messageData.from,
      type: messageData.type,
      messageId: messageData.messageId,
      text: messageData.text,
    });

    // Check if it's a voice note
    const isVoiceNote = messageData.type === 'audio' && messageData.audio?.voice;

    // Process the message
    try {
      const result = await inventoryController.processMessage({
        from: messageData.from,
        messageId: messageData.messageId,
        body: messageData.text,
        isVoiceNote,
        audioId: messageData.audio?.id,
        audioMimeType: messageData.audio?.mimeType,
        contactName: messageData.contactName,
      });

      logger.info('Message processed successfully', { 
        success: result.success,
        message: result.message 
      });

      // Send response back via WhatsApp Cloud API
      await whatsappService.sendReply(
        messageData.from,
        result.message,
        messageData.messageId
      );
    } catch (processError) {
      logger.error('FATAL: Message processing failed', { 
        error: processError.message,
        stack: processError.stack 
      });
      throw processError;
    }
  } catch (error) {
    logger.error('Error processing WhatsApp message', { 
      error: error.message,
      stack: error.stack 
    });
    
    // Try to send error response to user
    try {
      const messageData = whatsappService.extractMessageData(req.body);
      if (messageData) {
        await whatsappService.sendMessage(
          messageData.from,
          '❌ Sorry, I encountered an error processing your message. Please try again.'
        );
      }
    } catch (sendError) {
      logger.error('Failed to send error response', { error: sendError.message });
    }
  }
});

/**
 * POST /webhook/whatsapp/status
 * Status callback endpoint for message delivery status (optional)
 */
router.post('/whatsapp/status', (req, res) => {
  const statuses = req.body.entry?.[0]?.changes?.[0]?.value?.statuses;
  
  if (statuses) {
    statuses.forEach(status => {
      logger.debug('Message status update', {
        messageId: status.id,
        status: status.status,
        recipientId: status.recipient_id,
      });
    });
  }

  res.sendStatus(200);
});

module.exports = router;
