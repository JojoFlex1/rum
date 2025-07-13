const axios = require('axios');

// EVM Chain configurations - Mainnet and Testnet support
const SUPPORTED_CHAINS = {
  // Mainnets
  1: { 
    name: 'Ethereum', 
    symbol: 'ETH', 
    color: '#627EEA', 
    rpc: process.env.ETHEREUM_RPC_URL || 'https://eth.llamarpc.com',
    type: 'mainnet',
    blockExplorer: 'https://etherscan.io'
  },
  137: { 
    name: 'Polygon', 
    symbol: 'MATIC', 
    color: '#8247E5', 
    rpc: process.env.POLYGON_RPC_URL || 'https://polygon.llamarpc.com',
    type: 'mainnet',
    blockExplorer: 'https://polygonscan.com'
  },
  42161: { 
    name: 'Arbitrum', 
    symbol: 'ETH', 
    color: '#28A0F0', 
    rpc: process.env.ARBITRUM_RPC_URL || 'https://arb1.arbitrum.io/rpc',
    type: 'mainnet',
    blockExplorer: 'https://arbiscan.io'
  },
  10: { 
    name: 'Optimism', 
    symbol: 'ETH', 
    color: '#FF0420', 
    rpc: process.env.OPTIMISM_RPC_URL || 'https://mainnet.optimism.io',
    type: 'mainnet',
    blockExplorer: 'https://optimistic.etherscan.io'
  },
  8453: { 
    name: 'Base', 
    symbol: 'ETH', 
    color: '#0052FF', 
    rpc: process.env.BASE_RPC_URL || 'https://mainnet.base.org',
    type: 'mainnet',
    blockExplorer: 'https://basescan.org'
  },
  
  // Testnets
  11155111: { 
    name: 'Sepolia', 
    symbol: 'ETH', 
    color: '#627EEA', 
    rpc: 'https://sepolia.infura.io/v3/' + (process.env.INFURA_API_KEY || ''),
    type: 'testnet',
    blockExplorer: 'https://sepolia.etherscan.io'
  },
  80001: { 
    name: 'Mumbai', 
    symbol: 'MATIC', 
    color: '#8247E5', 
    rpc: 'https://rpc-mumbai.maticvigil.com',
    type: 'testnet',
    blockExplorer: 'https://mumbai.polygonscan.com'
  },
  421614: { 
    name: 'Arbitrum Sepolia', 
    symbol: 'ETH', 
    color: '#28A0F0', 
    rpc: 'https://sepolia-rollup.arbitrum.io/rpc',
    type: 'testnet',
    blockExplorer: 'https://sepolia.arbiscan.io'
  },
  11155420: { 
    name: 'Optimism Sepolia', 
    symbol: 'ETH', 
    color: '#FF0420', 
    rpc: 'https://sepolia.optimism.io',
    type: 'testnet',
    blockExplorer: 'https://sepolia-optimism.etherscan.io'
  },
  84532: { 
    name: 'Base Sepolia', 
    symbol: 'ETH', 
    color: '#0052FF', 
    rpc: 'https://sepolia.base.org',
    type: 'testnet',
    blockExplorer: 'https://sepolia.basescan.org'
  }
};

// Token addresses across supported EVM chains
const TOKEN_ADDRESSES = {
  USDC: {
    1: '0xA0b86a33E6441b8435b662303c0f6a4D2F2a4029',      // Ethereum
    137: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',    // Polygon
    42161: '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8',  // Arbitrum
    10: '0x7F5c764cBc14f9669B88837ca1490cCa17c31607',     // Optimism
    8453: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',   // Base
    // Testnets
    11155111: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238', // Sepolia
    80001: '0x9999f7Fea5938fD3b1E26A12c3f2fb024e194f97',    // Mumbai
    421614: '0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d'    // Arbitrum Sepolia
  },
  USDT: {
    1: '0xdAC17F958D2ee523a2206206994597C13D831ec7',      // Ethereum
    137: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',    // Polygon
    42161: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9'   // Arbitrum
  },
  WETH: {
    1: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',      // Ethereum
    137: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619',    // Polygon
    42161: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',  // Arbitrum
    10: '0x4200000000000000000000000000000000000006',     // Optimism
    8453: '0x4200000000000000000000000000000000000006'    // Base
  }
};

