const express = require('express');
const RouteDetectionService = require('../services/routeDetection');
const { body, param, validationResult } = require('express-validator');

const router = express.Router();
const routeService = new RouteDetectionService();

// Validation middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors: errors.array(),
      timestamp: new Date().toISOString()
    });
  }
  next();
};

// Validation rules for route detection
const validateRouteRequest = [
  body('userWallet')
    .matches(/^0x[a-fA-F0-9]{40}$/)
    .withMessage('Valid Ethereum wallet address required'),
  body('merchantQR')
    .isString()
    .notEmpty()
    .withMessage('Merchant QR data is required'),
  body('amount')
    .isNumeric()
    .isFloat({ min: 0.000001 })
    .withMessage('Valid amount greater than 0.000001 is required'),
  body('userHoldings')
    .optional()
    .isArray()
    .withMessage('User holdings must be an array'),
  handleValidationErrors
];

// Validation rules for transaction preparation
const validateTransactionRequest = [
  body('userWallet')
    .matches(/^0x[a-fA-F0-9]{40}$/)
    .withMessage('Valid user wallet address required'),
  body('merchantAddress')
    .matches(/^0x[a-fA-F0-9]{40}$/)
    .withMessage('Valid merchant address required'),
  body('amount')
    .isNumeric()
    .isFloat({ min: 0.000001 })
    .withMessage('Valid amount required'),
  body('route')
    .isObject()
    .withMessage('Route object required'),
  body('route.routeType')
    .isIn(['direct', 'bridge'])
    .withMessage('Valid route type required'),
  handleValidationErrors
];

// Validation rules for route validation
const validateRouteValidation = [
  body('route')
    .isObject()
    .withMessage('Route object required'),
  body('userWallet')
    .matches(/^0x[a-fA-F0-9]{40}$/)
    .withMessage('Valid wallet address required'),
  body('amount')
    .isNumeric()
    .isFloat({ min: 0.000001 })
    .withMessage('Valid amount required'),
  handleValidationErrors
];

// POST /api/detect-route
router.post('/detect-route', validateRouteRequest, async (req, res) => {
  try {
    const { userWallet, merchantQR, amount, userHoldings } = req.body;

    console.log(`Route detection request: ${userWallet} -> ${merchantQR} (${amount})`);

    // Get user balances if not provided
    let holdings = userHoldings;
    if (!holdings || holdings.length === 0) {
      console.log('Fetching user balances...');
      holdings = await routeService.getUserBalances(userWallet);
    }

    console.log(`Found ${holdings.length} holdings for user`);

    // Find the best route
    const routeResult = await routeService.findBestRoute(
      userWallet,
      holdings,
      merchantQR,
      amount
    );

    console.log(`Best route found: ${routeResult.recommendedPath.routeType}`);

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
router.post('/prepare-transaction', validateTransactionRequest, async (req, res) => {
  try {
    const { userWallet, merchantAddress, amount, route } = req.body;

    console.log(`Preparing transaction: ${amount} from ${userWallet} to ${merchantAddress}`);

    const transactionData = await routeService.prepareTransaction(
      route,
      userWallet,
      merchantAddress,
      amount
    );

    console.log(`Transaction prepared: ${transactionData.type}`);

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

// POST /api/validate-route
router.post('/validate-route', validateRouteValidation, async (req, res) => {
  try {
    const { route, userWallet, amount } = req.body;

    console.log(`Validating route for ${userWallet}: ${amount}`);

    const validation = await routeService.validateRoute(route, userWallet, amount);

    console.log(`Route validation result: ${validation.isValid}`);

    res.json({
      status: 'ok',
      validation,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Route validation error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Route validation failed',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/supported-chains
router.get('/supported-chains', (req, res) => {
  try {
    const chains = routeService.getSupportedChains();

    res.json({
      status: 'ok',
      chains,
      count: chains.length,
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
router.get('/user-balances/:wallet', [
  param('wallet')
    .matches(/^0x[a-fA-F0-9]{40}$/)
    .withMessage('Valid Ethereum wallet address required'),
  handleValidationErrors
], async (req, res) => {
  try {
    const { wallet } = req.params;
    
    console.log(`Fetching balances for wallet: ${wallet}`);

    const balances = await routeService.getUserBalances(wallet);

    console.log(`Found ${balances.length} balances`);

    res.json({
      status: 'ok',
      wallet,
      balances,
      count: balances.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching user balances:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to fetch user balances',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/token-addresses/:chainId
router.get('/token-addresses/:chainId', [
  param('chainId')
    .isInt({ min: 1 })
    .withMessage('Valid chain ID required'),
  handleValidationErrors
], async (req, res) => {
  try {
    const chainId = parseInt(req.params.chainId);
    
    const tokenAddresses = routeService.getTokenAddresses(chainId);

    res.json({
      status: 'ok',
      chainId,
      tokenAddresses,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching token addresses:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch token addresses',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/gas-estimate/:chainId
router.get('/gas-estimate/:chainId', [
  param('chainId')
    .isInt({ min: 1 })
    .withMessage('Valid chain ID required'),
  handleValidationErrors
], async (req, res) => {
  try {
    const chainId = parseInt(req.params.chainId);
    const { transactionType = 'native_transfer' } = req.query;
    
    // Get gas estimates for different transaction types
    const gasEstimates = {
      native_transfer: routeService.constructor.GAS_LIMITS.NATIVE_TRANSFER,
      erc20_transfer: routeService.constructor.GAS_LIMITS.ERC20_TRANSFER,
      bridge_transaction: routeService.constructor.GAS_LIMITS.BRIDGE_TRANSACTION,
      swap_transaction: routeService.constructor.GAS_LIMITS.SWAP_TRANSACTION
    };

    const gasLimit = gasEstimates[transactionType] || gasEstimates.native_transfer;
    const estimatedCostUSD = routeService.calculateGasCost(chainId, gasLimit);

    res.json({
      status: 'ok',
      chainId,
      transactionType,
      gasLimit,
      estimatedCostUSD,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error estimating gas:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to estimate gas cost',
      timestamp: new Date().toISOString()
    });
  }
});

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Route Detection API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    supportedChains: Object.keys(RouteDetectionService.SUPPORTED_CHAINS).length
  });
});

module.exports = router;