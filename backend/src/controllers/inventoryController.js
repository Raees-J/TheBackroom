/**
 * Inventory Controller
 * Orchestrates the processing of inventory messages
 */

const geminiService = require('../services/geminiService');
// Transcription disabled for serverless - use cloud STT service instead
// const transcriptionService = require('../services/transcriptionService');
const supabaseService = require('../services/supabaseService');
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

    // Handle voice notes - temporarily disabled for serverless
    if (isVoiceNote && audioId) {
      logger.warn('Voice notes not supported in serverless environment');
      return {
        success: false,
        message: '🎤 Voice notes are currently not supported. Please send a text message instead.',
      };
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
    logger.info('About to call Gemini to parse message');
    
    // TEMPORARY: Skip Gemini and use simple parsing for testing
    logger.warn('Skipping Gemini, using simple regex parsing for testing');
    const parsed = parseSimple(messageText);
    logger.info('Message parsed with simple parser', { action: parsed.action, confidence: parsed.confidence });

    // Handle low confidence
    if (parsed.confidence < 0.5 && parsed.action !== 'help') {
      return {
        success: true,
        message: `🤔 I'm not quite sure what you mean by:\n"${messageText}"\n\nTry being more specific, like:\n• "Added 10 boxes of screws"\n• "Sold 5 batteries"\n• "Check cable stock"`,
      };
    }

    // Execute the action
    logger.info('About to execute action', { action: parsed.action });
    const result = await executeAction(parsed, userId);
    logger.info('Action executed', { success: result.success });

    // Generate response message
    const responseMessage = geminiService.generateResponseMessage(result);

    return {
      success: result.success,
      message: responseMessage,
    };
  } catch (error) {
    logger.error('Error processing message', { error: error.message, stack: error.stack, userId });
    
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
    const result = await supabaseService.upsertItem(item, userId);
    results.push(result);

    // Log transaction
    await supabaseService.logTransaction({
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
      const result = await supabaseService.removeItem(item, userId);
      results.push(result);

      // Log transaction
      await supabaseService.logTransaction({
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
    const inventory = await supabaseService.getInventory();
    return {
      action: 'check',
      success: true,
      data: inventory,
    };
  }

  const items = await supabaseService.searchItems(query);
  
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
    const result = await supabaseService.setItemQuantity(item, userId);
    results.push(result);

    // Log transaction
    await supabaseService.logTransaction({
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
    inventory = await supabaseService.searchItems(searchQuery);
  } else {
    inventory = await supabaseService.getInventory();
  }

  return {
    action: 'list',
    success: true,
    data: inventory,
  };
}

/**
 * Simple regex-based parser (fallback when Gemini unavailable)
 */
function parseSimple(message) {
  const lowerMsg = message.toLowerCase();
  
  // Check for add/receive keywords
  if (lowerMsg.match(/add|added|got|received|bought|purchase/)) {
    // Match patterns like "Added 30 screws" or "Got 10 boxes of nails"
    const match = message.match(/(\d+)\s*(?:(\w+)\s+(?:of\s+)?)?(.+?)$/i);
    if (match) {
      const quantity = parseInt(match[1]);
      const unit = match[2] || 'units';
      const name = match[3].trim();
      
      return {
        action: 'add',
        items: [{
          name: name,
          quantity: quantity,
          unit: unit,
        }],
        confidence: 0.8,
      };
    }
  }
  
  // Check for remove/sell keywords
  if (lowerMsg.match(/sold|sell|remove|used|took/)) {
    const match = message.match(/(\d+)\s*(?:(\w+)\s+(?:of\s+)?)?(.+?)$/i);
    if (match) {
      const quantity = parseInt(match[1]);
      const unit = match[2] || 'units';
      const name = match[3].trim();
      
      return {
        action: 'remove',
        items: [{
          name: name,
          quantity: quantity,
          unit: unit,
        }],
        confidence: 0.8,
      };
    }
  }
  
  return {
    action: 'unknown',
    items: [],
    confidence: 0,
  };
}

module.exports = {
  processMessage,
  executeAction,
};