// Gas price estimates (in gwei) for different chains
const GAS_PRICES = {
  1: 20,      // Ethereum - 20 gwei
  137: 30,    // Polygon - 30 gwei
  42161: 0.1, // Arbitrum - 0.1 gwei
  10: 0.001,  // Optimism - 0.001 gwei
  8453: 0.001, // Base - 0.001 gwei
  // Testnets (usually lower)
  11155111: 10,
  80001: 1,
  421614: 0.1,
  11155420: 0.001,
  84532: 0.001
};

// Gas limit estimates for different transaction types
const GAS_LIMITS = {
  NATIVE_TRANSFER: 21000,
  ERC20_TRANSFER: 65000,
  BRIDGE_TRANSACTION: 200000,
  SWAP_TRANSACTION: 150000
};

class RouteDetectionService {
  constructor() {
    this.lifiApiKey = process.env.LIFI_API_KEY;
    this.socketApiKey = process.env.SOCKET_API_KEY;
    this.oneInchApiKey = process.env.ONEINCH_API_KEY;
  }

  /**
   * Parse merchant QR code to extract payment details
   * Supports: ethereum:0x...@chainId?token=USDC&amount=100
   */
  parseQRCode(qrData) {
    try {
      // Handle Ethereum URI format
      if (qrData.startsWith('ethereum:')) {
        const match = qrData.match(/ethereum:([0x][a-fA-F0-9]{40})(@(\d+))?(\?.*)?/);
        if (!match) throw new Error('Invalid Ethereum QR format');

        const address = match[1];
        const chainId = match[3] ? parseInt(match[3]) : 1;
        
        let token = 'ETH';
        let amount = null;
        
        if (match[4]) {
          const params = new URLSearchParams(match[4].substring(1));
          token = params.get('token') || 'ETH';
          amount = params.get('value') || params.get('amount');
          
          // Convert wei to ether if value is provided
          if (params.get('value')) {
            amount = (parseInt(params.get('value')) / 1e18).toString();
          }
        }

        return {
          address,
          chainId,
          token,
          amount,
          network: 'ethereum'
        };
      }

      // Handle plain Ethereum address
      if (/^0x[a-fA-F0-9]{40}$/.test(qrData)) {
        return {
          address: qrData,
          chainId: 1, // Default to Ethereum mainnet
          token: 'ETH',
          amount: null,
          network: 'ethereum'
        };
      }

      throw new Error('Unsupported QR format - only Ethereum addresses supported');
    } catch (error) {
      throw new Error(`QR parsing failed: ${error.message}`);
    }
  }

  /**
   * Get user's token balances across all EVM chains
   */
  async getUserBalances(userWallet) {
    try {
      // Validate wallet address
      if (!/^0x[a-fA-F0-9]{40}$/.test(userWallet)) {
        throw new Error('Invalid Ethereum wallet address');
      }

      const balances = [];
      
      // For demo/development, return mock balances
      // In production, you'd query actual blockchain data using:
      // - Alchemy/Infura APIs
      // - Moralis API
      // - Direct RPC calls
      // - Covalent API
      
      const mockBalances = [
        { 
          token: 'USDC', 
          chain: 'Polygon', 
          chainId: 137, 
          balance: '110.52', 
          address: TOKEN_ADDRESSES.USDC[137] 
        },
        { 
          token: 'ETH', 
          chain: 'Ethereum', 
          chainId: 1, 
          balance: '0.12', 
          address: '0x0000000000000000000000000000000000000000' 
        },
        { 
          token: 'USDC', 
          chain: 'Arbitrum', 
          chainId: 42161, 
          balance: '25.00', 
          address: TOKEN_ADDRESSES.USDC[42161] 
        },
        { 
          token: 'MATIC', 
          chain: 'Polygon', 
          chainId: 137, 
          balance: '50.0', 
          address: '0x0000000000000000000000000000000000000000' 
        },
        { 
          token: 'ETH', 
          chain: 'Base', 
          chainId: 8453, 
          balance: '0.05', 
          address: '0x0000000000000000000000000000000000000000' 
        }
      ];

      // Filter out zero balances and add wallet address
      return mockBalances
        .filter(balance => parseFloat(balance.balance) > 0)
        .map(balance => ({
          ...balance,
          wallet: userWallet
        }));

    } catch (error) {
      console.error('Error fetching user balances:', error);
      throw new Error(`Failed to fetch balances: ${error.message}`);
    }
  }

