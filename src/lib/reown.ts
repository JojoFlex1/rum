import { createAppKit } from '@reown/appkit'
import { EthersAdapter } from '@reown/appkit-adapter-ethers'
import { SolanaAdapter } from '@reown/appkit-adapter-solana'
import { mainnet, arbitrum, polygon, base, optimism, sepolia, solana, solanaTestnet, solanaDevnet } from '@reown/appkit/networks'

// 1. Get projectId from https://cloud.reown.com
const projectId = import.meta.env.VITE_REOWN_PROJECT_ID || '6e0c305cbb3f3d2882f71552576867ec'

// 2. Set up the Ethers adapter
const ethersAdapter = new EthersAdapter()

// 3. Set up the Solana adapter  
const solanaAdapter = new SolanaAdapter({
  wallets: ['phantom', 'solflare', 'backpack', 'coinbase']
})

// 4. Create the modal
export const modal = createAppKit({
  adapters: [ethersAdapter, solanaAdapter],
  projectId,
  networks: [mainnet, arbitrum, polygon, base, optimism, sepolia, solana, solanaTestnet, solanaDevnet],
  defaultNetwork: mainnet,
  metadata: {
    name: 'AURUM Payments',
    description: 'Connecting Worlds with Travelers',
    url: typeof window !== 'undefined' ? window.location.origin : 'https://aurum-payments.com',
    icons: ['/screenshot-2025-02-02-at-10-49-52-am-3.png'],
    verifyUrl: typeof window !== 'undefined' ? `${window.location.origin}/.well-known/walletconnect.txt` : 'https://aurum-payments.com/.well-known/walletconnect.txt'
  },
  features: {
    analytics: true,
    email: false,
    socials: ['google', 'x', 'github', 'discord', 'apple'],
    emailShowWallets: true,
    swaps: true,
    onramp: true
  },
  themeMode: 'dark',
  themeVariables: {
    '--w3m-color-mix': '#CBAB58',
    '--w3m-color-mix-strength': 20,
    '--w3m-accent': '#CBAB58',
    '--w3m-border-radius-master': '14px',
    '--w3m-font-family': 'SF Pro Text, system-ui, sans-serif'
  }
})

// 5. Export wallet connection utilities
export const connectWallet = () => {
  modal.open()
}

export const disconnectWallet = () => {
  modal.disconnect()
}

export const getAccount = () => {
  return modal.getAccount()
}

export const getChainId = () => {
  return modal.getChainId()
}

export const switchNetwork = (chainId: number) => {
  return modal.switchNetwork(chainId)
}

export const getBalance = () => {
  return modal.getBalance()
}

export const getWalletProvider = () => {
  return modal.getWalletProvider()
}

// 6. Subscribe to connection events
export const subscribeToAccount = (callback: (account: any) => void) => {
  let previousAccount: any = null
  
  return modal.subscribeState((state: any) => {
    const currentAccount = state.selectedNetworkId ? modal.getAccount() : null
    
    // Only call callback if account actually changed
    if (JSON.stringify(currentAccount) !== JSON.stringify(previousAccount)) {
      previousAccount = currentAccount
      callback(currentAccount)
    }
  })
}

export const subscribeToChainId = (callback: (chainId: number) => void) => {
  let previousChainId: number | null = null
  
  return modal.subscribeState((state: any) => {
    const currentChainId = state.selectedNetworkId
    
    // Only call callback if chainId actually changed
    if (currentChainId !== previousChainId) {
      previousChainId = currentChainId
      callback(currentChainId)
    }
  })
}

export const subscribeToConnectionState = (callback: (state: any) => void) => {
  return modal.subscribeState(callback)
}

