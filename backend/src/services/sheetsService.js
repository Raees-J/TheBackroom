/**
 * Google Sheets Service
 * Handles all interactions with Google Sheets for inventory storage
 */

const { google } = require('googleapis');
const config = require('../config');
const logger = require('../utils/logger');

// Sheets API client
let sheetsClient = null;

/**
 * Initialize and get Google Sheets client
 */
async function getClient() {
  if (sheetsClient) {
    return sheetsClient;
  }

  if (!config.google.serviceAccountEmail || !config.google.privateKey) {
    throw new Error('Google Sheets credentials not configured');
  }

  const auth = new google.auth.JWT({
    email: config.google.serviceAccountEmail,
    key: config.google.privateKey,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  sheetsClient = google.sheets({ version: 'v4', auth });
  
  logger.info('Google Sheets client initialized');
  return sheetsClient;
}

/**
 * Sheet structure constants
 */
const SHEETS = {
  INVENTORY: 'Inventory',
  TRANSACTIONS: 'Transactions',
};

const INVENTORY_HEADERS = ['Item Name', 'Quantity', 'Unit', 'Last Updated', 'Updated By'];
const TRANSACTION_HEADERS = ['Timestamp', 'Action', 'Item Name', 'Quantity', 'Unit', 'User', 'Notes'];

/**
 * Ensure the spreadsheet has the required sheets and headers
 */
async function initializeSpreadsheet() {
  logger.info('initializeSpreadsheet: Starting...');
  const sheets = await getClient();
  const spreadsheetId = config.google.spreadsheetId;

  logger.info('initializeSpreadsheet: Got client and spreadsheet ID', { spreadsheetId });

  try {
    // Get existing sheets
    logger.info('initializeSpreadsheet: Fetching existing sheets...');
    const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId });
    const existingSheets = spreadsheet.data.sheets.map(s => s.properties.title);

    logger.info('initializeSpreadsheet: Found existing sheets', { sheets: existingSheets });

    const requests = [];

    // Create Inventory sheet if missing
    if (!existingSheets.includes(SHEETS.INVENTORY)) {
      logger.info('initializeSpreadsheet: Inventory sheet missing, will create');
      requests.push({
        addSheet: {
          properties: { title: SHEETS.INVENTORY },
        },
      });
    }

    // Create Transactions sheet if missing
    if (!existingSheets.includes(SHEETS.TRANSACTIONS)) {
      logger.info('initializeSpreadsheet: Transactions sheet missing, will create');
      requests.push({
        addSheet: {
          properties: { title: SHEETS.TRANSACTIONS },
        },
      });
    }

    if (requests.length > 0) {
      logger.info('initializeSpreadsheet: Creating missing sheets...', { count: requests.length });
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: { requests },
      });
      logger.info('Created missing sheets', { sheets: requests.map(r => r.addSheet?.properties?.title) });
    }

    // Add headers if sheets are empty
    logger.info('initializeSpreadsheet: Ensuring headers...');
    await ensureHeaders(sheets, spreadsheetId, SHEETS.INVENTORY, INVENTORY_HEADERS);
    await ensureHeaders(sheets, spreadsheetId, SHEETS.TRANSACTIONS, TRANSACTION_HEADERS);

    logger.info('Spreadsheet initialized successfully');
  } catch (error) {
    logger.error('Failed to initialize spreadsheet', { 
      error: error.message,
      stack: error.stack,
      code: error.code 
    });
    throw error;
  }
}

/**
 * Ensure a sheet has headers
 */
async function ensureHeaders(sheets, spreadsheetId, sheetName, headers) {
  const range = `${sheetName}!A1:${String.fromCharCode(64 + headers.length)}1`;
  
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range,
  });

  if (!response.data.values || response.data.values.length === 0) {
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range,
      valueInputOption: 'RAW',
      requestBody: { values: [headers] },
    });
    logger.debug('Added headers to sheet', { sheetName });
  }
}

/**
 * Get all inventory items
 * @returns {Promise<Array>} - Array of inventory items
 */
