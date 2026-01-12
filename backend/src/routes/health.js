/**
 * Health Check Routes
 * Endpoints for monitoring application health
 */

const express = require('express');
const router = express.Router();

/**
 * GET /health
 * Basic health check
 */
router.get('/', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

/**
 * GET /health/ready
 * Readiness check - includes dependency checks
 */
router.get('/ready', async (req, res) => {
  const checks = {
    server: true,
    timestamp: new Date().toISOString(),
  };
  
  // Add more checks here as needed (database, external services, etc.)
  
  const isReady = Object.values(checks).every(v => v === true || typeof v === 'string');
  
  res.status(isReady ? 200 : 503).json({
    status: isReady ? 'ready' : 'not ready',
    checks,
  });
});

/**
 * GET /health/live
 * Liveness check - basic ping
 */
router.get('/live', (req, res) => {
  res.json({ status: 'alive' });
});

module.exports = router;
