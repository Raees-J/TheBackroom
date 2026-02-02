/**
 * Central configuration module
 * Loads and validates all environment variables
 * 🆓 FREE STACK Configuration
 * 
 * SECURITY: All sensitive values MUST be loaded from environment variables
 * NEVER hardcode API keys, secrets, or credentials in this file
 */

require('dotenv').config();

const config = {
  // Server
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',

  // JWT Authentication
  // SECURITY: JWT_SECRET must be set in production
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '30d',
  },

  // WhatsApp Cloud API (FREE for service conversations)
  whatsapp: {
    phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID,
    accessToken: process.env.WHATSAPP_ACCESS_TOKEN,
    verifyToken: process.env.WHATSAPP_VERIFY_TOKEN,
    businessAccountId: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID,
    apiVersion: 'v18.0',
  },

  // Google Gemini (FREE: 1,500 requests per day)
  gemini: {
    apiKey: process.env.GEMINI_API_KEY,
    model: process.env.GEMINI_MODEL || 'gemini-2.0-flash-lite',
  },

  // Local Whisper via Transformers.js (FREE: runs on CPU)
  whisper: {
    model: process.env.WHISPER_MODEL || 'Xenova/whisper-base',
  },

  // Google Sheets (FREE: 300 requests per minute)
  google: {
    serviceAccountEmail: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    privateKey: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID,
  },

  // Supabase (FREE: 500MB database, 1GB bandwidth)
  supabase: {
    url: process.env.SUPABASE_URL,
    key: process.env.SUPABASE_ANON_KEY,
  },

  // Upstash Redis (FREE: 10,000 commands/day)
  redis: {
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  },

  // Logging
  logLevel: process.env.LOG_LEVEL || 'info',
};

/**
 * Validate required configuration
 * SECURITY: Ensures all critical environment variables are set
 */
function validateConfig() {
  const required = [
    { key: 'jwt.secret', value: config.jwt.secret, critical: true },
    { key: 'whatsapp.phoneNumberId', value: config.whatsapp.phoneNumberId, critical: true },
    { key: 'whatsapp.accessToken', value: config.whatsapp.accessToken, critical: true },
    { key: 'whatsapp.verifyToken', value: config.whatsapp.verifyToken, critical: true },
    { key: 'gemini.apiKey', value: config.gemini.apiKey, critical: true },
    { key: 'supabase.url', value: config.supabase.url, critical: true },
    { key: 'supabase.key', value: config.supabase.key, critical: true },
  ];

  const missing = required.filter(item => !item.value);
  const criticalMissing = missing.filter(item => item.critical);

  if (missing.length > 0) {
    console.warn(
      `⚠️  Warning: Missing environment variables: ${missing.map(m => m.key).join(', ')}`
    );
  }

  // Throw error in production if critical variables are missing
  if (config.isProduction && criticalMissing.length > 0) {
    const errorMsg = `❌ CRITICAL: Missing required environment variables in production: ${criticalMissing.map(m => m.key).join(', ')}`;
    console.error(errorMsg);
    throw new Error(errorMsg);
  }

  // Validate JWT secret strength in production
  if (config.isProduction && config.jwt.secret) {
    if (config.jwt.secret.length < 32) {
      throw new Error('JWT_SECRET must be at least 32 characters in production');
    }
  }

  // Warn about default JWT secret in development
  if (config.isDevelopment && !config.jwt.secret) {
    console.warn('⚠️  WARNING: Using default JWT secret in development. Set JWT_SECRET environment variable.');
  }
}

// Run validation
try {
  validateConfig();
} catch (error) {
  console.error('Configuration validation error:', error.message);
  if (config.isProduction) {
    process.exit(1); // Exit in production if config is invalid
  }
}

module.exports = config;
