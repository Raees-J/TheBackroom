/**
 * Google Gemini Service
 * Uses Gemini 2.0 Flash-Lite for NLP (FREE: 1,500 RPD)
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');
const config = require('../config');
const logger = require('../utils/logger');

// Initialize Gemini client
let genAI = null;
let model = null;

function getClient() {
  if (!genAI && config.gemini.apiKey) {
    genAI = new GoogleGenerativeAI(config.gemini.apiKey);
    model = genAI.getGenerativeModel({ model: config.gemini.model });
  }
  return model;
}

/**
 * System prompt for inventory parsing
 */
const SYSTEM_PROMPT = `You are an AI assistant for "The Backroom" - an inventory management system for small businesses. Your job is to parse natural language messages about inventory into structured data.

Users will send messages about:
1. ADDING stock (received items, deliveries, purchases)
2. REMOVING stock (sales, used items, damaged goods, theft)
3. CHECKING stock levels
4. ADJUSTING stock (corrections, stocktake)
5. LISTING all items or searching for items

Parse the user's message and respond with a JSON object. Always respond ONLY with valid JSON, no other text or markdown.

Response format:
{
  "action": "add" | "remove" | "check" | "adjust" | "list" | "help" | "unknown",
  "items": [
    {
      "name": "item name (standardized, lowercase)",
      "quantity": number,
      "unit": "units" | "kg" | "liters" | "boxes" | "packs" | "pieces" | etc,
      "notes": "any additional context"
    }
  ],
  "searchQuery": "search term if action is list or check",
  "confidence": 0.0 to 1.0,
  "originalMessage": "the original message for reference"
}

Examples:
- "Got 50 bottles of Coke" → action: "add", items: [{name: "coke bottles", quantity: 50, unit: "bottles"}]
- "Sold 3 solar panels" → action: "remove", items: [{name: "solar panels", quantity: 3, unit: "pieces"}]
- "How many batteries do we have?" → action: "check", searchQuery: "batteries"
- "Stock count: 100 screws, 50 bolts" → action: "adjust", items: [...]
- "What's in stock?" → action: "list"

Handle South African English, slang, and common misspellings. Be smart about inferring units when not specified.`;

/**
 * Parse an inventory message using Gemini
 * @param {string} message - The user's message
 * @returns {Promise<object>} - Parsed inventory action
 */
async function parseInventoryMessage(message) {
  const client = getClient();
  
  if (!client) {
    logger.error('Gemini client not initialized');
    throw new Error('Gemini not configured');
  }

  try {
    logger.debug('Parsing inventory message with Gemini', { message });

    const prompt = `${SYSTEM_PROMPT}\n\nUser message: "${message}"\n\nRespond with JSON only:`;

    logger.info('Calling Gemini API...');
    
    // Add timeout wrapper
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Gemini API timeout after 5s')), 5000)
    );
    
    const apiPromise = client.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.1, // Low temperature for consistent parsing
        maxOutputTokens: 500,
        responseMimeType: 'application/json',
      },
    });

    const result = await Promise.race([apiPromise, timeoutPromise]);
    logger.info('Gemini API responded');

    const response = result.response;
    const content = response.text();
    
    if (!content) {
      throw new Error('No response from Gemini');
    }

    // Clean potential markdown code blocks
    const cleanedContent = content
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    const parsed = JSON.parse(cleanedContent);
    
    logger.info('Message parsed successfully', {
      action: parsed.action,
      itemCount: parsed.items?.length || 0,
      confidence: parsed.confidence,
    });

    return parsed;
  } catch (error) {
    logger.error('Failed to parse inventory message', {
      error: error.message,
      stack: error.stack,
      message,
    });
    
    // Return unknown action on error
    return {
      action: 'unknown',
      items: [],
      confidence: 0,
      originalMessage: message,
      error: error.message,
    };
  }
}

/**
 * Generate a friendly response message based on the action result
 * @param {object} actionResult - The result of the inventory action
 * @returns {string} - User-friendly response message
 */
function generateResponseMessage(actionResult) {
  const { action, success, items, data, error } = actionResult;

  if (!success) {
    return `❌ ${error || 'Something went wrong. Please try again.'}`;
  }

  switch (action) {
    case 'add':
      const addedItems = items.map(i => `${i.quantity} ${i.unit} of ${i.name}`).join(', ');
      return `✅ Added to inventory:\n${addedItems}\n\n📊 Your spreadsheet has been updated!`;

    case 'remove':
      const removedItems = items.map(i => `${i.quantity} ${i.unit} of ${i.name}`).join(', ');
      return `✅ Removed from inventory:\n${removedItems}\n\n📊 Your spreadsheet has been updated!`;

    case 'check':
      if (data && data.length > 0) {
        const stockInfo = data.map(i => `• ${i.name}: ${i.quantity} ${i.unit}`).join('\n');
        return `📦 Current stock levels:\n${stockInfo}`;
      }
      return `🔍 No items found matching your search.`;

    case 'adjust':
      return `✅ Stock levels adjusted!\n📊 Your spreadsheet has been updated with the new counts.`;

    case 'list':
      if (data && data.length > 0) {
        const listInfo = data.slice(0, 10).map(i => `• ${i.name}: ${i.quantity} ${i.unit}`).join('\n');
        const more = data.length > 10 ? `\n... and ${data.length - 10} more items` : '';
        return `📦 Inventory list:\n${listInfo}${more}`;
      }
      return `📦 Your inventory is empty. Send me items to add!`;

    case 'help':
      return `👋 Welcome to The Backroom!\n\nI help you manage inventory via WhatsApp. Just tell me:\n\n📥 *Add stock:* "Got 50 bottles of Coke"\n📤 *Remove stock:* "Sold 3 solar panels"\n🔍 *Check stock:* "How many batteries?"\n📋 *List all:* "What's in stock?"\n\nI understand natural language - just chat like normal!`;

    default:
      return `🤔 I'm not sure what you mean. Try saying things like:\n• "Added 10 boxes of screws"\n• "Sold 5 batteries"\n• "How many cables do we have?"`;
  }
}

module.exports = {
  parseInventoryMessage,
  generateResponseMessage,
};
