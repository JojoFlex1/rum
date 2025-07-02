const express = require('express');
const { v4: uuidv4 } = require('uuid');
const pool = require('../config/database');
const { validateCreateMerchant, validateUUID, validateNearbyMerchants } = require('../middleware/validation');

const router = express.Router();

// Create a new merchant
router.post('/', validateCreateMerchant, async (req, res) => {
  try {
    const {
      business_name,
      contact_email,
      wallet_address,
      business_address,
      latitude,
      longitude,
      collectible_name,
      collectible_description
    } = req.body;
    
    const id = uuidv4();
    const created_at = new Date().toISOString();

    const query = `
      INSERT INTO merchants (
        id, business_name, contact_email, wallet_address, business_address,
        latitude, longitude, is_verified, collectible_name, collectible_description,
        collectible_claimed, created_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `;
    
    const values = [
      id, business_name, contact_email, wallet_address, business_address,
      latitude, longitude, false, collectible_name, collectible_description,
      false, created_at
    ];
    
    const result = await pool.query(query, values);

    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: 'Merchant created successfully'
    });
  } catch (error) {
    console.error('Error creating merchant:', error);
    
    if (error.code === '23505') { // Unique constraint violation
      return res.status(409).json({
        success: false,
        data: null,
        message: 'Email or wallet address already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      data: null,
      message: 'Failed to create merchant'
    });
  }
});

// Get all verified merchants
router.get('/', async (req, res) => {
  try {
    const query = 'SELECT * FROM merchants WHERE is_verified = true ORDER BY created_at DESC';
    const result = await pool.query(query);

    res.json({
      success: true,
      data: result.rows,
      message: null
    });
  } catch (error) {
    console.error('Error fetching merchants:', error);
    res.status(500).json({
      success: false,
      data: null,
      message: 'Failed to fetch merchants'
    });
  }
});

// Get specific merchant by ID
router.get('/:id', validateUUID, async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = 'SELECT * FROM merchants WHERE id = $1';
    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'Merchant not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
      message: null
    });
  } catch (error) {
    console.error('Error fetching merchant:', error);
    res.status(500).json({
      success: false,
      data: null,
      message: 'Failed to fetch merchant'
    });
  }
});

// Get merchants near a location
router.get('/nearby', validateNearbyMerchants, async (req, res) => {
  try {
    const { lat, lng, radius_km = 10 } = req.query;
    
    // Using Haversine formula to calculate distance
    const query = `
      SELECT *,
        (6371 * acos(
          cos(radians($1)) * cos(radians(latitude)) *
          cos(radians(longitude) - radians($2)) +
          sin(radians($1)) * sin(radians(latitude))
        )) AS distance_km
      FROM merchants
      WHERE is_verified = true
      HAVING distance_km <= $3
      ORDER BY distance_km
    `;
    
    const result = await pool.query(query, [lat, lng, radius_km]);

    res.json({
      success: true,
      data: result.rows,
      message: null
    });
  } catch (error) {
    console.error('Error fetching nearby merchants:', error);
    res.status(500).json({
      success: false,
      data: null,
      message: 'Failed to fetch nearby merchants'
    });
  }
});

module.exports = router;