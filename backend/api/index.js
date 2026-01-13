/**
 * Vercel Serverless Function Entry Point
 */

try {
  const app = require('../src/index');
  module.exports = app;
} catch (error) {
  console.error('❌ Fatal error loading application:', error);
  console.error('Stack trace:', error.stack);
  
  // Export a minimal error handler
  module.exports = (req, res) => {
    res.status(500).json({
      error: 'Application failed to start',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  };
}
