const pool = require('../config/database');

const createTables = async () => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Create users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        username VARCHAR(50) UNIQUE NOT NULL,
        wallet_address VARCHAR(42) UNIQUE NOT NULL,
        loyalty_points INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);
    
    // Create merchants table
    await client.query(`
      CREATE TABLE IF NOT EXISTS merchants (
        id UUID PRIMARY KEY,
        business_name VARCHAR(100) NOT NULL,
        contact_email VARCHAR(255) UNIQUE NOT NULL,
        wallet_address VARCHAR(42) UNIQUE NOT NULL,
        business_address VARCHAR(200) NOT NULL,
        latitude DECIMAL(10, 8) NOT NULL,
        longitude DECIMAL(11, 8) NOT NULL,
        is_verified BOOLEAN DEFAULT FALSE,
        collectible_name VARCHAR(100) NOT NULL,
        collectible_description TEXT NOT NULL,
        collectible_claimed BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);
    
    // Create transactions table
    await client.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id UUID PRIMARY KEY,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        merchant_id UUID REFERENCES merchants(id) ON DELETE CASCADE,
        transaction_hash VARCHAR(66),
        amount_usd DECIMAL(10, 2) NOT NULL,
        amount_celo DECIMAL(20, 8) NOT NULL,
        token_symbol VARCHAR(10) NOT NULL,
        status VARCHAR(20) DEFAULT 'pending',
        points_awarded INTEGER DEFAULT 0,
        location_collectible_awarded BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);
    
    // Create collectibles table
    await client.query(`
      CREATE TABLE IF NOT EXISTS collectibles (
        id UUID PRIMARY KEY,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        merchant_id UUID REFERENCES merchants(id) ON DELETE CASCADE,
        transaction_id UUID REFERENCES transactions(id) ON DELETE CASCADE,
        name VARCHAR(100) NOT NULL,
        description TEXT NOT NULL,
        earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);
    
    // Create qr_codes table
    await client.query(`
      CREATE TABLE IF NOT EXISTS qr_codes (
        id UUID PRIMARY KEY,
        merchant_id UUID REFERENCES merchants(id) ON DELETE CASCADE,
        amount_usd DECIMAL(10, 2) NOT NULL,
        qr_data TEXT NOT NULL,
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);
    
    // Create indexes for better performance
    await client.query('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_users_wallet ON users(wallet_address)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_merchants_verified ON merchants(is_verified)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_merchants_location ON merchants(latitude, longitude)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions(user_id)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_transactions_merchant ON transactions(merchant_id)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_collectibles_user ON collectibles(user_id)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_qr_codes_expires ON qr_codes(expires_at)');
    
    await client.query('COMMIT');
    console.log('✅ Database tables created successfully');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error creating tables:', error);
    throw error;
  } finally {
    client.release();
  }
};

const seedData = async () => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Insert sample merchants
    const merchants = [
      {
        id: '7c9e6679-7425-40de-944b-e07fc1f90ae7',
        business_name: "Joe's Coffee Shop",
        contact_email: 'joe@coffeeshop.com',
        wallet_address: '0x8ba1f109551bD432803012645Hac136c22C275B6',
        business_address: '123 Main St, Nairobi',
        latitude: -1.2921,
        longitude: 36.8219,
        is_verified: true,
        collectible_name: 'Coffee Master',
        collectible_description: 'For loyal coffee customers'
      },
      {
        id: '8d9e6679-7425-40de-944b-e07fc1f90ae8',
        business_name: "Maria's Bakery",
        contact_email: 'maria@bakery.com',
        wallet_address: '0x9ba1f109551bD432803012645Hac136c22C275B7',
        business_address: '456 Oak Ave, Nairobi',
        latitude: -1.2851,
        longitude: 36.8289,
        is_verified: true,
        collectible_name: 'Bread Lover',
        collectible_description: 'For frequent bakery visitors'
      }
    ];
    
    for (const merchant of merchants) {
      await client.query(`
        INSERT INTO merchants (
          id, business_name, contact_email, wallet_address, business_address,
          latitude, longitude, is_verified, collectible_name, collectible_description
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        ON CONFLICT (id) DO NOTHING
      `, [
        merchant.id, merchant.business_name, merchant.contact_email,
        merchant.wallet_address, merchant.business_address, merchant.latitude,
        merchant.longitude, merchant.is_verified, merchant.collectible_name,
        merchant.collectible_description
      ]);
    }
    
    await client.query('COMMIT');
    console.log('✅ Sample data seeded successfully');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error seeding data:', error);
    throw error;
  } finally {
    client.release();
  }
};

const main = async () => {
  try {
    console.log('🚀 Starting database migration...');
    await createTables();
    await seedData();
    console.log('✅ Migration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
};

if (require.main === module) {
  main();
}

module.exports = { createTables, seedData };