const request = require('supertest');
const app = require('../server');
const RouteDetectionService = require('../services/routeDetection');

describe('Route Detection API', () => {
  let routeService;

  beforeAll(() => {
    routeService = new RouteDetectionService();
  });

  describe('POST /api/detect-route', () => {
    it('should detect direct route for same chain payment', async () => {
      const response = await request(app)
        .post('/api/detect-route')
        .send({
          userWallet: '0x742d35Cc6634C0532925a3b8D4C9db7C4C4C4C4C',
          merchantQR: 'ethereum:0x8ba1f109551bD432803012645Hac136c22C275B6@137?token=USDC',
          amount: '10.0'
        });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('ok');
      expect(response.body.recommendedPath).toBeDefined();
      expect(response.body.recommendedPath.routeType).toBe('direct');
    });

    it('should detect bridge route for cross-chain payment', async () => {
      const response = await request(app)
        .post('/api/detect-route')
        .send({
          userWallet: '0x742d35Cc6634C0532925a3b8D4C9db7C4C4C4C4C',
          merchantQR: 'ethereum:0x8ba1f109551bD432803012645Hac136c22C275B6@1?token=USDC',
          amount: '25.0'
        });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('ok');
      expect(response.body.recommendedPath).toBeDefined();
    });

    it('should return insufficient balance when user lacks funds', async () => {
      const response = await request(app)
        .post('/api/detect-route')
        .send({
          userWallet: '0x742d35Cc6634C0532925a3b8D4C9db7C4C4C4C4C',
          merchantQR: 'ethereum:0x8ba1f109551bD432803012645Hac136c22C275B6@1?token=USDC',
          amount: '1000.0'
        });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('ok');
      expect(response.body.recommendedPath.routeType).toBe('insufficient');
    });

    it('should validate wallet address format', async () => {
      const response = await request(app)
        .post('/api/detect-route')
        .send({
          userWallet: 'invalid-address',
          merchantQR: 'ethereum:0x8ba1f109551bD432803012645Hac136c22C275B6',
          amount: '10.0'
        });

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
    });
  });

  describe('GET /api/supported-chains', () => {
    it('should return list of supported EVM chains', async () => {
      const response = await request(app)
        .get('/api/supported-chains');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('ok');
      expect(response.body.chains).toBeInstanceOf(Array);
      expect(response.body.chains.length).toBeGreaterThan(0);
      
      // Check that it includes major chains
      const chainIds = response.body.chains.map(chain => chain.chainId);
      expect(chainIds).toContain(1);   // Ethereum
      expect(chainIds).toContain(137); // Polygon
      expect(chainIds).toContain(42161); // Arbitrum
    });
  });

  describe('GET /api/user-balances/:wallet', () => {
    it('should return user balances across chains', async () => {
      const response = await request(app)
        .get('/api/user-balances/0x742d35Cc6634C0532925a3b8D4C9db7C4C4C4C4C');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('ok');
      expect(response.body.balances).toBeInstanceOf(Array);
      expect(response.body.wallet).toBe('0x742d35Cc6634C0532925a3b8D4C9db7C4C4C4C4C');
    });

    it('should validate wallet address format', async () => {
      const response = await request(app)
        .get('/api/user-balances/invalid-address');

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
    });
  });

  describe('POST /api/prepare-transaction', () => {
    it('should prepare native token transaction', async () => {
      const route = {
        routeType: 'direct',
        fromChainId: 1,
        fromToken: 'ETH',
        toToken: 'ETH'
      };

      const response = await request(app)
        .post('/api/prepare-transaction')
        .send({
          userWallet: '0x742d35Cc6634C0532925a3b8D4C9db7C4C4C4C4C',
          merchantAddress: '0x8ba1f109551bD432803012645Hac136c22C275B6',
          amount: '0.1',
          route
        });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('ok');
      expect(response.body.transaction).toBeDefined();
      expect(response.body.transaction.type).toBe('native_transfer');
    });
  });

  describe('GET /api/health', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/api/health');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('ok');
      expect(response.body.service).toBe('Route Detection API');
    });
  });
});

describe('RouteDetectionService', () => {
  let service;

  beforeEach(() => {
    service = new RouteDetectionService();
  });

  describe('parseQRCode', () => {
    it('should parse Ethereum URI with chain ID', () => {
      const result = service.parseQRCode('ethereum:0x742d35Cc6634C0532925a3b8D4C9db7C4C4C4C4C@137?token=USDC&amount=10');
      
      expect(result.address).toBe('0x742d35Cc6634C0532925a3b8D4C9db7C4C4C4C4C');
      expect(result.chainId).toBe(137);
      expect(result.token).toBe('USDC');
      expect(result.amount).toBe('10');
    });

    it('should parse plain Ethereum address', () => {
      const result = service.parseQRCode('0x742d35Cc6634C0532925a3b8D4C9db7C4C4C4C4C');
      
      expect(result.address).toBe('0x742d35Cc6634C0532925a3b8D4C9db7C4C4C4C4C');
      expect(result.chainId).toBe(1);
      expect(result.token).toBe('ETH');
    });

    it('should throw error for invalid format', () => {
      expect(() => {
        service.parseQRCode('invalid-qr-data');
      }).toThrow();
    });
  });

  describe('calculateDirectTransfer', () => {
    it('should calculate gas cost for native token transfer', () => {
      const result = service.calculateDirectTransfer(1, 'ETH', '1.0');
      
      expect(result.routeType).toBe('direct');
      expect(result.estimatedGasUSD).toBeGreaterThan(0);
      expect(result.estimatedTimeSec).toBe(60);
    });

    it('should calculate gas cost for ERC-20 transfer', () => {
      const result = service.calculateDirectTransfer(137, 'USDC', '100.0');
      
      expect(result.routeType).toBe('direct');
      expect(result.estimatedGasUSD).toBeGreaterThan(0);
      expect(result.estimatedTimeSec).toBe(5);
    });
  });

  describe('encodeERC20Transfer', () => {
    it('should encode ERC-20 transfer correctly', () => {
      const encoded = service.encodeERC20Transfer(
        '0x742d35Cc6634C0532925a3b8D4C9db7C4C4C4C4C',
        100
      );
      
      expect(encoded).toMatch(/^0xa9059cbb/);
      expect(encoded.length).toBe(138); // 4 + 64 + 64 + 6 hex chars
    });
  });
});