  /**
   * Calculate gas cost in USD for a transaction
   */
  calculateGasCost(chainId, gasLimit, tokenSymbol = 'ETH') {
    const gasPrice = GAS_PRICES[chainId] || 20;
    const gasCostInGwei = gasLimit * gasPrice;
    const gasCostInEth = gasCostInGwei / 1e9;
    
    // Rough token price estimates (in production, use real price feeds)
    const tokenPrices = {
      ETH: 2000,
      MATIC: 0.8,
      USDC: 1,
      USDT: 1
    };
    
    const nativeTokenSymbol = SUPPORTED_CHAINS[chainId]?.symbol || 'ETH';
    const tokenPrice = tokenPrices[nativeTokenSymbol] || 2000;
    
    return Math.max(0.01, gasCostInEth * tokenPrice);
  }

  /**
   * Calculate direct transfer (same chain, same token)
   */
  calculateDirectTransfer(fromChain, token, amount) {
    const isNativeToken = (token === 'ETH' && [1, 42161, 10, 8453, 11155111, 421614, 11155420, 84532].includes(fromChain)) || 
                         (token === 'MATIC' && [137, 80001].includes(fromChain));
    
    const gasLimit = isNativeToken ? GAS_LIMITS.NATIVE_TRANSFER : GAS_LIMITS.ERC20_TRANSFER;
    const gasCostUSD = this.calculateGasCost(fromChain, gasLimit);
    
    // Estimate confirmation time based on chain
    const confirmationTimes = {
      1: 60,      // Ethereum - 1 minute
      137: 5,     // Polygon - 5 seconds
      42161: 15,  // Arbitrum - 15 seconds
      10: 15,     // Optimism - 15 seconds
      8453: 15    // Base - 15 seconds
    };

    return {
      routeType: 'direct',
      estimatedGasUSD: gasCostUSD,
      estimatedTimeSec: confirmationTimes[fromChain] || 30,
      gasLimit,
      steps: [{
        type: 'transfer',
        fromChain,
        toChain: fromChain,
        fromToken: token,
        toToken: token,
        protocol: 'native'
      }]
    };
  }

  /**
   * Calculate cross-chain bridge route
   */
  calculateBridgeRoute(fromChain, toChain, fromToken, toToken, amount) {
    // Estimate bridge costs and times
    const bridgeCosts = {
      // From Ethereum
      1: { 137: 15, 42161: 8, 10: 10, 8453: 12 },
      // From Polygon
      137: { 1: 25, 42161: 5, 10: 8, 8453: 6 },
      // From Arbitrum
      42161: { 1: 12, 137: 6, 10: 4, 8453: 5 },
      // From Optimism
      10: { 1: 15, 137: 8, 42161: 5, 8453: 3 },
      // From Base
      8453: { 1: 18, 137: 7, 42161: 6, 10: 4 }
    };

    const bridgeTimes = {
      // To/from Ethereum (longer due to finality)
      1: { 137: 600, 42161: 900, 10: 1200, 8453: 900 },
      137: { 1: 1800, 42161: 300, 10: 600, 8453: 450 },
      42161: { 1: 1200, 137: 300, 10: 180, 8453: 240 },
      10: { 1: 1800, 137: 600, 42161: 180, 8453: 120 },
      8453: { 1: 1200, 137: 450, 42161: 240, 10: 120 }
    };

    const estimatedCost = bridgeCosts[fromChain]?.[toChain] || 20;
    const estimatedTime = bridgeTimes[fromChain]?.[toChain] || 600;

    return {
      routeType: 'bridge',
      estimatedGasUSD: estimatedCost,
      estimatedTimeSec: estimatedTime,
      gasLimit: GAS_LIMITS.BRIDGE_TRANSACTION,
      steps: [
        {
          type: 'bridge',
          fromChain,
          toChain,
          fromToken,
          toToken,
          protocol: 'layerzero' // or 'stargate', 'hop', etc.
        }
      ]
    };
  }

