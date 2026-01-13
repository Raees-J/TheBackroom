/**
 * Central configuration module
 * Loads and validates all environment variables
 * 🆓 FREE STACK Configuration
 */

require('dotenv').config();

const config = {
  // Server
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',

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

  // Logging
  logLevel: process.env.LOG_LEVEL || 'info',
};

/**
 * Validate required configuration
 */
function validateConfig() {
  const required = [
    { key: 'whatsapp.phoneNumberId', value: config.whatsapp.phoneNumberId },
    { key: 'whatsapp.accessToken', value: config.whatsapp.accessToken },
    { key: 'gemini.apiKey', value: config.gemini.apiKey },
    { key: 'google.serviceAccountEmail', value: config.google.serviceAccountEmail },
    { key: 'google.privateKey', value: config.google.privateKey },
    { key: 'google.spreadsheetId', value: config.google.spreadsheetId },
  ];

  const missing = required.filter(item => !item.value);

  if (missing.length > 0) {
    console.warn(
      `⚠️  Warning: Missing environment variables: ${missing.map(m => m.key).join(', ')}`
    );
    
    // Only throw in production if critical variables are missing
    if (config.isProduction && missing.length > 0) {
      console.error('❌ Critical environment variables missing in production!');
      console.error('Missing variables:', missing.map(m => m.key).join(', '));
    }
  }
}

// Run validation but don't throw on module load (let app start and show errors in logs)
try {
  validateConfig();
} catch (error) {
  console.error('Configuration validation error:', error.message);
}

module.exports = config;