async function getInventory() {
  const sheets = await getClient();
  const spreadsheetId = config.google.spreadsheetId;

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${SHEETS.INVENTORY}!A2:E`,
    });

    const rows = response.data.values || [];
    
    return rows.map((row, index) => ({
      rowIndex: index + 2, // 1-indexed, accounting for header
      name: row[0] || '',
      quantity: parseFloat(row[1]) || 0,
      unit: row[2] || 'units',
      lastUpdated: row[3] || '',
      updatedBy: row[4] || '',
    }));
  } catch (error) {
    logger.error('Failed to get inventory', { error: error.message });
    throw error;
  }
}

/**
 * Find an item by name (case-insensitive partial match)
 * @param {string} itemName - Item name to search for
 * @returns {Promise<object|null>} - Found item or null
 */
async function findItem(itemName) {
  const inventory = await getInventory();
  const searchName = itemName.toLowerCase().trim();
  
  // Try exact match first
  let item = inventory.find(i => i.name.toLowerCase() === searchName);
  
  // Try partial match if no exact match
  if (!item) {
    item = inventory.find(i => i.name.toLowerCase().includes(searchName));
  }
  
  return item || null;
}

/**
 * Search items by query
 * @param {string} query - Search query
 * @returns {Promise<Array>} - Matching items
 */
async function searchItems(query) {
  const inventory = await getInventory();
  const searchQuery = query.toLowerCase().trim();
  
  return inventory.filter(i => 
    i.name.toLowerCase().includes(searchQuery)
  );
}

/**
 * Add or update inventory item
 * @param {object} item - Item to add/update
 * @param {string} userId - User identifier
 * @returns {Promise<object>} - Updated item
 */
async function upsertItem(item, userId) {
  const sheets = await getClient();
  const spreadsheetId = config.google.spreadsheetId;
  const timestamp = new Date().toISOString();

  try {
    logger.info('upsertItem: Starting', { itemName: item.name, quantity: item.quantity });

    // Try to append directly with timeout
    const appendPromise = sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${SHEETS.INVENTORY}!A:E`,
      valueInputOption: 'RAW',
      insertDataOption: 'INSERT_ROWS',
      requestBody: {
        values: [[
          item.name.toLowerCase(),
          item.quantity,
          item.unit || 'units',
          timestamp,
          userId,
        ]],
      },
    });

    // Add 3 second timeout
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Sheets API timeout after 3s')), 3000)
    );

    try {
      await Promise.race([appendPromise, timeoutPromise]);
      logger.info('upsertItem: Successfully appended new item', { name: item.name });
      return { name: item.name, quantity: item.quantity, unit: item.unit || 'units' };
    } catch (appendError) {
      logger.error('upsertItem: Append failed', { 
        error: appendError.message,
        code: appendError.code,
        stack: appendError.stack 
      });
      throw appendError;
    }
  } catch (error) {
    logger.error('Failed to upsert item', { 
      error: error.message, 
      stack: error.stack, 
      item 
    });
    throw error;
  }
}

/**
 * Remove quantity from inventory
 * @param {object} item - Item to remove
 * @param {string} userId - User identifier
 * @returns {Promise<object>} - Updated item
 */
async function removeItem(item, userId) {
  const sheets = await getClient();
  const spreadsheetId = config.google.spreadsheetId;
  const timestamp = new Date().toISOString();

  try {
    const existingItem = await findItem(item.name);

    if (!existingItem) {
      throw new Error(`Item "${item.name}" not found in inventory`);
    }

    const newQuantity = Math.max(0, existingItem.quantity - item.quantity);
    const range = `${SHEETS.INVENTORY}!A${existingItem.rowIndex}:E${existingItem.rowIndex}`;

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range,
      valueInputOption: 'RAW',
      requestBody: {
        values: [[
          existingItem.name,
          newQuantity,
          existingItem.unit,
          timestamp,
          userId,
        ]],
      },
    });

    logger.info('Removed from inventory item', {
      name: existingItem.name,
      oldQuantity: existingItem.quantity,
      removed: item.quantity,
      newQuantity,
    });

    return { ...existingItem, quantity: newQuantity };
  } catch (error) {
    logger.error('Failed to remove item', { error: error.message, item });
    throw error;
  }
}

/**
 * Set exact quantity for an item (adjust/stocktake)
 * @param {object} item - Item with new quantity
 * @param {string} userId - User identifier
 * @returns {Promise<object>} - Updated item
 */
async function setItemQuantity(item, userId) {
  const sheets = await getClient();
  const spreadsheetId = config.google.spreadsheetId;
  const timestamp = new Date().toISOString();

  try {
    const existingItem = await findItem(item.name);

    if (existingItem) {
      const range = `${SHEETS.INVENTORY}!A${existingItem.rowIndex}:E${existingItem.rowIndex}`;
      
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range,
        valueInputOption: 'RAW',
        requestBody: {
          values: [[
            existingItem.name,
            item.quantity,
            item.unit || existingItem.unit,
            timestamp,
            userId,
          ]],
        },
      });

      return { ...existingItem, quantity: item.quantity };
    } else {
      // Add as new item
      return await upsertItem({ ...item, quantity: item.quantity }, userId);
    }
  } catch (error) {
    logger.error('Failed to set item quantity', { error: error.message, item });
    throw error;
  }
}

/**
 * Log a transaction
 * @param {object} transaction - Transaction details
 */
async function logTransaction(transaction) {
  const sheets = await getClient();
  const spreadsheetId = config.google.spreadsheetId;

  try {
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${SHEETS.TRANSACTIONS}!A:G`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [[
          new Date().toISOString(),
          transaction.action,
          transaction.itemName,
          transaction.quantity,
          transaction.unit,
          transaction.userId,
          transaction.notes || '',
        ]],
      },
    });

    logger.debug('Transaction logged', { action: transaction.action, item: transaction.itemName });
  } catch (error) {
    logger.error('Failed to log transaction', { error: error.message });
    // Don't throw - transaction logging shouldn't break the main flow
  }
}

module.exports = {
  initializeSpreadsheet,
  getInventory,
  findItem,
  searchItems,
  upsertItem,
  removeItem,
  setItemQuantity,
  logTransaction,
};