  /**
   * Find the best route for the payment
   */
  async findBestRoute(userWallet, userHoldings, merchantQR, requestedAmount) {
    try {
      // Parse merchant QR
      const merchantInfo = this.parseQRCode(merchantQR);
      const targetChain = merchantInfo.chainId;
      const targetToken = merchantInfo.token;
      const merchantAddress = merchantInfo.address;

      // Validate target chain is supported
      if (!SUPPORTED_CHAINS[targetChain]) {
        throw new Error(`Unsupported target chain: ${targetChain}`);
      }

      const requiredAmount = parseFloat(requestedAmount);
      if (isNaN(requiredAmount) || requiredAmount <= 0) {
        throw new Error('Invalid payment amount');
      }

      let bestRoute = null;
      let lowestCost = Infinity;
      let routes = [];

      // Check for direct transfers first (same chain, same token)
      for (const holding of userHoldings) {
        if (holding.chainId === targetChain && holding.token === targetToken) {
          const balance = parseFloat(holding.balance);
          
          if (balance >= requiredAmount) {
            const directRoute = this.calculateDirectTransfer(targetChain, targetToken, requestedAmount);
            
            const route = {
              ...directRoute,
              fromToken: targetToken,
              fromChain: SUPPORTED_CHAINS[targetChain]?.name || 'Unknown',
              fromChainId: targetChain,
              toToken: targetToken,
              toChain: SUPPORTED_CHAINS[targetChain]?.name || 'Unknown',
              toChainId: targetChain,
              color: SUPPORTED_CHAINS[targetChain]?.color || '#71727A',
              fromTokenAddress: holding.address,
              toTokenAddress: holding.address,
              availableBalance: balance,
              requiredAmount
            };

            routes.push(route);
            
            if (directRoute.estimatedGasUSD < lowestCost) {
              bestRoute = route;
              lowestCost = directRoute.estimatedGasUSD;
            }
          }
        }
      }

      // If no direct route found, check cross-chain options
      if (!bestRoute) {
        for (const holding of userHoldings) {
          const balance = parseFloat(holding.balance);
          
          if (balance >= requiredAmount) {
            // Check if we can bridge this token to target chain
            const fromTokenAddress = holding.address || TOKEN_ADDRESSES[holding.token]?.[holding.chainId];
            const toTokenAddress = TOKEN_ADDRESSES[targetToken]?.[targetChain];
            
            if (fromTokenAddress && toTokenAddress && holding.token === targetToken) {
              const bridgeRoute = this.calculateBridgeRoute(
                holding.chainId, 
                targetChain, 
                holding.token, 
                targetToken, 
                requestedAmount
              );

              const route = {
                ...bridgeRoute,
                fromToken: holding.token,
                fromChain: SUPPORTED_CHAINS[holding.chainId]?.name || 'Unknown',
                fromChainId: holding.chainId,
                toToken: targetToken,
                toChain: SUPPORTED_CHAINS[targetChain]?.name || 'Unknown',
                toChainId: targetChain,
                color: SUPPORTED_CHAINS[holding.chainId]?.color || '#71727A',
                fromTokenAddress,
                toTokenAddress,
                availableBalance: balance,
                requiredAmount
              };

              routes.push(route);

              if (bridgeRoute.estimatedGasUSD < lowestCost) {
                bestRoute = route;
                lowestCost = bridgeRoute.estimatedGasUSD;
              }
            }
          }
        }
      }

      // Fallback: suggest user needs to acquire the token
      if (!bestRoute) {
        bestRoute = {
          routeType: 'insufficient',
          fromToken: 'N/A',
          fromChain: 'N/A',
          fromChainId: null,
          toToken: targetToken,
          toChain: SUPPORTED_CHAINS[targetChain]?.name || 'Unknown',
          toChainId: targetChain,
          estimatedGasUSD: 0,
          estimatedTimeSec: 0,
          color: '#FF6B6B',
          error: `Insufficient ${targetToken} balance across all chains. Required: ${requiredAmount} ${targetToken}`,
          requiredAmount,
          availableBalance: 0
        };
      }

      return {
        recommendedPath: bestRoute,
        merchantAddress,
        merchantInfo: {
          address: merchantAddress,
          chainId: targetChain,
          token: targetToken,
          amount: merchantInfo.amount,
          network: SUPPORTED_CHAINS[targetChain]?.name || 'Unknown'
        },
        alternatives: routes.filter(route => route !== bestRoute).slice(0, 3) // Top 3 alternatives
      };

    } catch (error) {
      console.error('Route detection error:', error);
      throw new Error(`Route detection failed: ${error.message}`);
    }
  }

