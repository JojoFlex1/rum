const axios = require('axios');

// Chain configurations for EVM testnets
const SUPPORTED_CHAINS = {
  1: { name: 'Ethereum', symbol: 'ETH', color: '#627EEA', rpc: 'https://eth.llamarpc.com' },
  137: { name: 'Polygon', symbol: 'MATIC', color: '#8247E5', rpc: 'https://polygon.llamarpc.com' },
  42161: { name: 'Arbitrum', symbol: 'ETH', color: '#28A0F0', rpc: 'https://arb1.arbitrum.io/rpc' },
  10: { name: 'Optimism', symbol: 'ETH', color: '#FF0420', rpc: 'https://mainnet.optimism.io' },
  8453: { name: 'Base', symbol: 'ETH', color: '#0052FF', rpc: 'https://mainnet.base.org' },
  // Testnets
  11155111: { name: 'Sepolia', symbol: 'ETH', color: '#627EEA', rpc: 'https://sepolia.infura.io/v3/' },
  80001: { name: 'Mumbai', symbol: 'MATIC', color: '#8247E5', rpc: 'https://rpc-mumbai.maticvigil.com' },
  421614: { name: 'Arbitrum Sepolia', symbol: 'ETH', color: '#28A0F0', rpc: 'https://sepolia-rollup.arbitrum.io/rpc' }
};

// Common token addresses across chains
const TOKEN_ADDRESSES = {
  USDC: {
    1: '0xA0b86a33E6441b8435b662303c0f6a4D2F2a4029',
    137: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
    42161: '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8',
    10: '0x7F5c764cBc14f9669B88837ca1490cCa17c31607',
    8453: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'
  },
  USDT: {
    1: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    137: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
    42161: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9'
  }
};

class RouteDetectionService {
  constructor() {
    this.lifiApiKey = process.env.LIFI_API_KEY;
    this.socketApiKey = process.env.SOCKET_API_KEY;
  }

  /**
   * Parse merchant QR code to extract payment details
   */
  parseQRCode(qrData) {
    try {
      // Handle different QR formats
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
        }

        return {
          address,
          chainId,
          token,
          amount,
          network: 'ethereum'
        };
      }

      // Handle plain address
      if (/^0x[a-fA-F0-9]{40}$/.test(qrData)) {
        return {
          address: qrData,
          chainId: 1, // Default to Ethereum mainnet
          token: 'ETH',
          amount: null,
          network: 'ethereum'
        };
      }