// 7. Network utilities with Algorand support
export const getSupportedNetworks = () => {
  return [
    { id: 1, name: 'Ethereum', symbol: 'ETH', type: 'evm' },
    { id: 137, name: 'Polygon', symbol: 'MATIC', type: 'evm' },
    { id: 42161, name: 'Arbitrum', symbol: 'ETH', type: 'evm' },
    { id: 8453, name: 'Base', symbol: 'ETH', type: 'evm' },
    { id: 10, name: 'Optimism', symbol: 'ETH', type: 'evm' },
    { id: 11155111, name: 'Sepolia Testnet', symbol: 'ETH', type: 'evm' },
    { id: 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp', name: 'Solana', symbol: 'SOL', type: 'solana' },
    { id: 'solana:4uhcVJyU9pJkvQyS88uRDiswHXSCkY3z', name: 'Solana Testnet', symbol: 'SOL', type: 'solana' },
    { id: 'solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1', name: 'Solana Devnet', symbol: 'SOL', type: 'solana' },
    { id: 'algorand:mainnet', name: 'Algorand', symbol: 'ALGO', type: 'algorand' },
    { id: 'algorand:testnet', name: 'Algorand TestNet', symbol: 'ALGO', type: 'algorand' }
  ]
}

export const getNetworkName = (chainId: number | string) => {
  const networks = getSupportedNetworks()
  const network = networks.find(n => n.id === chainId)
  return network?.name || 'Unknown Network'
}

export const getNetworkType = (chainId: number | string) => {
  const networks = getSupportedNetworks()
  const network = networks.find(n => n.id === chainId)
  return network?.type || 'unknown'
}

// 8. Enhanced wallet utilities
export const isWalletConnected = () => {
  const account = getAccount()
  return !!account?.address
}

export const getWalletAddress = () => {
  const account = getAccount()
  return account?.address || null
}

export const formatWalletAddress = (address: string, startChars = 6, endChars = 4) => {
  if (!address) return ''
  if (address.length <= startChars + endChars) return address
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`
}

// 9. Enhanced transaction utilities with multi-chain support
export const sendTransaction = async (to: string, value: string, data?: string, network?: string) => {
  try {
    const provider = getWalletProvider()
    if (!provider) throw new Error('No wallet provider available')

    const account = getAccount()
    if (!account?.address) throw new Error('No wallet connected')

    const chainId = getChainId()
    const networkType = getNetworkType(chainId)

    if (networkType === 'evm') {
      return await sendEVMTransaction(provider, account.address, to, value, data)
    } else if (networkType === 'solana') {
      return await sendSolanaTransaction(provider, account.address, to, value)
    } else if (networkType === 'algorand' || network === 'algorand') {
      return await sendAlgorandTransaction(to, value)
    }

    throw new Error('Unsupported network type')
  } catch (error) {
    console.error('Transaction failed:', error)
    throw error
  }
}

// EVM Transaction
const sendEVMTransaction = async (provider: any, from: string, to: string, value: string, data?: string) => {
  const transaction = {
    from,
    to,
    value,
    data: data || '0x'
  }

  const txHash = await provider.request({
    method: 'eth_sendTransaction',
    params: [transaction]
  })

  return txHash
}

// Solana Transaction
const sendSolanaTransaction = async (provider: any, from: string, to: string, value: string) => {
  // Convert value from ETH units to SOL lamports
  const lamports = Math.floor(parseFloat(value) * 1e9) // 1 SOL = 1e9 lamports

  const transaction = {
    feePayer: from,
    instructions: [{
      programId: '11111111111111111111111111111112', // System Program
      keys: [
        { pubkey: from, isSigner: true, isWritable: true },
        { pubkey: to, isSigner: false, isWritable: true }
      ],
      data: Buffer.from([2, 0, 0, 0, ...new Uint8Array(new BigUint64Array([BigInt(lamports)]).buffer)])
    }]
  }

  const signature = await provider.signAndSendTransaction(transaction)
  return signature
}

// Algorand Transaction
const sendAlgorandTransaction = async (to: string, value: string) => {
  const { algodClient, createTestAccount } = await import('./algorand')
  
  try {
    // For demo purposes, create a test account
    // In production, this would use the connected wallet
    const { account } = createTestAccount()
    
    // Convert value to microAlgos (1 ALGO = 1,000,000 microAlgos)
    const amount = Math.floor(parseFloat(value) * 1000000)
    
    // Get suggested transaction parameters
    const suggestedParams = await algodClient.getTransactionParams().do()
    
    // Create payment transaction
    const { makePaymentTxnWithSuggestedParamsFromObject } = await import('algosdk')
    
    const txn = makePaymentTxnWithSuggestedParamsFromObject({
      from: account.addr,
      to: to,
      amount: amount,
      suggestedParams: suggestedParams
    })
    
    // Sign transaction
    const signedTxn = txn.signTxn(account.sk)
    
    // Submit transaction
    const tx = await algodClient.sendRawTransaction(signedTxn).do()
    
    // Wait for confirmation
    const { waitForConfirmation } = await import('./algorand')
    await waitForConfirmation(tx.txId)
    
    return tx.txId
  } catch (error) {
    console.error('Algorand transaction failed:', error)
    throw error
  }
}

export const signMessage = async (message: string) => {
  try {
    const provider = getWalletProvider()
    if (!provider) throw new Error('No wallet provider available')

    const account = getAccount()
    if (!account?.address) throw new Error('No wallet connected')

    const signature = await provider.request({
      method: 'personal_sign',
      params: [message, account.address]
    })

    return signature
  } catch (error) {
    console.error('Message signing failed:', error)
    throw error
  }
}

// 10. Enhanced balance utilities with multi-chain support
export const getTokenBalance = async (tokenAddress?: string, network?: string) => {
  try {
    const account = getAccount()
    if (!account?.address) throw new Error('No wallet connected')

    const chainId = getChainId()
    const networkType = getNetworkType(chainId)

    if (networkType === 'evm') {
      return await getEVMBalance(account.address, tokenAddress)
    } else if (networkType === 'solana') {
      return await getSolanaBalance(account.address)
    } else if (networkType === 'algorand' || network === 'algorand') {
      return await getAlgorandBalance(account.address)
    }

    return '0.000000'
  } catch (error) {
    console.error('Failed to get balance:', error)
    return '0.000000'
  }
}

// EVM Balance
const getEVMBalance = async (address: string, tokenAddress?: string) => {
  const provider = getWalletProvider()
  if (!provider) throw new Error('No wallet provider available')

  if (!tokenAddress) {
    // Get native token balance (ETH)
    const balance = await provider.request({
      method: 'eth_getBalance',
      params: [address, 'latest']
    })
    
    // Convert from wei to ether
    const balanceInEth = parseInt(balance, 16) / Math.pow(10, 18)
    return balanceInEth.toFixed(6)
  } else {
    // Get ERC-20 token balance
    const data = `0x70a08231000000000000000000000000${address.slice(2)}`
    const balance = await provider.request({
      method: 'eth_call',
      params: [{
        to: tokenAddress,
        data
      }, 'latest']
    })
    
    // Convert from wei (assuming 18 decimals)
    const balanceInTokens = parseInt(balance, 16) / Math.pow(10, 18)
    return balanceInTokens.toFixed(6)
  }
}

// Solana Balance
const getSolanaBalance = async (address: string) => {
  try {
    const provider = getWalletProvider()
    if (!provider) throw new Error('No wallet provider available')

    const balance = await provider.getBalance(address)
    // Convert from lamports to SOL
    const balanceInSol = balance / 1e9
    return balanceInSol.toFixed(6)
  } catch (error) {
    console.error('Failed to get Solana balance:', error)
    return '0.000000'
  }
}

// Algorand Balance
const getAlgorandBalance = async (address: string) => {
  try {
    const { algodClient } = await import('./algorand')
    const accountInfo = await algodClient.accountInformation(address).do()
    
    // Convert from microAlgos to Algos
    const balanceInAlgos = accountInfo.amount / 1000000
    return balanceInAlgos.toFixed(6)
  } catch (error) {
    console.error('Failed to get Algorand balance:', error)
    return '0.000000'
  }
}

// 11. QR Code scanning utilities
export const parseWalletQRCode = (qrData: string) => {
  try {
    // Handle different QR code formats
    let address = ''
    let amount = ''
    let network = 'unknown'

    // Ethereum URI: ethereum:0x...@chainId?value=amount
    if (qrData.startsWith('ethereum:')) {
      const match = qrData.match(/ethereum:([0x][a-fA-F0-9]{40})(@(\d+))?(\?.*)?/)
      if (match) {
        address = match[1]
        network = 'ethereum'
        
        // Extract amount if present
        const params = new URLSearchParams(match[4]?.substring(1) || '')
        const value = params.get('value')
        if (value) {
          amount = (parseInt(value) / Math.pow(10, 18)).toString()
        }
      }
    }
    // Bitcoin URI: bitcoin:address?amount=value
    else if (qrData.startsWith('bitcoin:')) {
      const match = qrData.match(/bitcoin:([13bc1][a-km-zA-HJ-NP-Z1-9]{25,62})(\?.*)?/)
      if (match) {
        address = match[1]
        network = 'bitcoin'
        
        const params = new URLSearchParams(match[2]?.substring(1) || '')
        amount = params.get('amount') || ''
      }
    }
    // Solana URI: solana:address?amount=value
    else if (qrData.startsWith('solana:')) {
      const match = qrData.match(/solana:([1-9A-HJ-NP-Za-km-z]{32,44})(\?.*)?/)
      if (match) {
        address = match[1]
        network = 'solana'
        
        const params = new URLSearchParams(match[2]?.substring(1) || '')
        amount = params.get('amount') || ''
      }
    }
    // Algorand URI: algorand:address?amount=value
    else if (qrData.startsWith('algorand:')) {
      const match = qrData.match(/algorand:([A-Z2-7]{58})(\?.*)?/)
      if (match) {
        address = match[1]
        network = 'algorand'
        
        const params = new URLSearchParams(match[2]?.substring(1) || '')
        amount = params.get('amount') || ''
      }
    }
    // Plain address
    else {
      address = qrData.trim()
      
      // Detect network based on address format
      if (/^0x[a-fA-F0-9]{40}$/.test(address)) {
        network = 'ethereum'
      } else if (/^[13bc1][a-km-zA-HJ-NP-Z1-9]{25,62}$/.test(address)) {
        network = 'bitcoin'
      } else if (/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address)) {
        network = 'solana'
      } else if (/^[A-Z2-7]{58}$/.test(address)) {
        network = 'algorand'
      }
    }

    return {
      address,
      amount,
      network,
      isValid: !!address
    }
  } catch (error) {
    console.error('Error parsing QR code:', error)
    return {
      address: '',
      amount: '',
      network: 'unknown',
      isValid: false
    }
  }
}

// 12. Error handling utilities
export const handleWalletError = (error: any) => {
  if (error.code === 4001) {
    return 'User rejected the request'
  } else if (error.code === -32602) {
    return 'Invalid parameters'
  } else if (error.code === -32603) {
    return 'Internal error'
  } else if (error.message?.includes('insufficient funds')) {
    return 'Insufficient funds for transaction'
  } else if (error.message?.includes('network')) {
    return 'Network error. Please check your connection'
  } else {
    return error.message || 'An unknown error occurred'
  }
}

// 13. Transaction status utilities
export const getTransactionStatus = async (txHash: string, network: string) => {
  try {
    if (network === 'ethereum' || network === 'evm') {
      const provider = getWalletProvider()
      if (!provider) throw new Error('No provider available')
      
      const receipt = await provider.request({
        method: 'eth_getTransactionReceipt',
        params: [txHash]
      })
      
      return {
        status: receipt ? (receipt.status === '0x1' ? 'confirmed' : 'failed') : 'pending',
        blockNumber: receipt?.blockNumber,
        gasUsed: receipt?.gasUsed
      }
    } else if (network === 'algorand') {
      const { algodClient } = await import('./algorand')
      
      try {
        const txInfo = await algodClient.pendingTransactionInformation(txHash).do()
        return {
          status: txInfo['confirmed-round'] ? 'confirmed' : 'pending',
          round: txInfo['confirmed-round']
        }
      } catch (error) {
        return { status: 'failed' }
      }
    }
    
    return { status: 'unknown' }
  } catch (error) {
    console.error('Error getting transaction status:', error)
    return { status: 'error', error: error.message }
  }
}