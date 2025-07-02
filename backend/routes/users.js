const express = require('express');
const { v4: uuidv4 } = require('uuid');
const pool = require('../config/database');
const { validateCreateUser, validateUUID } = require('../middleware/validation');

const router = express.Router();

// Create a new user
router.post('/', validateCreateUser, async (req, res) => {
  try {
    const { email, username, wallet_address } = req.body;
    const id = uuidv4();
    const created_at = new Date().toISOString();

    const query = `
      INSERT INTO users (id, email, username, wallet_address, loyalty_points, created_at)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    
    const values = [id, email, username, wallet_address, 0, created_at];
    const result = await pool.query(query, values);

    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: 'User created successfully'
    });
  } catch (error) {
    console.error('Error creating user:', error);
    
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
      message: 'Failed to create user'
    });
  }
});

// Get user by ID
router.get('/:id', validateUUID, async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = 'SELECT * FROM users WHERE id = $1';
    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
      message: null
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({
      success: false,
      data: null,
      message: 'Failed to fetch user'
    });
  }
});

// Get all collectibles earned by a user
router.get('/:id/collectibles', validateUUID, async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = `
      SELECT c.*, m.business_name as merchant_name
      FROM collectibles c
      JOIN merchants m ON c.merchant_id = m.id
      WHERE c.user_id = $1
      ORDER BY c.earned_at DESC
    `;
    
    const result = await pool.query(query, [id]);

    res.json({
      success: true,
      data: result.rows,
      message: null
    });
  } catch (error) {
    console.error('Error fetching user collectibles:', error);
    res.status(500).json({
      success: false,
      data: null,
      message: 'Failed to fetch collectibles'
    });
  }
});

// Get all transactions for a user
router.get('/:id/transactions', validateUUID, async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 10, offset = 0 } = req.query;
    
    const query = `
      SELECT t.*, m.business_name as merchant_name
      FROM transactions t
      JOIN merchants m ON t.merchant_id = m.id
      WHERE t.user_id = $1
      ORDER BY t.created_at DESC
      LIMIT $2 OFFSET $3
    `;
    
    const result = await pool.query(query, [id, limit, offset]);

    res.json({
      success: true,
      data: result.rows,
      message: null
    });
  } catch (error) {
    console.error('Error fetching user transactions:', error);
    res.status(500).json({
      success: false,
      data: null,
      message: 'Failed to fetch transactions'
    });
  }
});

module.exports = router;