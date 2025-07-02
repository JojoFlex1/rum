# AURUM Backend API

A comprehensive Node.js backend API for the AURUM payment system, providing endpoints for users, merchants, transactions, and QR code management.

## Features

- **User Management**: Create and manage user accounts with wallet addresses
- **Merchant Management**: Register and verify merchants with location-based services
- **Transaction Processing**: Handle crypto payments with loyalty points and collectibles
- **QR Code Generation**: Create and manage payment QR codes with expiration
- **Location Services**: Find nearby merchants using geolocation
- **Security**: Rate limiting, input validation, and CORS protection

## Quick Start

### Prerequisites

- Node.js 16+ 
- PostgreSQL 12+
- npm or yarn

### Installation

1. Clone the repository and navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Set up the database:
```bash
# Create PostgreSQL database
createdb aurum_db

# Run migrations
npm run migrate
```

5. Start the development server:
```bash
npm run dev
```

The API will be available at `http://localhost:3000`

## Environment Variables

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/aurum_db

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-here

# CORS Configuration
CORS_ORIGIN=http://localhost:5173

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# QR Code Configuration
QR_CODE_EXPIRY_MINUTES=30
```

## API Endpoints

### Health Check
- `GET /health` - Basic health check
- `GET /health/detailed` - Detailed system health information

### Users
- `POST /users` - Create a new user
- `GET /users/:id` - Get user by ID
- `GET /users/:id/collectibles` - Get user's collectibles
- `GET /users/:id/transactions` - Get user's transactions

### Merchants
- `POST /merchants` - Create a new merchant
- `GET /merchants` - Get all verified merchants
- `GET /merchants/:id` - Get merchant by ID
- `GET /merchants/nearby` - Get nearby merchants

### Transactions
- `POST /transactions` - Create a new transaction
- `POST /transactions/:id/confirm` - Confirm transaction with blockchain hash
- `GET /transactions/:id` - Get transaction by ID

### QR Codes
- `POST /merchants/:id/qr` - Generate QR code for merchant payment
- `GET /qr/:id` - Get QR code data
- `GET /qr/:id/image` - Get QR code as PNG image

## Database Schema

The API uses PostgreSQL with the following main tables:

- **users**: User accounts with wallet addresses and loyalty points
- **merchants**: Business accounts with location and collectible information
- **transactions**: Payment records with status tracking
- **collectibles**: User-earned collectibles from merchant visits
- **qr_codes**: Generated payment QR codes with expiration

## Testing

Run the test suite:
```bash
npm test
```

## API Testing Examples

### Create User
```bash
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "testuser",
    "wallet_address": "0x742d35Cc6634C0532925a3b8D1c1ac74e7e3c8b0"
  }'
```

### Get Nearby Merchants
```bash
curl "http://localhost:3000/merchants/nearby?lat=-1.2921&lng=36.8219&radius_km=5"
```

### Create Transaction
```bash
curl -X POST http://localhost:3000/transactions \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "USER_UUID_HERE",
    "merchant_id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
    "amount_usd": "25.50",
    "amount_celo": "12.75",
    "token_symbol": "CELO"
  }'
```

### Generate QR Code
```bash
curl -X POST http://localhost:3000/merchants/7c9e6679-7425-40de-944b-e07fc1f90ae7/qr \
  -H "Content-Type: application/json" \
  -d '{
    "amount_usd": "10.00",
    "expires_in_minutes": 30
  }'
```

## Security Features

- **Rate Limiting**: Prevents API abuse with configurable limits
- **Input Validation**: Comprehensive validation using Joi and express-validator
- **CORS Protection**: Configurable cross-origin resource sharing
- **Helmet**: Security headers for protection against common vulnerabilities
- **SQL Injection Prevention**: Parameterized queries throughout

## Production Deployment

1. Set `NODE_ENV=production`
2. Use a production PostgreSQL database
3. Configure proper CORS origins
4. Set up SSL/TLS termination
5. Use a process manager like PM2
6. Set up monitoring and logging

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## License

MIT License - see LICENSE file for details