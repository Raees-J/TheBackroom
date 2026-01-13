/**
 * Supabase Service
 * Handles all database interactions for inventory storage
 */

const { createClient } = require('@supabase/supabase-js');
const config = require('../config');
const logger = require('../utils/logger');

// Supabase client
let supabase = null;

/**
 * Initialize and get Supabase client
 */
function getClient() {
  if (supabase) {
    return supabase;
  }

  if (!config.supabase.url || !config.supabase.key) {
    logger.error('Supabase not configured');
    throw new Error('Supabase not configured');
  }

  supabase = createClient(config.supabase.url, config.supabase.key);
  logger.info('Supabase client initialized');
  
  return supabase;
}

/**
 * Get all inventory items
 */
async function getInventory() {
  const client = getClient();
  
  try {
    const { data, error } = await client
      .from('inventory')
      .select('*')
      .order('name');

    if (error) throw error;

    logger.info('Retrieved inventory', { count: data?.length || 0 });
    return data || [];
  } catch (error) {
    logger.error('Failed to get inventory', { error: error.message });
    throw error;
  }
}

/**
 * Find an item by name
 */
async function findItem(itemName) {
  const client = getClient();
  
  try {
    const { data, error } = await client
      .from('inventory')
      .select('*')
      .ilike('name', `%${itemName}%`)
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows
    
    return data || null;
  } catch (error) {
    logger.error('Failed to find item', { error: error.message, itemName });
    return null;
  }
}

/**
 * Search items by query
 */
async function searchItems(query) {
  const client = getClient();
  
  try {
    const { data, error } = await client
      .from('inventory')
      .select('*')
      .ilike('name', `%${query}%`);

    if (error) throw error;

    return data || [];
  } catch (error) {
    logger.error('Failed to search items', { error: error.message, query });
    throw error;
  }
}

/**
 * Add or update inventory item
 */
async function upsertItem(item, userId) {
  const client = getClient();
  
  try {
    logger.info('upsertItem: Starting', { itemName: item.name, quantity: item.quantity });

    // Check if item exists
    const existing = await findItem(item.name);

    if (existing) {
      // Update existing item
      const newQuantity = existing.quantity + item.quantity;
      
      const { data, error } = await client
        .from('inventory')
        .update({
          quantity: newQuantity,
          unit: item.unit || existing.unit,
          updated_at: new Date().toISOString(),
          updated_by: userId,
        })
        .eq('id', existing.id)
        .select()
        .single();

      if (error) throw error;

      logger.info('Updated inventory item', {
        name: existing.name,
        oldQuantity: existing.quantity,
        change: item.quantity,
        newQuantity,
      });

      return data;
    } else {
      // Insert new item
      const { data, error } = await client
        .from('inventory')
        .insert({
          name: item.name.toLowerCase(),
          quantity: item.quantity,
          unit: item.unit || 'units',
          updated_by: userId,
        })
        .select()
        .single();

      if (error) throw error;

      logger.info('Added new inventory item', { name: item.name, quantity: item.quantity });

      return data;
    }
  } catch (error) {
    logger.error('Failed to upsert item', { error: error.message, item });
    throw error;
  }
}

/**
 * Remove quantity from inventory
 */
async function removeItem(item, userId) {
  const client = getClient();
  
  try {
    const existing = await findItem(item.name);

    if (!existing) {
      throw new Error(`Item "${item.name}" not found in inventory`);
    }

    const newQuantity = Math.max(0, existing.quantity - item.quantity);

    const { data, error } = await client
      .from('inventory')
      .update({
        quantity: newQuantity,
        updated_at: new Date().toISOString(),
        updated_by: userId,
      })
      .eq('id', existing.id)
      .select()
      .single();

    if (error) throw error;

    logger.info('Removed from inventory', {
      name: existing.name,
      oldQuantity: existing.quantity,
      removed: item.quantity,
      newQuantity,
    });

    return data;
  } catch (error) {
    logger.error('Failed to remove item', { error: error.message, item });
    throw error;
  }
}

/**
 * Set exact quantity for an item
 */
async function setItemQuantity(item, userId) {
  const client = getClient();
  
  try {
    const existing = await findItem(item.name);

    if (existing) {
      const { data, error } = await client
        .from('inventory')
        .update({
          quantity: item.quantity,
          unit: item.unit || existing.unit,
          updated_at: new Date().toISOString(),
          updated_by: userId,
        })
        .eq('id', existing.id)
        .select()
        .single();

      if (error) throw error;

      return data;
    } else {
      // Create new item
      return await upsertItem(item, userId);
    }
  } catch (error) {
    logger.error('Failed to set item quantity', { error: error.message, item });
    throw error;
  }
}

/**
 * Log a transaction
 */
async function logTransaction(transaction) {
  const client = getClient();
  
  try {
    const { error } = await client
      .from('transactions')
      .insert({
        action: transaction.action,
        item_name: transaction.itemName,
        quantity: transaction.quantity,
        unit: transaction.unit,
        user_id: transaction.userId,
        notes: transaction.notes || '',
      });

    if (error) throw error;

    logger.debug('Transaction logged', { action: transaction.action, item: transaction.itemName });
  } catch (error) {
    logger.error('Failed to log transaction', { error: error.message });
    // Don't throw - transaction logging shouldn't break the main flow
  }
}

module.exports = {
  getInventory,
  findItem,
  searchItems,
  upsertItem,
  removeItem,
  setItemQuantity,
  logTransaction,
};
