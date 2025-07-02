const { body, param, query, validationResult } = require('express-validator');

// Validation error handler
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      data: null,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// User validation rules
const validateCreateUser = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('username').isLength({ min: 3, max: 50 }).trim().withMessage('Username must be 3-50 characters'),
  body('wallet_address').matches(/^0x[a-fA-F0-9]{40}$/).withMessage('Valid Ethereum wallet address is required'),
  handleValidationErrors
];

// Merchant validation rules
const validateCreateMerchant = [
  body('business_name').isLength({ min: 2, max: 100 }).trim().withMessage('Business name must be 2-100 characters'),
  body('contact_email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('wallet_address').matches(/^0x[a-fA-F0-9]{40}$/).withMessage('Valid Ethereum wallet address is required'),
  body('business_address').isLength({ min: 5, max: 200 }).trim().withMessage('Business address must be 5-200 characters'),
  body('latitude').isFloat({ min: -90, max: 90 }).withMessage('Valid latitude is required'),
  body('longitude').isFloat({ min: -180, max: 180 }).withMessage('Valid longitude is required'),
  body('collectible_name').isLength({ min: 2, max: 100 }).trim().withMessage('Collectible name must be 2-100 characters'),
  body('collectible_description').isLength({ min: 5, max: 500 }).trim().withMessage('Collectible description must be 5-500 characters'),
  handleValidationErrors
];

// Transaction validation rules
const validateCreateTransaction = [
  body('user_id').isUUID().withMessage('Valid user ID is required'),
  body('merchant_id').isUUID().withMessage('Valid merchant ID is required'),
  body('amount_usd').isDecimal({ decimal_digits: '0,2' }).withMessage('Valid USD amount is required'),
  body('amount_celo').isDecimal({ decimal_digits: '0,8' }).withMessage('Valid CELO amount is required'),
  body('token_symbol').isLength({ min: 2, max: 10 }).trim().withMessage('Valid token symbol is required'),
  handleValidationErrors
];

// QR code validation rules
const validateCreateQR = [
  body('amount_usd').isDecimal({ decimal_digits: '0,2' }).withMessage('Valid USD amount is required'),
  body('expires_in_minutes').optional().isInt({ min: 1, max: 1440 }).withMessage('Expiry must be 1-1440 minutes'),
  handleValidationErrors
];

// Transaction confirmation validation
const validateConfirmTransaction = [
  body('transaction_hash').matches(/^0x[a-fA-F0-9]{64}$/).withMessage('Valid transaction hash is required'),
  handleValidationErrors
];

// UUID parameter validation
const validateUUID = [
  param('id').isUUID().withMessage('Valid UUID is required'),
  handleValidationErrors
];

// Nearby merchants validation
const validateNearbyMerchants = [
  query('lat').isFloat({ min: -90, max: 90 }).withMessage('Valid latitude is required'),
  query('lng').isFloat({ min: -180, max: 180 }).withMessage('Valid longitude is required'),
  query('radius_km').optional().isFloat({ min: 0.1, max: 100 }).withMessage('Radius must be 0.1-100 km'),
  handleValidationErrors
];

module.exports = {
  validateCreateUser,
  validateCreateMerchant,
  validateCreateTransaction,
  validateCreateQR,
  validateConfirmTransaction,
  validateUUID,
  validateNearbyMerchants,
  handleValidationErrors
};