const express = require('express');
const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');
const pool = require('../config/database');
const { validateCreateQR, validateUUID } = require('../middleware/validation');

const router = express.Router();

// Generate QR code for merchant payment
router.post('/merchants/:id/qr', validateUUID, validateCreateQR, async (req, res) => {
  try {
    const { id: merchant_id } = req.params;
    const { amount_usd, expires_in_minutes = 30 } = req.body;
    
    // Check if merchant exists
    const merchantQuery = 'SELECT * FROM merchants WHERE id = $1';
    const merchantResult = await pool.query(merchantQuery, [merchant_id]);
    
    if (merchantResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'Merchant not found'
      });
    }
    
    const qr_id = uuidv4();
    const created_at = new Date().toISOString();
    const expires_at = new Date(Date.now() + expires_in_minutes * 60 * 1000).toISOString();
    
    // Create QR data
    const qr_data = JSON.stringify({
      merchant_id,
      amount_usd,
      timestamp: created_at,
      qr_id
    });
    
    // Insert QR record
    const insertQuery = `
      INSERT INTO qr_codes (id, merchant_id, amount_usd, qr_data, expires_at, created_at)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    
    const values = [qr_id, merchant_id, amount_usd, qr_data, expires_at, created_at];
    const result = await pool.query(insertQuery, values);

    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: 'QR code generated successfully'
    });
  } catch (error) {
    console.error('Error generating QR code:', error);
    res.status(500).json({
      success: false,
      data: null,
      message: 'Failed to generate QR code'
    });
  }
});

// Get QR code data (only if not expired)
router.get('/:id', validateUUID, async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = `
      SELECT qr.*, m.business_name, m.business_address
      FROM qr_codes qr
      JOIN merchants m ON qr.merchant_id = m.id
      WHERE qr.id = $1 AND qr.expires_at > NOW()
    `;
    
    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'QR code not found or expired'
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
      message: null
    });
  } catch (error) {
    console.error('Error fetching QR code:', error);
    res.status(500).json({
      success: false,
      data: null,
      message: 'Failed to fetch QR code'
    });
  }
});

// Generate QR code image
router.get('/:id/image', validateUUID, async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = `
      SELECT qr_data FROM qr_codes 
      WHERE id = $1 AND expires_at > NOW()
    `;
    
    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'QR code not found or expired'
      });
    }

    const qrCodeImage = await QRCode.toDataURL(result.rows[0].qr_data, {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      quality: 0.92,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    // Extract base64 data
    const base64Data = qrCodeImage.replace(/^data:image\/png;base64,/, '');
    const imgBuffer = Buffer.from(base64Data, 'base64');

    res.writeHead(200, {
      'Content-Type': 'image/png',
      'Content-Length': imgBuffer.length,
      'Cache-Control': 'no-cache'
    });
    res.end(imgBuffer);
    
  } catch (error) {
    console.error('Error generating QR code image:', error);
    res.status(500).json({
      success: false,
      data: null,
      message: 'Failed to generate QR code image'
    });
  }
});

module.exports = router;