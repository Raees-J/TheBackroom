/**
 * Utility Helper Functions
 */

/**
 * Standardize item names for consistent storage
 * @param {string} name - Raw item name
 * @returns {string} - Standardized name
 */
function standardizeItemName(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ') // Normalize whitespace
    .replace(/[^\w\s-]/g, ''); // Remove special characters
}

/**
 * Parse quantity from various formats
 * @param {string|number} input - Quantity input
 * @returns {number} - Parsed quantity
 */
function parseQuantity(input) {
  if (typeof input === 'number') return input;
  
  const cleaned = String(input).replace(/[^\d.]/g, '');
  const parsed = parseFloat(cleaned);
  
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Format number for display
 * @param {number} num - Number to format
 * @returns {string} - Formatted string
 */
function formatNumber(num) {
  if (num % 1 === 0) {
    return num.toString();
  }
  return num.toFixed(2);
}

/**
 * Validate phone number format
 * @param {string} phone - Phone number
 * @returns {boolean} - Is valid
 */
function isValidPhoneNumber(phone) {
  const cleaned = phone.replace(/[^\d+]/g, '');
  return cleaned.length >= 10 && cleaned.length <= 15;
}

/**
 * Format timestamp for display
 * @param {string|Date} timestamp - Timestamp to format
 * @returns {string} - Formatted date string
 */
function formatTimestamp(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleString('en-ZA', {
    dateStyle: 'short',
    timeStyle: 'short',
  });
}

/**
 * Truncate string to max length
 * @param {string} str - String to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} - Truncated string
 */
function truncate(str, maxLength = 100) {
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength - 3) + '...';
}

/**
 * Sleep for specified milliseconds
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise<void>}
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry a function with exponential backoff
 * @param {Function} fn - Function to retry
 * @param {number} maxRetries - Maximum retry attempts
 * @param {number} baseDelay - Base delay in ms
 * @returns {Promise<any>} - Function result
 */
async function retryWithBackoff(fn, maxRetries = 3, baseDelay = 1000) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxRetries - 1) throw error;
      
      const delay = baseDelay * Math.pow(2, attempt);
      await sleep(delay);
    }
  }
}

module.exports = {
  standardizeItemName,
  parseQuantity,
  formatNumber,
  isValidPhoneNumber,
  formatTimestamp,
  truncate,
  sleep,
  retryWithBackoff,
};
