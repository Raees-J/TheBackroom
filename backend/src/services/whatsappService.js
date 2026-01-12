/**
 * WhatsApp Cloud API Service
 * Handles sending messages via Meta's WhatsApp Cloud API (FREE for service conversations)
 */

const axios = require('axios');
const config = require('../config');
const logger = require('../utils/logger');

// WhatsApp Cloud API base URL
const WHATSAPP_API_URL = `https://graph.facebook.com/${config.whatsapp.apiVersion}`;

/**
 * Send a WhatsApp text message
 * @param {string} to - Recipient phone number (without + or whatsapp: prefix)
 * @param {string} message - Message body
 * @returns {Promise<object>} - API response
 */
async function sendMessage(to, message) {
  if (!config.whatsapp.accessToken || !config.whatsapp.phoneNumberId) {
    logger.error('WhatsApp Cloud API not configured');
    throw new Error('WhatsApp not configured');
  }

  try {
    const response = await axios.post(
      `${WHATSAPP_API_URL}/${config.whatsapp.phoneNumberId}/messages`,
      {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: formatPhoneNumber(to),
        type: 'text',
        text: {
          preview_url: false,
          body: message,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${config.whatsapp.accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    logger.info('Message sent successfully', {
      messageId: response.data.messages?.[0]?.id,
      to,
    });

    return response.data;
  } catch (error) {
    logger.error('Failed to send WhatsApp message', {
      error: error.response?.data || error.message,
      to,
    });
    throw error;
  }
}

/**
 * Send a WhatsApp message reply (marks as read automatically)
 * @param {string} to - Recipient phone number
 * @param {string} message - Message body
 * @param {string} messageId - Original message ID to reply to
 * @returns {Promise<object>} - API response
 */
async function sendReply(to, message, messageId) {
  if (!config.whatsapp.accessToken || !config.whatsapp.phoneNumberId) {
    logger.error('WhatsApp Cloud API not configured');
    throw new Error('WhatsApp not configured');
  }

  try {
    // Mark the original message as read
    await markAsRead(messageId);

    // Send the reply
    const response = await axios.post(
      `${WHATSAPP_API_URL}/${config.whatsapp.phoneNumberId}/messages`,
      {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: formatPhoneNumber(to),
        type: 'text',
        text: {
          preview_url: false,
          body: message,
        },
        context: {
          message_id: messageId,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${config.whatsapp.accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    logger.info('Reply sent successfully', {
      messageId: response.data.messages?.[0]?.id,
      to,
    });

    return response.data;
  } catch (error) {
    logger.error('Failed to send WhatsApp reply', {
      error: error.response?.data || error.message,
      to,
    });
    throw error;
  }
}

/**
 * Mark a message as read
 * @param {string} messageId - Message ID to mark as read
 */
async function markAsRead(messageId) {
  try {
    await axios.post(
      `${WHATSAPP_API_URL}/${config.whatsapp.phoneNumberId}/messages`,
      {
        messaging_product: 'whatsapp',
        status: 'read',
        message_id: messageId,
      },
      {
        headers: {
          Authorization: `Bearer ${config.whatsapp.accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    // Non-critical, just log
    logger.debug('Failed to mark message as read', { messageId });
  }
}

/**
 * Download media file from WhatsApp
 * @param {string} mediaId - Media ID from webhook
 * @returns {Promise<Buffer>} - Media file buffer
 */
async function downloadMedia(mediaId) {
  try {
    // First, get the media URL
    const urlResponse = await axios.get(
      `${WHATSAPP_API_URL}/${mediaId}`,
      {
        headers: {
          Authorization: `Bearer ${config.whatsapp.accessToken}`,
        },
      }
    );

    const mediaUrl = urlResponse.data.url;

    // Download the actual file
    const fileResponse = await axios.get(mediaUrl, {
      headers: {
        Authorization: `Bearer ${config.whatsapp.accessToken}`,
      },
      responseType: 'arraybuffer',
    });

    logger.info('Media downloaded successfully', {
      mediaId,
      size: fileResponse.data.length,
    });

    return Buffer.from(fileResponse.data);
  } catch (error) {
    logger.error('Failed to download media', {
      error: error.response?.data || error.message,
      mediaId,
    });
    throw error;
  }
}

/**
 * Format phone number for WhatsApp API
 * @param {string} phoneNumber - Phone number in various formats
 * @returns {string} - Clean phone number
 */
function formatPhoneNumber(phoneNumber) {
  // Remove whatsapp:, +, spaces, dashes
  return phoneNumber
    .replace('whatsapp:', '')
    .replace(/[\s\-\+]/g, '')
    .replace(/^0/, ''); // Remove leading 0 for local numbers
}

/**
 * Extract message data from webhook payload
 * @param {object} webhookBody - The webhook request body
 * @returns {object|null} - Extracted message data or null
 */
function extractMessageData(webhookBody) {
  try {
    const entry = webhookBody.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;
    
    if (!value?.messages?.[0]) {
      return null;
    }

    const message = value.messages[0];
    const contact = value.contacts?.[0];

    return {
      messageId: message.id,
      from: message.from,
      timestamp: message.timestamp,
      type: message.type,
      // Text message
      text: message.text?.body || '',
      // Audio/Voice note
      audio: message.audio ? {
        id: message.audio.id,
        mimeType: message.audio.mime_type,
        voice: message.audio.voice || false, // true for voice notes
      } : null,
      // Contact info
      contactName: contact?.profile?.name || '',
      // Phone number ID that received the message
      phoneNumberId: value.metadata?.phone_number_id,
    };
  } catch (error) {
    logger.error('Failed to extract message data', { error: error.message });
    return null;
  }
}

module.exports = {
  sendMessage,
  sendReply,
  markAsRead,
  downloadMedia,
  formatPhoneNumber,
  extractMessageData,
};