      throw new Error('Unsupported QR format');
    } catch (error) {
      throw new Error(`QR parsing failed: ${error.message}`);
    }
  }

  /**
   * Get user's token balances across chains
   */
  async getUserBalances(userWallet) {
    const balances = [];
    
    try {
      // For demo purposes, return mock balances
      // In production, you'd query actual blockchain data
      const mockBalances = [
        { token: 'USDC', chain: 'Polygon', chainId: 137, balance: '110.52', address: TOKEN_ADDRESSES.USDC[137] },
        { token: 'ETH', chain: 'Ethereum', chainId: 1, balance: '0.12', address: '0x0000000000000000000000000000000000000000' },
        { token: 'USDC', chain: 'Arbitrum', chainId: 42161, balance: '25.00', address: TOKEN_ADDRESSES.USDC[42161] },
        { token: 'MATIC', chain: 'Polygon', chainId: 137, balance: '50.0', address: '0x0000000000000000000000000000000000000000' }
      ];

      return mockBalances.filter(balance => parseFloat(balance.balance) > 0);
    } catch (error) {
      console.error('Error fetching user balances:', error);
      return [];
    }
  }

  /**
   * Get route quotes from LI.FI
   */
  async getLiFiRoute(fromChain, toChain, fromToken, toToken, amount, userWallet, merchantWallet) {
    try {
      const response = await axios.get('https://li.quest/v1/quote', {
        params: {
          fromChain,
          toChain,
          fromToken,
          toToken,
          fromAmount: amount,
          fromAddress: userWallet,
          toAddress: merchantWallet,
          integrator: 'aurum-payments'
        },
        headers: {
          'x-lifi-api-key': this.lifiApiKey
        }
      });

      return response.data;
    } catch (error) {
      console.error('LI.FI API error:', error.response?.data || error.message);
      return null;
    }
  }

  /**
   * Get route quotes from Socket
   */
  async getSocketRoute(fromChain, toChain, fromToken, toToken, amount, userWallet, merchantWallet) {
    try {
      const response = await axios.get('https://api.socket.tech/v2/quote', {
        params: {
          fromChainId: fromChain,
          toChainId: toChain,
          fromTokenAddress: fromToken,
          toTokenAddress: toToken,
          fromAmount: amount,
          userAddress: userWallet,
          recipient: merchantWallet,
          uniqueRoutesPerBridge: true,
          sort: 'output',
          singleTxOnly: true
        },
        headers: {
          'API-KEY': this.socketApiKey,
          'Accept': 'application/json'
        }
      });

      return response.data;
    } catch (error) {
      console.error('Socket API error:', error.response?.data || error.message);
      return null;
    }
  }

  /**
   * Calculate direct transfer cost (same chain)
   */
  calculateDirectTransfer(fromChain, token, amount) {
    const gasEstimates = {
      1: { ETH: 21000, ERC20: 65000 }, // Ethereum
      137: { MATIC: 21000, ERC20: 65000 }, // Polygon
      42161: { ETH: 21000, ERC20: 65000 }, // Arbitrum
      10: { ETH: 21000, ERC20: 65000 }, // Optimism
      8453: { ETH: 21000, ERC20: 65000 } // Base
    };

    const gasPrices = {
      1: 20, // 20 gwei
      137: 30, // 30 gwei
      42161: 0.1, // 0.1 gwei
      10: 0.001, // 0.001 gwei
      8453: 0.001 // 0.001 gwei
    };

    const isNativeToken = (token === 'ETH' && [1, 42161, 10, 8453].includes(fromChain)) || 
                         (token === 'MATIC' && fromChain === 137);
    
    const gasLimit = isNativeToken ? gasEstimates[fromChain]?.ETH || 21000 : gasEstimates[fromChain]?.ERC20 || 65000;
    const gasPrice = gasPrices[fromChain] || 20;
    
    // Calculate gas cost in USD (rough estimate)
    const gasCostETH = (gasLimit * gasPrice) / 1e9;
    const ethPriceUSD = 2000; // Rough ETH price
    const gasCostUSD = gasCostETH * ethPriceUSD;

    return {
      routeType: 'direct',
      estimatedGasUSD: Math.max(0.01, gasCostUSD),
      estimatedTimeSec: fromChain === 137 ? 5 : fromChain === 1 ? 60 : 15,
      steps: [{
        type: 'transfer',
        fromChain,
        toChain: fromChain,
        fromToken: token,
        toToken: token
      }]
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

      // Convert amount to wei/smallest unit
      const amount = (parseFloat(requestedAmount) * 1e18).toString();

      let bestRoute = null;
      let lowestCost = Infinity;

      // Check for direct transfers first (same chain, same token)
      for (const holding of userHoldings) {
        if (holding.chainId === targetChain && holding.token === targetToken) {
          const balance = parseFloat(holding.balance);
          const required = parseFloat(requestedAmount);
          
          if (balance >= required) {
            const directRoute = this.calculateDirectTransfer(targetChain, targetToken, amount);
            
            if (directRoute.estimatedGasUSD < lowestCost) {
              bestRoute = {
                ...directRoute,
                fromToken: targetToken,
                fromChain: SUPPORTED_CHAINS[targetChain]?.name || 'Unknown',
                fromChainId: targetChain,
                toToken: targetToken,
                toChain: SUPPORTED_CHAINS[targetChain]?.name || 'Unknown',
                toChainId: targetChain,
                color: SUPPORTED_CHAINS[targetChain]?.color || '#71727A',
                fromTokenAddress: holding.address,
                toTokenAddress: holding.address
              };
              lowestCost = directRoute.estimatedGasUSD;
            }
          }
        }
      }

      // If no direct route found, check cross-chain options
      if (!bestRoute) {
        for (const holding of userHoldings) {
          const balance = parseFloat(holding.balance);
          const required = parseFloat(requestedAmount);
          
          if (balance >= required) {
            // Try to get cross-chain quote
            const fromTokenAddress = holding.address || TOKEN_ADDRESSES[holding.token]?.[holding.chainId];
            const toTokenAddress = TOKEN_ADDRESSES[targetToken]?.[targetChain];
            
            if (fromTokenAddress && toTokenAddress) {
              // For demo, simulate cross-chain route
              const crossChainRoute = {
                routeType: 'bridge',
                fromToken: holding.token,
                fromChain: SUPPORTED_CHAINS[holding.chainId]?.name || 'Unknown',
                fromChainId: holding.chainId,
                toToken: targetToken,
                toChain: SUPPORTED_CHAINS[targetChain]?.name || 'Unknown',
                toChainId: targetChain,
                estimatedGasUSD: 5.0, // Higher cost for cross-chain
                estimatedTimeSec: 300, // 5 minutes for cross-chain
                color: SUPPORTED_CHAINS[holding.chainId]?.color || '#71727A',
                fromTokenAddress,
                toTokenAddress,
                steps: [
                  {
                    type: 'bridge',
                    fromChain: holding.chainId,
                    toChain: targetChain,
                    fromToken: holding.token,
                    toToken: targetToken
                  }
                ]
              };

              if (crossChainRoute.estimatedGasUSD < lowestCost) {
                bestRoute = crossChainRoute;
                lowestCost = crossChainRoute.estimatedGasUSD;
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
          toToken: targetToken,
          toChain: SUPPORTED_CHAINS[targetChain]?.name || 'Unknown',
          toChainId: targetChain,
          estimatedGasUSD: 0,
          estimatedTimeSec: 0,
          color: '#FF6B6B',
          error: 'Insufficient balance for this payment'
        };
      }

      return {
        recommendedPath: bestRoute,
        merchantAddress,
        merchantInfo,
        alternatives: [] // Could add alternative routes here
      };

    } catch (error) {
      throw new Error(`Route detection failed: ${error.message}`);
    }
  }

  /**
   * Prepare transaction data for execution
   */
  async prepareTransaction(route, userWallet, merchantAddress, amount) {
    try {
      if (route.routeType === 'direct') {
        // Simple transfer transaction
        const isNativeToken = route.fromToken === 'ETH' || route.fromToken === 'MATIC';
        
        if (isNativeToken) {
          return {
            to: merchantAddress,
            value: (parseFloat(amount) * 1e18).toString(),
            data: '0x',
            gasLimit: '21000',
            chainId: route.fromChainId
          };
        } else {
          // ERC-20 transfer
          const transferData = this.encodeERC20Transfer(merchantAddress, amount);
          return {
            to: route.fromTokenAddress,
            value: '0',
            data: transferData,
            gasLimit: '65000',
            chainId: route.fromChainId
          };
        }
      } else if (route.routeType === 'bridge') {
        // Cross-chain transaction would require bridge contract interaction
        // This would be more complex and depend on the specific bridge being used
        throw new Error('Cross-chain transactions not yet implemented');
      }
      
      throw new Error('Unsupported route type');
    } catch (error) {
      throw new Error(`Transaction preparation failed: ${error.message}`);
    }
  }

  /**
   * Encode ERC-20 transfer function call
   */
  encodeERC20Transfer(to, amount) {
    // transfer(address,uint256) function signature
    const functionSignature = '0xa9059cbb';
    const paddedAddress = to.slice(2).padStart(64, '0');
    const paddedAmount = (parseFloat(amount) * 1e18).toString(16).padStart(64, '0');
    
    return functionSignature + paddedAddress + paddedAmount;
  }
}

module.exports = RouteDetectionService;