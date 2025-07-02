// Enhanced crypto utility functions for multi-chain wallet support

export interface WalletAddress {
  address: string;
  network: 'ethereum' | 'bitcoin' | 'solana' | 'algorand' | 'unknown';
  amount?: string;
  isValid: boolean;
  chainId?: number | string;
  assetId?: number; // For Algorand ASAs
  note?: string; // For transaction notes
}

// Validate Ethereum address (0x followed by 40 hex characters)
export const isValidEthereumAddress = (address: string): boolean => {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};

// Validate Bitcoin address (various formats)
export const isValidBitcoinAddress = (address: string): boolean => {
  // Legacy P2PKH (starts with 1)
  const p2pkh = /^[1][a-km-zA-HJ-NP-Z1-9]{25,34}$/.test(address);
  // P2SH (starts with 3)
  const p2sh = /^[3][a-km-zA-HJ-NP-Z1-9]{25,34}$/.test(address);
  // Bech32 (starts with bc1)
  const bech32 = /^bc1[a-z0-9]{39,59}$/.test(address);
  
  return p2pkh || p2sh || bech32;
};

// Validate Solana address (base58 encoded, 32-44 characters)
export const isValidSolanaAddress = (address: string): boolean => {
  return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address);
};

// Validate Algorand address (base32 encoded, 58 characters)
export const isValidAlgorandAddress = (address: string): boolean => {
  try {
    // Algorand addresses are 58 characters long and use base32 encoding
    if (address.length !== 58) return false;
    
    // Check if it contains only valid base32 characters
    const base32Regex = /^[A-Z2-7]+$/;
    return base32Regex.test(address);
  } catch {
    return false;
  }
};

// Enhanced QR code parser with multi-chain support
export const parseQRCodeData = (qrData: string): WalletAddress | null => {
  if (!qrData || typeof qrData !== 'string') {
    return null;
  }

  const cleanData = qrData.trim();
  let address = '';
  let amount = '';
  let network: 'ethereum' | 'bitcoin' | 'solana' | 'algorand' | 'unknown' = 'unknown';
  let chainId: number | string | undefined;
  let assetId: number | undefined;
  let note: string | undefined;

  try {
    // Ethereum URI: ethereum:0x...@chainId?value=amount
    if (cleanData.startsWith('ethereum:')) {
      const match = cleanData.match(/ethereum:([0x][a-fA-F0-9]{40})(@(\d+))?(\?.*)?/);
      if (match) {
        address = match[1];
        network = 'ethereum';
        chainId = match[3] ? parseInt(match[3]) : 1;
        
        if (match[4]) {
          const params = new URLSearchParams(match[4].substring(1));
          const value = params.get('value');
          if (value) {
            amount = (parseInt(value) / Math.pow(10, 18)).toString();
          }
        }
      }
    }
    // Bitcoin URI: bitcoin:address?amount=value
    else if (cleanData.startsWith('bitcoin:')) {
      const match = cleanData.match(/bitcoin:([13bc1][a-km-zA-HJ-NP-Z1-9]{25,62})(\?.*)?/);
      if (match) {
        address = match[1];
        network = 'bitcoin';
        
        if (match[2]) {
          const params = new URLSearchParams(match[2].substring(1));
          amount = params.get('amount') || '';
        }
      }
    }
    // Solana URI: solana:address?amount=value
    else if (cleanData.startsWith('solana:')) {
      const match = cleanData.match(/solana:([1-9A-HJ-NP-Za-km-z]{32,44})(\?.*)?/);
      if (match) {
        address = match[1];
        network = 'solana';
        
        if (match[2]) {
          const params = new URLSearchParams(match[2].substring(1));
          amount = params.get('amount') || '';
        }
      }
    }
    // Algorand URI: algorand:address?amount=value&asset=id&note=text
    else if (cleanData.startsWith('algorand:')) {
      const match = cleanData.match(/algorand:([A-Z2-7]{58})(\?.*)?/);
      if (match) {
        address = match[1];
        network = 'algorand';
        
        if (match[2]) {
          const params = new URLSearchParams(match[2].substring(1));
          amount = params.get('amount') || '';
          const asset = params.get('asset');
          if (asset) assetId = parseInt(asset);
          note = params.get('note') || undefined;
        }
      }
    }
    // Plain address without URI scheme
    else {
      address = cleanData;
      
      // Detect network based on address format
      if (isValidEthereumAddress(address)) {
        network = 'ethereum';
      } else if (isValidBitcoinAddress(address)) {
        network = 'bitcoin';
      } else if (isValidSolanaAddress(address)) {
        network = 'solana';
      } else if (isValidAlgorandAddress(address)) {
        network = 'algorand';
      }
    }

    // Validate the extracted address
    let isValid = false;
    switch (network) {
      case 'ethereum':
        isValid = isValidEthereumAddress(address);
        break;
      case 'bitcoin':
        isValid = isValidBitcoinAddress(address);
        break;
      case 'solana':
        isValid = isValidSolanaAddress(address);
        break;
      case 'algorand':
        isValid = isValidAlgorandAddress(address);
        break;
      default:
        isValid = false;
    }

    if (!isValid || !address) {
      return null;
    }

    return {
      address,
      network,
      amount,
      isValid,
      chainId,
      assetId,
      note
    };
  } catch (error) {
    console.error('Error parsing QR code:', error);
    return null;
  }
};

