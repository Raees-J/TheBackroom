/**
 * SMS/OTP Service
 * Handles sending verification codes via WhatsApp or SMS
 * 
 * COST COMPARISON:
 * - WhatsApp: FREE (using WhatsApp Business API)
 * - Twilio SMS: ~R0.80 per message
 * - Africa's Talking: ~R0.35 per message
 * 
 * RECOMMENDATION: Use WhatsApp for FREE OTP delivery
 */

const logger = require('../utils/logger');
const whatsappService = require('./whatsappService');

// In-memory storage for OTP codes
// TODO: Use Redis in production for scalability
const otpStore = new Map();

// Configuration
const USE_WHATSAPP = process.env.USE_WHATSAPP_OTP !== 'false'; // Default to WhatsApp
const USE_SMS = process.env.USE_SMS_OTP === 'true'; // Opt-in to SMS

/**
 * Generate a 6-digit OTP code
 */
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Send OTP via WhatsApp (FREE)
 * Uses your existing WhatsApp Business API
 */
async function sendOTPViaWhatsApp(phoneNumber, otp) {
  try {
    const message = `🔐 Your Backroom verification code is: *${otp}*\n\nThis code expires in 10 minutes.\n\nIf you didn't request this, please ignore this message.`;

    await whatsappService.sendMessage(phoneNumber, message);
    
    logger.info('OTP sent via WhatsApp', { phoneNumber });
    return { success: true, method: 'whatsapp' };
  } catch (error) {
    logger.error('Failed to send OTP via WhatsApp', {
      error: error.message,
      phoneNumber,
    });
    throw error;
  }
}

/**
 * Send OTP via SMS (Requires Twilio/Africa's Talking)
 * Only used if WhatsApp fails or is disabled
 */
async function sendOTPViaSMS(phoneNumber, otp) {
  try {
    // TODO: Integrate with SMS provider
    // Option 1: Twilio
    // const twilio = require('twilio');
    // const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    // await client.messages.create({
    //   body: `Your Backroom verification code is: ${otp}`,
    //   from: process.env.TWILIO_PHONE_NUMBER,
    //   to: phoneNumber,
    // });

    // Option 2: Africa's Talking
    // const AfricasTalking = require('africastalking');
    // const africastalking = AfricasTalking({
    //   apiKey: process.env.AFRICASTALKING_API_KEY,
    //   username: process.env.AFRICASTALKING_USERNAME,
    // });
    // await africastalking.SMS.send({
    //   to: [phoneNumber],
    //   message: `Your Backroom verification code is: ${otp}`,
    // });

    // For now, just log it (development mode)
    logger.info(`OTP for ${phoneNumber}: ${otp}`);
    console.log(`\n🔐 OTP CODE: ${otp} (for ${phoneNumber})\n`);
    console.log('⚠️  SMS provider not configured. Set up Twilio or Africa\'s Talking for production.\n');

    return { success: true, method: 'console' };
  } catch (error) {
    logger.error('Failed to send OTP via SMS', {
      error: error.message,
      phoneNumber,
    });
    throw error;
  }
}

/**
 * Send OTP code
 * Tries WhatsApp first (FREE), falls back to SMS if needed
 */
async function sendOTP(phoneNumber) {
  try {
    const otp = generateOTP();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Store OTP
    otpStore.set(phoneNumber, { otp, expiresAt, attempts: 0 });

    let result;

    // Try WhatsApp first (FREE!)
    if (USE_WHATSAPP) {
      try {
        result = await sendOTPViaWhatsApp(phoneNumber, otp);
        logger.info('OTP sent successfully via WhatsApp (FREE)', { phoneNumber });
        return result;
      } catch (whatsappError) {
        logger.warn('WhatsApp OTP failed, falling back to SMS', {
          error: whatsappError.message,
          phoneNumber,
        });
      }
    }

    // Fallback to SMS if WhatsApp fails or is disabled
    if (USE_SMS) {
      result = await sendOTPViaSMS(phoneNumber, otp);
      logger.info('OTP sent via SMS (fallback)', { phoneNumber });
      return result;
    }

    // Development mode - just log it
    logger.info(`OTP for ${phoneNumber}: ${otp} (development mode)`);
    console.log(`\n🔐 OTP CODE: ${otp} (for ${phoneNumber})\n`);
    return { success: true, method: 'console' };

  } catch (error) {
    logger.error('Failed to send OTP', { error: error.message, phoneNumber });
    throw error;
  }
}

/**
 * Verify OTP code
 * Validates the code and enforces security rules
 */
function verifyOTP(phoneNumber, code) {
  const stored = otpStore.get(phoneNumber);

  if (!stored) {
    return { valid: false, error: 'No verification code found. Please request a new one.' };
  }

  // Check expiration
  if (Date.now() > stored.expiresAt) {
    otpStore.delete(phoneNumber);
    return { valid: false, error: 'Verification code has expired. Please request a new one.' };
  }

  // Check attempt limit (prevent brute force)
  if (stored.attempts >= 3) {
    otpStore.delete(phoneNumber);
    return { valid: false, error: 'Too many failed attempts. Please request a new code.' };
  }

  // Verify code
  if (stored.otp !== code) {
    stored.attempts += 1;
    return { valid: false, error: 'Invalid verification code. Please try again.' };
  }

  // Success - remove OTP
  otpStore.delete(phoneNumber);
  logger.info('OTP verified successfully', { phoneNumber });
  return { valid: true };
}

/**
 * Clear expired OTPs (cleanup job)
 * Run this periodically to prevent memory leaks
 */
function cleanupExpiredOTPs() {
  const now = Date.now();
  let cleaned = 0;

  for (const [phoneNumber, data] of otpStore.entries()) {
    if (now > data.expiresAt) {
      otpStore.delete(phoneNumber);
      cleaned++;
    }
  }

  if (cleaned > 0) {
    logger.info(`Cleaned up ${cleaned} expired OTPs`);
  }
}

// Run cleanup every 5 minutes
setInterval(cleanupExpiredOTPs, 5 * 60 * 1000);

module.exports = {
  sendOTP,
  verifyOTP,
  cleanupExpiredOTPs,
};
