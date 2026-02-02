/**
 * Inventory Routes
 * Handles inventory management operations
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const { supabase } = require('../services/supabaseService');
const geminiService = require('../services/geminiService');
const auth = require('../middleware/auth');
const logger = require('../utils/logger');

// Configure multer for image uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

/**
 * POST /api/inventory
 * Create a new inventory item
 */
router.post('/', auth, async (req, res) => {
  try {
    const { name, quantity, unit } = req.body;

    if (!name || quantity === undefined || !unit) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'name, quantity, and unit are required',
      });
    }

    const qty = parseInt(quantity);
    if (isNaN(qty) || qty < 0) {
      return res.status(400).json({
        error: 'Invalid quantity',
        message: 'quantity must be a non-negative number',
      });
    }

    // Check if item already exists
    const { data: existing } = await supabase
      .from('inventory')
      .select('*')
      .eq('user_id', req.user.phoneNumber)
      .eq('name', name)
      .single();

    if (existing) {
      return res.status(409).json({
        error: 'Item already exists',
        message: 'An item with this name already exists',
      });
    }

    // Create new item
    const { data: created, error: createError } = await supabase
      .from('inventory')
      .insert([
        {
          user_id: req.user.phoneNumber,
          name,
          quantity: qty,
          unit,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          updated_by: req.user.phoneNumber,
        },
      ])
      .select()
      .single();

    if (createError) throw createError;

    // Log transaction
    await supabase.from('transactions').insert([
      {
        user_id: req.user.phoneNumber,
        item_name: name,
        action: 'ADD',
        quantity: qty,
        created_at: new Date().toISOString(),
      },
    ]);

    logger.info('Inventory item created', {
      user: req.user.phoneNumber,
      item: name,
      quantity: qty,
    });

    res.status(201).json({
      success: true,
      item: created,
      message: 'Item created successfully',
    });
  } catch (error) {
    logger.error('Failed to create inventory item', { error: error.message });
    res.status(500).json({
      error: 'Failed to create item',
      message: error.message,
    });
  }
});

/**
 * DELETE /api/inventory/:id
 * Delete an inventory item
 */
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    // Get item first
    const { data: item, error: fetchError } = await supabase
      .from('inventory')
      .select('*')
      .eq('id', id)
      .eq('user_id', req.user.phoneNumber)
      .single();

    if (fetchError || !item) {
      return res.status(404).json({
        error: 'Item not found',
      });
    }

    // Delete item
    const { error: deleteError } = await supabase
      .from('inventory')
      .delete()
      .eq('id', id);

    if (deleteError) throw deleteError;

    // Log transaction
    await supabase.from('transactions').insert([
      {
        user_id: req.user.phoneNumber,
        item_name: item.name,
        action: 'REMOVE',
        quantity: item.quantity,
        created_at: new Date().toISOString(),
      },
    ]);

    logger.info('Inventory item deleted', {
      user: req.user.phoneNumber,
      item: item.name,
    });

    res.json({
      success: true,
      message: 'Item deleted successfully',
    });
  } catch (error) {
    logger.error('Failed to delete inventory item', { error: error.message });
    res.status(500).json({
      error: 'Failed to delete item',
      message: error.message,
    });
  }
});

/**
 * GET /api/inventory
 * Get all inventory items for authenticated user
 */
router.get('/', auth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('inventory')
      .select('*')
      .eq('user_id', req.user.phoneNumber)
      .order('updated_at', { ascending: false });

    if (error) throw error;

    res.json({
      success: true,
      inventory: data || [],
    });
  } catch (error) {
    logger.error('Failed to fetch inventory', { error: error.message });
    res.status(500).json({
      error: 'Failed to fetch inventory',
      message: error.message,
    });
  }
});

/**
 * PATCH /api/inventory/:id
 * Update inventory quantity (add or remove stock)
 */
