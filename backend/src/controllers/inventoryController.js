/**
 * Inventory Controller
 * Orchestrates the processing of inventory messages
 */

const geminiService = require('../services/geminiService');
const transcriptionService = require('../services/transcriptionService');
const sheetsService = require('../services/sheetsService');
const whatsappService = require('../services/whatsappService');
const logger = require('../utils/logger');

/**
 * Process an incoming WhatsApp message
 * @param {object} messageData - The incoming message data
 * @returns {Promise<object>} - Processing result with response message
 */
async function processMessage(messageData) {
  const { from, body, isVoiceNote, audioId, audioMimeType } = messageData;
  const userId = whatsappService.formatPhoneNumber(from);

  logger.info('Processing message', { userId, isVoiceNote, bodyLength: body?.length });

  try {
    let messageText = body;

    // Handle voice notes - transcribe to text using local Whisper
    if (isVoiceNote && audioId) {
      logger.info('Transcribing voice note', { audioId });
      messageText = await handleVoiceNote(audioId, audioMimeType);
      
      if (!messageText) {
        return {
          success: false,
          message: "❌ Sorry, I couldn't understand that voice note. Please try again or send a text message.",
        };
      }
    }

    // Handle empty messages
    if (!messageText || messageText.trim() === '') {
      return {
        success: true,
        message: geminiService.generateResponseMessage({ action: 'help', success: true }),
      };
    }

    // Check for help commands
    const helpCommands = ['help', 'hi', 'hello', 'hey', 'start', '?', 'menu'];
    if (helpCommands.includes(messageText.toLowerCase().trim())) {
      return {
        success: true,
        message: geminiService.generateResponseMessage({ action: 'help', success: true }),
      };
    }

    // Parse the message using Gemini AI
    const parsed = await geminiService.parseInventoryMessage(messageText);

    logger.info('Message parsed', { action: parsed.action, confidence: parsed.confidence });

    // Handle low confidence
    if (parsed.confidence < 0.5 && parsed.action !== 'help') {
      return {
        success: true,
        message: `🤔 I'm not quite sure what you mean by:\n"${messageText}"\n\nTry being more specific, like:\n• "Added 10 boxes of screws"\n• "Sold 5 batteries"\n• "Check cable stock"`,
      };
    }

    // Execute the action
    const result = await executeAction(parsed, userId);

    // Generate response message
    const responseMessage = geminiService.generateResponseMessage(result);

    return {
      success: result.success,
      message: responseMessage,
    };
  } catch (error) {
    logger.error('Error processing message', { error: error.message, userId });
    
    return {
      success: false,
      message: '❌ Sorry, something went wrong. Please try again in a moment.',
    };
  }
}

/**
 * Handle voice note transcription using local Whisper
 * @param {string} audioId - WhatsApp media ID
 * @param {string} mimeType - MIME type of the audio
 * @returns {Promise<string|null>} - Transcribed text or null
 */
async function handleVoiceNote(audioId, mimeType) {
  try {
    // Download the audio file from WhatsApp
    const audioBuffer = await whatsappService.downloadMedia(audioId);
    
    // Transcribe using local Whisper (FREE!)
    const transcription = await transcriptionService.transcribeAudio(audioBuffer, mimeType);
    
    logger.info('Voice note transcribed', { textLength: transcription.length });
    
    return transcription;
  } catch (error) {
    logger.error('Failed to handle voice note', { error: error.message });
    return null;
  }
}

/**
 * Execute an inventory action
 * @param {object} parsed - Parsed message data
 * @param {string} userId - User identifier
 * @returns {Promise<object>} - Action result
 */
async function executeAction(parsed, userId) {
  const { action, items, searchQuery } = parsed;

  try {
    switch (action) {
      case 'add':
        return await handleAddItems(items, userId);

      case 'remove':
        return await handleRemoveItems(items, userId);

      case 'check':
        return await handleCheckStock(searchQuery || items?.[0]?.name);

      case 'adjust':
        return await handleAdjustStock(items, userId);

      case 'list':
        return await handleListInventory(searchQuery);

      case 'help':
        return { action: 'help', success: true };

      default:
        return { action: 'unknown', success: false };
    }
  } catch (error) {
    logger.error('Action execution failed', { action, error: error.message });
    return {
      action,
      success: false,
      error: error.message,
    };
  }
}

/**
 * Handle adding items to inventory
 */
async function handleAddItems(items, userId) {
  if (!items || items.length === 0) {
    return { action: 'add', success: false, error: 'No items to add' };
  }

  const results = [];

  for (const item of items) {
    const result = await sheetsService.upsertItem(item, userId);
    results.push(result);

    // Log transaction
    await sheetsService.logTransaction({
      action: 'ADD',
      itemName: item.name,
      quantity: item.quantity,
      unit: item.unit,
      userId,
      notes: item.notes,
    });
  }

  return {
    action: 'add',
    success: true,
    items: results,
  };
}

/**
 * Handle removing items from inventory
 */
async function handleRemoveItems(items, userId) {
  if (!items || items.length === 0) {
    return { action: 'remove', success: false, error: 'No items to remove' };
  }

  const results = [];
  const errors = [];

  for (const item of items) {
    try {
      const result = await sheetsService.removeItem(item, userId);
      results.push(result);

      // Log transaction
      await sheetsService.logTransaction({
        action: 'REMOVE',
        itemName: item.name,
        quantity: item.quantity,
        unit: item.unit,
        userId,
        notes: item.notes,
      });
    } catch (error) {
      errors.push(`${item.name}: ${error.message}`);
    }
  }

  if (errors.length > 0 && results.length === 0) {
    return {
      action: 'remove',
      success: false,
      error: errors.join('; '),
    };
  }

  return {
    action: 'remove',
    success: true,
    items: results,
    warnings: errors.length > 0 ? errors : undefined,
  };
}

/**
 * Handle checking stock levels
 */
async function handleCheckStock(query) {
  if (!query) {
    // Return all inventory if no specific query
    const inventory = await sheetsService.getInventory();
    return {
      action: 'check',
      success: true,
      data: inventory,
    };
  }

  const items = await sheetsService.searchItems(query);
  
  return {
    action: 'check',
    success: true,
    data: items,
  };
}

/**
 * Handle stock adjustment (stocktake)
 */
async function handleAdjustStock(items, userId) {
  if (!items || items.length === 0) {
    return { action: 'adjust', success: false, error: 'No items to adjust' };
  }

  const results = [];

  for (const item of items) {
    const result = await sheetsService.setItemQuantity(item, userId);
    results.push(result);

    // Log transaction
    await sheetsService.logTransaction({
      action: 'ADJUST',
      itemName: item.name,
      quantity: item.quantity,
      unit: item.unit,
      userId,
      notes: 'Stock adjustment/stocktake',
    });
  }

  return {
    action: 'adjust',
    success: true,
    items: results,
  };
}

/**
 * Handle listing inventory
 */
async function handleListInventory(searchQuery) {
  let inventory;
  
  if (searchQuery) {
    inventory = await sheetsService.searchItems(searchQuery);
  } else {
    inventory = await sheetsService.getInventory();
  }

  return {
    action: 'list',
    success: true,
    data: inventory,
  };
}

module.exports = {
  processMessage,
  executeAction,
};