// Format address for display
export const formatAddressForDisplay = (address: string, startChars = 6, endChars = 4): string => {
  if (!address || address.length <= startChars + endChars) {
    return address;
  }
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
};

// Get network display name
export const getNetworkDisplayName = (network: string): string => {
  switch (network) {
    case 'ethereum':
      return 'Ethereum';
    case 'bitcoin':
      return 'Bitcoin';
    case 'solana':
      return 'Solana';
    case 'algorand':
      return 'Algorand';
    default:
      return 'Unknown';
  }
};

// Get network color for UI
export const getNetworkColor = (network: string): string => {
  switch (network) {
    case 'ethereum':
      return '#627EEA';
    case 'bitcoin':
      return '#F7931A';
    case 'solana':
      return '#9945FF';
    case 'algorand':
      return '#000000';
    default:
      return '#71727A';
  }
};

// Get network icon/symbol
export const getNetworkSymbol = (network: string): string => {
  switch (network) {
    case 'ethereum':
      return 'ETH';
    case 'bitcoin':
      return 'BTC';
    case 'solana':
      return 'SOL';
    case 'algorand':
      return 'ALGO';
    default:
      return '?';
  }
};

// Generate sample QR codes for demo with multi-chain support
export const generateSampleQRCodes = () => {
  return [
    {
      data: '0x742d35Cc6634C0532925a3b8D4C9db7C4C4C4C4C',
      network: 'ethereum',
      label: 'Ethereum Wallet',
      amount: '0'
    },
    {
      data: 'ethereum:0x742d35Cc6634C0532925a3b8D4C9db7C4C4C4C4C@1?value=1000000000000000000',
      network: 'ethereum',
      label: 'Ethereum Payment (1 ETH)',
      amount: '1'
    },
    {
      data: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
      network: 'bitcoin',
      label: 'Bitcoin Wallet',
      amount: '0'
    },
    {
      data: 'bitcoin:1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa?amount=0.001',
      network: 'bitcoin',
      label: 'Bitcoin Payment (0.001 BTC)',
      amount: '0.001'
    },
    {
      data: '11111111111111111111111111111112',
      network: 'solana',
      label: 'Solana Wallet',
      amount: '0'
    },
    {
      data: 'solana:11111111111111111111111111111112?amount=1.5',
      network: 'solana',
      label: 'Solana Payment (1.5 SOL)',
      amount: '1.5'
    },
    {
      data: 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
      network: 'algorand',
      label: 'Algorand Wallet',
      amount: '0'
    },
    {
      data: 'algorand:AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA?amount=10&note=Payment',
      network: 'algorand',
      label: 'Algorand Payment (10 ALGO)',
      amount: '10'
    }
  ];
};

// Estimate transaction fees for different networks
export const estimateTransactionFee = (network: string, amount: string): string => {
  const numAmount = parseFloat(amount) || 0;
  
  switch (network) {
    case 'ethereum':
      return '0.002'; // ~$5-10 typical gas fee
    case 'bitcoin':
      return '0.0001'; // ~$2-5 typical fee
    case 'solana':
      return '0.000005'; // ~$0.001 typical fee
    case 'algorand':
      return '0.001'; // Fixed 0.001 ALGO fee
    default:
      return '0';
  }
};

// Get explorer URL for transaction
export const getExplorerUrl = (network: string, txHash: string, isMainnet = true): string => {
  switch (network) {
    case 'ethereum':
      return isMainnet 
        ? `https://etherscan.io/tx/${txHash}`
        : `https://sepolia.etherscan.io/tx/${txHash}`;
    case 'bitcoin':
      return isMainnet
        ? `https://blockstream.info/tx/${txHash}`
        : `https://blockstream.info/testnet/tx/${txHash}`;
    case 'solana':
      return isMainnet
        ? `https://explorer.solana.com/tx/${txHash}`
        : `https://explorer.solana.com/tx/${txHash}?cluster=testnet`;
    case 'algorand':
      return isMainnet
        ? `https://algoexplorer.io/tx/${txHash}`
        : `https://testnet.algoexplorer.io/tx/${txHash}`;
    default:
      return '#';
  }
};

// Validate transaction amount
export const validateTransactionAmount = (amount: string, network: string): { isValid: boolean; error?: string } => {
  const numAmount = parseFloat(amount);
  
  if (isNaN(numAmount) || numAmount <= 0) {
    return { isValid: false, error: 'Amount must be a positive number' };
  }
  
  // Network-specific validations
  switch (network) {
    case 'ethereum':
      if (numAmount < 0.000001) {
        return { isValid: false, error: 'Minimum amount is 0.000001 ETH' };
      }
      break;
    case 'bitcoin':
      if (numAmount < 0.00000546) {
        return { isValid: false, error: 'Amount below dust limit (546 satoshis)' };
      }
      break;
    case 'solana':
      if (numAmount < 0.000000001) {
        return { isValid: false, error: 'Minimum amount is 1 lamport' };
      }
      break;
    case 'algorand':
      if (numAmount < 0.000001) {
        return { isValid: false, error: 'Minimum amount is 1 microAlgo' };
      }
      break;
  }
  
  return { isValid: true };
};