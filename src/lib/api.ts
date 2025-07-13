// API client for backend route detection services

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export interface UserHolding {
  token: string;
  chain: string;
  chainId: number;
  balance: string;
  address: string;
}

export interface RouteRequest {
  userWallet: string;
  merchantQR: string;
  amount: string;
  userHoldings?: UserHolding[];
}

export interface RouteResponse {
  status: 'ok' | 'error';
  recommendedPath: {
    fromToken: string;
    fromChain: string;
    fromChainId: number;
    toToken: string;
    toChain: string;
    toChainId: number;
    routeType: 'direct' | 'bridge' | 'insufficient';
    estimatedGasUSD: number;
    estimatedTimeSec: number;
    color: string;
    fromTokenAddress?: string;
    toTokenAddress?: string;
    error?: string;
  };
  merchantAddress: string;
  merchantInfo: {
    address: string;
    chainId: number;
    token: string;
    amount: string | null;
    network: string;
  };
  alternatives?: any[];
  message?: string;
  timestamp: string;
}

export interface TransactionRequest {
  userWallet: string;
  merchantAddress: string;
  amount: string;
  route: RouteResponse['recommendedPath'];
}

export interface TransactionResponse {
  status: 'ok' | 'error';
  transaction: {
    to: string;
    value: string;
    data: string;
    gasLimit: string;
    chainId: number;
  };
  message?: string;
  timestamp: string;
}

export interface SupportedChain {
  chainId: number;
  name: string;
  symbol: string;
  color: string;
  rpc: string;
}

export interface BalanceResponse {
  status: 'ok' | 'error';
  wallet: string;
  balances: UserHolding[];
  message?: string;
  timestamp: string;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  async detectRoute(request: RouteRequest): Promise<RouteResponse> {
    return this.request<RouteResponse>('/api/detect-route', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async prepareTransaction(request: TransactionRequest): Promise<TransactionResponse> {
    return this.request<TransactionResponse>('/api/prepare-transaction', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async getSupportedChains(): Promise<{ status: string; chains: SupportedChain[]; timestamp: string }> {
    return this.request('/api/supported-chains');
  }

  async getUserBalances(wallet: string): Promise<BalanceResponse> {
    return this.request(`/api/user-balances/${wallet}`);
  }
}

export const apiClient = new ApiClient();

// Helper functions for the frontend
export const formatRouteDisplay = (route: RouteResponse['recommendedPath']) => {
  if (route.routeType === 'insufficient') {
    return {
      title: 'Insufficient Balance',
      description: route.error || 'You need to acquire the required token',
      color: route.color,
      canProceed: false
    };
  }

  if (route.routeType === 'direct') {
    return {
      title: `Direct ${route.fromToken} Transfer`,
      description: `Send ${route.fromToken} on ${route.fromChain}`,
      color: route.color,
      canProceed: true,
      estimatedTime: `~${route.estimatedTimeSec}s`,
      estimatedCost: `$${route.estimatedGasUSD.toFixed(3)}`
    };
  }

  if (route.routeType === 'bridge') {
    return {
      title: `Bridge ${route.fromToken} → ${route.toToken}`,
      description: `${route.fromChain} → ${route.toChain}`,
      color: route.color,
      canProceed: true,
      estimatedTime: `~${Math.floor(route.estimatedTimeSec / 60)}m`,
      estimatedCost: `$${route.estimatedGasUSD.toFixed(2)}`
    };
  }

  return {
    title: 'Unknown Route',
    description: 'Route type not recognized',
    color: '#71727A',
    canProceed: false
  };
};

export const validateWalletAddress = (address: string): boolean => {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};

export const formatTokenAmount = (amount: string, decimals: number = 6): string => {
  const num = parseFloat(amount);
  if (isNaN(num)) return '0';
  
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  } else if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  } else {
    return num.toFixed(decimals);
  }
};