router.patch('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { action, quantity } = req.body;

    if (!action || !quantity) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'action and quantity are required',
      });
    }

    if (!['ADD', 'REMOVE'].includes(action)) {
      return res.status(400).json({
        error: 'Invalid action',
        message: 'action must be ADD or REMOVE',
      });
    }

    const qty = parseInt(quantity);
    if (isNaN(qty) || qty <= 0) {
      return res.status(400).json({
        error: 'Invalid quantity',
        message: 'quantity must be a positive number',
      });
    }

    // Get current item
    const { data: item, error: fetchError } = await supabase
      .from('inventory')
      .select('*')
      .eq('id', id)
      .eq('user_id', req.user.phoneNumber)
      .single();

    if (fetchError || !item) {
      return res.status(404).json({
        error: 'Item not found',
      });
    }

    // Calculate new quantity
    const newQuantity = action === 'ADD' 
      ? item.quantity + qty 
      : Math.max(0, item.quantity - qty);

    // Update inventory
    const { data: updated, error: updateError } = await supabase
      .from('inventory')
      .update({
        quantity: newQuantity,
        updated_at: new Date().toISOString(),
        updated_by: req.user.phoneNumber,
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) throw updateError;

    // Log transaction
    await supabase.from('transactions').insert([
      {
        user_id: req.user.phoneNumber,
        item_name: item.name,
        action,
        quantity: qty,
        created_at: new Date().toISOString(),
      },
    ]);

    logger.info('Inventory updated', {
      user: req.user.phoneNumber,
      item: item.name,
      action,
      quantity: qty,
      newQuantity,
    });

    res.json({
      success: true,
      item: updated,
      message: `${action === 'ADD' ? 'Added' : 'Removed'} ${qty} ${item.unit}`,
    });
  } catch (error) {
    logger.error('Failed to update inventory', { error: error.message });
    res.status(500).json({
      error: 'Failed to update inventory',
      message: error.message,
    });
  }
});

/**
 * POST /api/inventory/analyze-image
 * Analyze image and extract inventory data using AI
 */
router.post('/analyze-image', auth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'No image provided',
        message: 'Please upload an image',
      });
    }

    // Convert image to base64
    const imageBase64 = req.file.buffer.toString('base64');
    const mimeType = req.file.mimetype;

    // Analyze image with Gemini
    const prompt = `Analyze this inventory document/image and extract all items with their quantities and units.
    
Return the data in this exact JSON format:
{
  "items": [
    {
      "name": "item name",
      "quantity": number,
      "unit": "unit (e.g., boxes, units, kg, etc.)"
    }
  ]
}

If you can't find clear inventory data, return an empty items array.
Only include items you're confident about.`;

    const analysis = await geminiService.analyzeImageWithGemini(
      imageBase64,
      mimeType,
      prompt
    );

    // Parse the response
    let items = [];
    try {
      const parsed = JSON.parse(analysis);
      items = parsed.items || [];
    } catch (parseError) {
      // Try to extract JSON from markdown code blocks
      const jsonMatch = analysis.match(/```json\n([\s\S]*?)\n```/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[1]);
        items = parsed.items || [];
      }
    }

    if (items.length === 0) {
      return res.json({
        success: false,
        message: 'No inventory items found in the image',
        items: [],
      });
    }

    logger.info('Image analyzed', {
      user: req.user.phoneNumber,
      itemsFound: items.length,
    });

    res.json({
      success: true,
      items,
      message: `Found ${items.length} item(s) in the image`,
    });
  } catch (error) {
    logger.error('Failed to analyze image', { error: error.message });
    res.status(500).json({
      error: 'Failed to analyze image',
      message: error.message,
    });
  }
});

/**
 * POST /api/inventory/bulk-add
 * Add multiple items from image analysis
 */
router.post('/bulk-add', auth, async (req, res) => {
  try {
    const { items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        error: 'Invalid items',
        message: 'items array is required',
      });
    }

    const results = [];
    const transactions = [];

    for (const item of items) {
      const { name, quantity, unit } = item;

      // Check if item exists
      const { data: existing } = await supabase
        .from('inventory')
        .select('*')
        .eq('user_id', req.user.phoneNumber)
        .eq('name', name)
        .single();

      if (existing) {
        // Update existing item
        const newQuantity = existing.quantity + quantity;
        const { data: updated } = await supabase
          .from('inventory')
          .update({
            quantity: newQuantity,
            updated_at: new Date().toISOString(),
            updated_by: req.user.phoneNumber,
          })
          .eq('id', existing.id)
          .select()
          .single();

        results.push(updated);
        transactions.push({
          user_id: req.user.phoneNumber,
          item_name: name,
          action: 'ADD',
          quantity,
          created_at: new Date().toISOString(),
        });
      } else {
        // Create new item
        const { data: created } = await supabase
          .from('inventory')
          .insert([
            {
              user_id: req.user.phoneNumber,
              name,
              quantity,
              unit,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              updated_by: req.user.phoneNumber,
            },
          ])
          .select()
          .single();

        results.push(created);
        transactions.push({
          user_id: req.user.phoneNumber,
          item_name: name,
          action: 'ADD',
          quantity,
          created_at: new Date().toISOString(),
        });
      }
    }

    // Log all transactions
    await supabase.from('transactions').insert(transactions);

    logger.info('Bulk inventory added', {
      user: req.user.phoneNumber,
      itemsAdded: results.length,
    });

    res.json({
      success: true,
      items: results,
      message: `Successfully added ${results.length} item(s)`,
    });
  } catch (error) {
    logger.error('Failed to bulk add inventory', { error: error.message });
    res.status(500).json({
      error: 'Failed to add items',
      message: error.message,
    });
  }
});

module.exports = router;
