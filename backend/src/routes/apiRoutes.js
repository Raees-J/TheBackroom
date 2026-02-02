/**
 * API Routes
 * Handles authenticated API endpoints for dashboard
 * 
 * SECURITY FEATURES:
 * - JWT authentication required on all routes
 * - Rate limiting (30 requests per minute per user)
 * - Query parameter validation
 * - Detailed error logging
 */

const express = require('express');
const router = express.Router();
const supabaseService = require('../services/supabaseService');
const logger = require('../utils/logger');
const { requireAuth } = require('../middleware/auth');
const { dashboardLimiter } = require('../middleware/rateLimiter');
const { validateQueryParams, validatePagination } = require('../middleware/validation');
const inventoryRoutes = require('./inventoryRoutes');

// Apply rate limiting to all API routes
router.use(dashboardLimiter);

// Apply authentication to all API routes
router.use(requireAuth);

// Mount inventory routes
router.use('/inventory', inventoryRoutes);

/**
 * GET /api/inventory
 * Get all inventory items
 * 
 * SECURITY:
 * - Requires authentication
 * - Rate limited: 30 requests per minute per user
 * - Query parameters validated
 */
router.get(
  '/inventory',
  validateQueryParams(['page', 'limit', 'search']),
  async (req, res) => {
    try {
      const { page, limit, search } = req.query;

      // Validate pagination if provided
      if (page || limit) {
        const validation = validatePagination(page || 1, limit || 50);
        if (!validation.valid) {
          return res.status(400).json({ error: validation.error });
        }
      }

      let inventory;
      if (search) {
        // Sanitize search query
        const sanitizedSearch = String(search).substring(0, 100);
        inventory = await supabaseService.searchItems(sanitizedSearch);
      } else {
        inventory = await supabaseService.getInventory();
      }

      logger.info('Inventory fetched', {
        user: req.user.phoneNumber,
        count: inventory.length,
        ip: req.ip,
      });

      res.json({
        success: true,
        inventory,
        count: inventory.length,
      });
    } catch (error) {
      logger.error('Failed to fetch inventory', {
        error: error.message,
        user: req.user.phoneNumber,
        ip: req.ip,
      });

      res.status(500).json({
        error: 'Failed to fetch inventory',
        message: 'Please try again later',
      });
    }
  }
);

/**
 * GET /api/transactions
 * Get transaction history
 * 
 * SECURITY:
 * - Requires authentication
 * - Rate limited: 30 requests per minute per user
 * - Query parameters validated
 * - Results limited to prevent data exposure
 */
router.get(
  '/transactions',
  validateQueryParams(['page', 'limit', 'action']),
  async (req, res) => {
    try {
      const { createClient } = require('@supabase/supabase-js');
      const config = require('../config');

      const { page, limit, action } = req.query;

      // Validate pagination
      const validation = validatePagination(page || 1, limit || 50);
      if (!validation.valid) {
        return res.status(400).json({ error: validation.error });
      }

      const supabase = createClient(config.supabase.url, config.supabase.key);

      let query = supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(Math.min(validation.limit, 100)); // Max 100 records

      // Filter by action if provided
      if (action) {
        const validActions = ['ADD', 'REMOVE', 'ADJUST', 'CHECK'];
        const sanitizedAction = String(action).toUpperCase();
        if (validActions.includes(sanitizedAction)) {
          query = query.eq('action', sanitizedAction);
        }
      }

      const { data, error } = await query;

      if (error) throw error;

      logger.info('Transactions fetched', {
        user: req.user.phoneNumber,
        count: data?.length || 0,
        ip: req.ip,
      });

      res.json({
        success: true,
        transactions: data || [],
        count: data?.length || 0,
      });
    } catch (error) {
      logger.error('Failed to fetch transactions', {
        error: error.message,
        user: req.user.phoneNumber,
        ip: req.ip,
      });

      res.status(500).json({
        error: 'Failed to fetch transactions',
        message: 'Please try again later',
      });
    }
  }
);

/**
 * GET /api/stats
 * Get inventory statistics
 * 
 * SECURITY:
 * - Requires authentication
 * - Rate limited: 30 requests per minute per user
 */
router.get('/stats', async (req, res) => {
  try {
    const { createClient } = require('@supabase/supabase-js');
    const config = require('../config');

    const supabase = createClient(config.supabase.url, config.supabase.key);

    // Get inventory count
    const { count: inventoryCount } = await supabase
      .from('inventory')
      .select('*', { count: 'exact', head: true });

    // Get transaction count
    const { count: transactionCount } = await supabase
      .from('transactions')
      .select('*', { count: 'exact', head: true });

    // Get unique SKUs
    const { data: inventory } = await supabase
      .from('inventory')
      .select('item_name');

    const uniqueSKUs = new Set(inventory?.map(item => item.item_name) || []).size;

    logger.info('Stats fetched', {
      user: req.user.phoneNumber,
      ip: req.ip,
    });

    res.json({
      success: true,
      stats: {
        totalItems: inventoryCount || 0,
        uniqueSKUs,
        totalTransactions: transactionCount || 0,
      },
    });
  } catch (error) {
    logger.error('Failed to fetch stats', {
      error: error.message,
      user: req.user.phoneNumber,
      ip: req.ip,
    });

    res.status(500).json({
      error: 'Failed to fetch statistics',
      message: 'Please try again later',
    });
  }
});

module.exports = router;
