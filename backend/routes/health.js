const express = require('express');
const router = express.Router();

// Health check endpoint
router.get('/', (req, res) => {
  res.status(200).send('Aurum backend is healthy! 🟢');
});

// Detailed health check
router.get('/detailed', async (req, res) => {
  try {
    const pool = require('../config/database');
    
    // Test database connection
    const dbResult = await pool.query('SELECT NOW()');
    
    const healthData = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      database: {
        status: 'connected',
        timestamp: dbResult.rows[0].now
      },
      memory: process.memoryUsage(),
      version: process.version
    };

    res.status(200).json({
      success: true,
      data: healthData,
      message: 'System is healthy'
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      data: null,
      message: 'System is unhealthy',
      error: error.message
    });
  }
});

module.exports = router;