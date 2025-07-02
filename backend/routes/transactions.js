const express = require('express');
const { v4: uuidv4 } = require('uuid');
const pool = require('../config/database');
const { validateCreateTransaction, validateConfirmTransaction, validateUUID } = require('../middleware/validation');

const router = express.Router();

// Create a new transaction
router.post('/', validateCreateTransaction, async (req, res) => {
  try {
    const { user_id, merchant_id, amount_usd, amount_celo, token_symbol } = req.body;
    const id = uuidv4();
    const created_at = new Date().toISOString();

    const query = `
      INSERT INTO transactions (
        id, user_id, merchant_id, transaction_hash, amount_usd, amount_celo,
        token_symbol, status, points_awarded, location_collectible_awarded, created_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `;
    
    const values = [
      id, user_id, merchant_id, null, amount_usd, amount_celo,
      token_symbol, 'pending', 0, false, created_at
    ];
    
    const result = await pool.query(query, values);

    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: 'Transaction created successfully'
    });
  } catch (error) {
    console.error('Error creating transaction:', error);
    
    if (error.code === '23503') { // Foreign key constraint violation
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Invalid user ID or merchant ID'
      });
    }
    
    res.status(500).json({
      success: false,
      data: null,
      message: 'Failed to create transaction'
    });
  }
});

// Confirm a transaction with blockchain hash
router.post('/:id/confirm', validateUUID, validateConfirmTransaction, async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const { id } = req.params;
    const { transaction_hash } = req.body;
    
    // Update transaction
    const updateQuery = `
      UPDATE transactions 
      SET transaction_hash = $1, status = 'confirmed', updated_at = $2
      WHERE id = $3 AND status = 'pending'
      RETURNING *
    `;
    
    const updateResult = await client.query(updateQuery, [transaction_hash, new Date().toISOString(), id]);
    
    if (updateResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        success: false,
        data: null,
        message: 'Transaction not found or already confirmed'
      });
    }
    
    const transaction = updateResult.rows[0];
    
    // Award loyalty points (1 point per dollar)
    const pointsToAward = Math.floor(parseFloat(transaction.amount_usd));
    
    if (pointsToAward > 0) {
      await client.query(
        'UPDATE users SET loyalty_points = loyalty_points + $1 WHERE id = $2',
        [pointsToAward, transaction.user_id]
      );
      
      await client.query(
        'UPDATE transactions SET points_awarded = $1 WHERE id = $2',
        [pointsToAward, id]
      );
    }
    
    // Award location collectible if not already awarded
    const collectibleQuery = `
      SELECT * FROM collectibles 
      WHERE user_id = $1 AND merchant_id = $2
    `;
    
    const collectibleResult = await client.query(collectibleQuery, [transaction.user_id, transaction.merchant_id]);
    
    if (collectibleResult.rows.length === 0) {
      // Get merchant info for collectible
      const merchantQuery = 'SELECT * FROM merchants WHERE id = $1';
      const merchantResult = await client.query(merchantQuery, [transaction.merchant_id]);
      
      if (merchantResult.rows.length > 0) {
        const merchant = merchantResult.rows[0];
        
        // Create collectible
        const collectibleId = uuidv4();
        const collectibleInsertQuery = `
          INSERT INTO collectibles (
            id, user_id, merchant_id, transaction_id, name, description, earned_at
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7)
        `;
        
        await client.query(collectibleInsertQuery, [
          collectibleId,
          transaction.user_id,
          transaction.merchant_id,
          id,
          merchant.collectible_name,
          merchant.collectible_description,
          new Date().toISOString()
        ]);
        
        // Mark collectible as awarded
        await client.query(
          'UPDATE transactions SET location_collectible_awarded = true WHERE id = $1',
          [id]
        );
      }
    }
    
    await client.query('COMMIT');
    
    // Get updated transaction
    const finalQuery = 'SELECT * FROM transactions WHERE id = $1';
    const finalResult = await client.query(finalQuery, [id]);
    
    res.json({
      success: true,
      data: finalResult.rows[0],
      message: 'Transaction confirmed successfully'
    });
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error confirming transaction:', error);
    res.status(500).json({
      success: false,
      data: null,
      message: 'Failed to confirm transaction'
    });
  } finally {
    client.release();
  }
});

// Get specific transaction by ID
router.get('/:id', validateUUID, async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = `
      SELECT t.*, u.username, m.business_name as merchant_name
      FROM transactions t
      JOIN users u ON t.user_id = u.id
      JOIN merchants m ON t.merchant_id = m.id
      WHERE t.id = $1
    `;
    
    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'Transaction not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
      message: null
    });
  } catch (error) {
    console.error('Error fetching transaction:', error);
    res.status(500).json({
      success: false,
      data: null,
      message: 'Failed to fetch transaction'
    });
  }
});

module.exports = router;