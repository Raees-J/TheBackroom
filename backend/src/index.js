/**
 * THE BACKROOM - Main Application Entry Point
 * AI-powered inventory management via WhatsApp
 * 🆓 FREE STACK: Gemini + WhatsApp Cloud API + Local Whisper
 */

const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const config = require('./config');
const logger = require('./utils/logger');
const errorHandler = require('./middleware/errorHandler');
const webhookRoutes = require('./routes/webhook');
const healthRoutes = require('./routes/health');
// Transcription disabled for serverless - use cloud STT service instead
// const transcriptionService = require('./services/transcriptionService');

const app = express();

// ===========================================
// MIDDLEWARE
// ===========================================

// Security headers
app.use(helmet());

// Request logging
app.use(morgan('combined', {
  stream: { write: (message) => logger.info(message.trim()) }
}));

// Parse JSON bodies (WhatsApp Cloud API sends JSON)
app.use(express.json());

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

// ===========================================
// ROUTES
// ===========================================

// Health check endpoints
app.use('/health', healthRoutes);

// WhatsApp webhook endpoints
app.use('/webhook', webhookRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'The Backroom',
    description: 'AI-powered inventory management via WhatsApp',
    version: '1.0.0',
    status: 'running',
    stack: {
      llm: 'Gemini 2.0 Flash-Lite (FREE)',
      stt: 'Whisper-Base via Transformers.js (FREE)',
      messaging: 'WhatsApp Cloud API (FREE)',
      storage: 'Google Sheets API (FREE)',
    },
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`,
  });
});

// Global error handler
app.use(errorHandler);

// ===========================================
// SERVER STARTUP
// ===========================================

const PORT = config.port;

app.listen(PORT, '0.0.0.0', async () => {
  logger.info(`🚀 The Backroom is running on port ${PORT}`);
  logger.info(`📱 WhatsApp webhook: http://localhost:${PORT}/webhook/whatsapp`);
  logger.info(`💚 Health check: http://localhost:${PORT}/health`);
  logger.info(`🌍 Environment: ${config.nodeEnv}`);
  logger.info(`🆓 FREE STACK: Gemini + WhatsApp Cloud + Supabase`);
});

// Export for testing
module.exports = app;