  /**
   * Validate a route before execution
   */
  async validateRoute(route, userWallet, amount) {
    try {
      if (!route || !userWallet || !amount) {
        throw new Error('Missing required parameters for route validation');
      }

      // Check if route is still valid
      if (route.routeType === 'insufficient') {
        return {
          isValid: false,
          error: route.error || 'Insufficient balance'
        };
      }

      // Validate wallet address
      if (!/^0x[a-fA-F0-9]{40}$/.test(userWallet)) {
        return {
          isValid: false,
          error: 'Invalid wallet address'
        };
      }

      // Validate amount
      const numAmount = parseFloat(amount);
      if (isNaN(numAmount) || numAmount <= 0) {
        return {
          isValid: false,
          error: 'Invalid amount'
        };
      }

      // Check if user still has sufficient balance (re-check)
      const currentBalances = await this.getUserBalances(userWallet);
      const relevantBalance = currentBalances.find(
        b => b.chainId === route.fromChainId && b.token === route.fromToken
      );

      if (!relevantBalance || parseFloat(relevantBalance.balance) < numAmount) {
        return {
          isValid: false,
          error: 'Insufficient balance - balance may have changed'
        };
      }

      // Validate gas requirements
      const estimatedGas = route.estimatedGasUSD || 0;
      if (estimatedGas > 100) { // Sanity check - gas shouldn't be more than $100
        return {
          isValid: false,
          error: 'Gas cost too high - please try a different route'
        };
      }

      return {
        isValid: true,
        estimatedGas,
        availableBalance: parseFloat(relevantBalance.balance),
        requiredAmount: numAmount
      };

    } catch (error) {
      console.error('Route validation error:', error);
      return {
        isValid: false,
        error: `Validation failed: ${error.message}`
      };
    }
  }

  /**
   * Prepare transaction data for execution
   */
  async prepareTransaction(route, userWallet, merchantAddress, amount) {
    try {
      if (route.routeType === 'insufficient') {
        throw new Error('Cannot prepare transaction for insufficient balance route');
      }

      const numAmount = parseFloat(amount);
      if (isNaN(numAmount) || numAmount <= 0) {
        throw new Error('Invalid transaction amount');
      }

      if (route.routeType === 'direct') {
        // Simple transfer transaction
        const isNativeToken = route.fromToken === 'ETH' || route.fromToken === 'MATIC';
        
        if (isNativeToken) {
          // Native token transfer
          return {
            to: merchantAddress,
            value: (numAmount * 1e18).toString(),
            data: '0x',
            gasLimit: GAS_LIMITS.NATIVE_TRANSFER.toString(),
            chainId: route.fromChainId,
            type: 'native_transfer'
          };
        } else {
          // ERC-20 transfer
          const transferData = this.encodeERC20Transfer(merchantAddress, numAmount);
          return {
            to: route.fromTokenAddress,
            value: '0',
            data: transferData,
            gasLimit: GAS_LIMITS.ERC20_TRANSFER.toString(),
            chainId: route.fromChainId,
            type: 'erc20_transfer'
          };
        }
      } else if (route.routeType === 'bridge') {
        // Cross-chain transaction - would require bridge contract interaction
        // This is complex and depends on the specific bridge protocol
        throw new Error('Cross-chain transactions require bridge integration - not yet implemented');
      }
      
      throw new Error(`Unsupported route type: ${route.routeType}`);
    } catch (error) {
      console.error('Transaction preparation error:', error);
      throw new Error(`Transaction preparation failed: ${error.message}`);
    }
  }

  /**
   * Encode ERC-20 transfer function call
   * transfer(address to, uint256 amount)
   */
  encodeERC20Transfer(to, amount) {
    // transfer(address,uint256) function signature: 0xa9059cbb
    const functionSignature = '0xa9059cbb';
    
    // Remove 0x prefix and pad to 32 bytes (64 hex chars)
    const paddedAddress = to.slice(2).padStart(64, '0');
    
    // Convert amount to wei and pad to 32 bytes
    const amountWei = Math.floor(amount * 1e18);
    const paddedAmount = amountWei.toString(16).padStart(64, '0');
    
    return functionSignature + paddedAddress + paddedAmount;
  }

  /**
   * Get supported chains information
   */
  getSupportedChains() {
    return Object.entries(SUPPORTED_CHAINS).map(([chainId, info]) => ({
      chainId: parseInt(chainId),
      ...info
    }));
  }

  /**
   * Get token addresses for a specific chain
   */
  getTokenAddresses(chainId) {
    const addresses = {};
    Object.entries(TOKEN_ADDRESSES).forEach(([token, chains]) => {
      if (chains[chainId]) {
        addresses[token] = chains[chainId];
      }
    });
    return addresses;
  }
}

// Export the class and constants for use in other modules
RouteDetectionService.SUPPORTED_CHAINS = SUPPORTED_CHAINS;
RouteDetectionService.TOKEN_ADDRESSES = TOKEN_ADDRESSES;
RouteDetectionService.GAS_LIMITS = GAS_LIMITS;

module.exports = RouteDetectionService;