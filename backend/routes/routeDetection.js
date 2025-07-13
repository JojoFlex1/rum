const express = require('express');
const RouteDetectionService = require('../services/routeDetection');
const { body, validationResult } = require('express-validator');

const router = express.Router();
const routeService = new RouteDetectionService();

// Validation middleware
const validateRouteRequest = [
  body('userWallet').matches(/^0x[a-fA-F0-9]{40}$/).withMessage('Valid Ethereum wallet address required'),
  body('merchantQR').isString().notEmpty().withMessage('Merchant QR data is required'),
  body('amount').isNumeric().withMessage('Valid amount is required'),
  body('userHoldings').optional().isArray().withMessage('User holdings must be an array'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    next();
  }
];

// POST /api/detect-route
router.post('/detect-route', validateRouteRequest, async (req, res) => {
  try {
    const { userWallet, merchantQR, amount, userHoldings } = req.body;

    // Get user balances if not provided
    let holdings = userHoldings;
    if (!holdings || holdings.length === 0) {
      holdings = await routeService.getUserBalances(userWallet);
    }

    // Find the best route
    const routeResult = await routeService.findBestRoute(
      userWallet,
      holdings,
      merchantQR,
      amount
    );

    res.json({
      status: 'ok',
      ...routeResult,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Route detection error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Route detection failed',
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/prepare-transaction
router.post('/prepare-transaction', [
  body('userWallet').matches(/^0x[a-fA-F0-9]{40}$/).withMessage('Valid user wallet required'),
  body('merchantAddress').matches(/^0x[a-fA-F0-9]{40}$/).withMessage('Valid merchant address required'),
  body('amount').isNumeric().withMessage('Valid amount required'),
  body('route').isObject().withMessage('Route object required'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    next();
  }
], async (req, res) => {
  try {
    const { userWallet, merchantAddress, amount, route } = req.body;

    const transactionData = await routeService.prepareTransaction(
      route,
      userWallet,
      merchantAddress,
      amount
    );

    res.json({
      status: 'ok',
      transaction: transactionData,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Transaction preparation error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Transaction preparation failed',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/supported-chains
router.get('/supported-chains', (req, res) => {
  try {
    const chains = Object.entries(routeService.constructor.SUPPORTED_CHAINS || {}).map(([id, info]) => ({
      chainId: parseInt(id),
      ...info
    }));

    res.json({
      status: 'ok',
      chains,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching supported chains:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch supported chains',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/user-balances/:wallet
router.get('/user-balances/:wallet', async (req, res) => {
  try {
    const { wallet } = req.params;
    
    if (!/^0x[a-fA-F0-9]{40}$/.test(wallet)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid wallet address format'
      });
    }

    const balances = await routeService.getUserBalances(wallet);

    res.json({
      status: 'ok',
      wallet,
      balances,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching user balances:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch user balances',
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;