import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { 
  modal, 
  subscribeToAccount, 
  subscribeToChainId, 
  getAccount, 
  getChainId,
  getTokenBalance,
  isWalletConnected,
  getWalletAddress,
  formatWalletAddress,
  handleWalletError,
  sendTransaction,
  signMessage
} from '../lib/reown'

interface WalletContextType {
  account: any
  chainId: number | undefined
  isConnected: boolean
  isLoading: boolean
  balance: string
  formattedAddress: string
  connect: () => void
  disconnect: () => void
  switchNetwork: (chainId: number) => Promise<void>
  refreshBalance: () => Promise<void>
  sendTransaction: (to: string, value: string, data?: string) => Promise<string>
  signMessage: (message: string) => Promise<string>
  error: string | null
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

interface WalletProviderProps {
  children: ReactNode
}

export function WalletProvider({ children }: WalletProviderProps) {
  const [account, setAccount] = useState<any>(null)
  const [chainId, setChainId] = useState<number | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(true)
  const [balance, setBalance] = useState<string>('0.000000')
  const [error, setError] = useState<string | null>(null)

  // Initialize wallet state
  useEffect(() => {
    const initializeWallet = async () => {
      try {
        setError(null)
        const currentAccount = getAccount()
        const currentChainId = getChainId()
        
        setAccount(currentAccount)
        setChainId(currentChainId)

        // Get balance if connected
        if (currentAccount?.address) {
          const walletBalance = await getTokenBalance()
          setBalance(walletBalance)
        }
      } catch (error: any) {
        console.error('Error initializing wallet:', error)
        setError(handleWalletError(error))
      } finally {
        setIsLoading(false)
      }
    }

    initializeWallet()
  }, [])

  // Subscribe to account changes
  useEffect(() => {
    const unsubscribeAccount = subscribeToAccount(async (newAccount) => {
      console.log('Account changed:', newAccount)
      setAccount(newAccount)
      setError(null)
      
      // Update balance when account changes
      if (newAccount?.address) {
        try {
          const walletBalance = await getTokenBalance()
          setBalance(walletBalance)
        } catch (error: any) {
          console.error('Error fetching balance:', error)
          setError(handleWalletError(error))
        }
      } else {
        setBalance('0.000000')
      }
    })

    return () => {
      if (typeof unsubscribeAccount === 'function') {
        unsubscribeAccount()
      }
    }
  }, [])

  // Subscribe to chain changes
  useEffect(() => {
    const unsubscribeChainId = subscribeToChainId(async (newChainId) => {
      console.log('Chain changed:', newChainId)
      setChainId(newChainId)
      setError(null)
      
      // Refresh balance when chain changes
      if (account?.address) {
        try {
          const walletBalance = await getTokenBalance()
          setBalance(walletBalance)
        } catch (error: any) {
          console.error('Error fetching balance after chain change:', error)
          setError(handleWalletError(error))
        }
      }
    })

    return () => {
      if (typeof unsubscribeChainId === 'function') {
        unsubscribeChainId()
      }
    }
  }, [account])

  const connect = () => {
    setError(null)
    modal.open()
  }

  const disconnect = () => {
    modal.disconnect()
    setAccount(null)
    setChainId(undefined)
    setBalance('0.000000')
    setError(null)
  }

  const switchNetwork = async (targetChainId: number) => {
    try {
      setError(null)
      await modal.switchNetwork(targetChainId)
    } catch (error: any) {
      console.error('Failed to switch network:', error)
      setError(handleWalletError(error))
      throw error
    }
  }

  const refreshBalance = async () => {
    if (!account?.address) return
    
    try {
      setError(null)
      const walletBalance = await getTokenBalance()
      setBalance(walletBalance)
    } catch (error: any) {
      console.error('Error refreshing balance:', error)
      setError(handleWalletError(error))
    }
  }

  const handleSendTransaction = async (to: string, value: string, data?: string) => {
    try {
      setError(null)
      const txHash = await sendTransaction(to, value, data)
      
      // Refresh balance after transaction
      setTimeout(() => {
        refreshBalance()
      }, 2000)
      
      return txHash
    } catch (error: any) {
      console.error('Transaction failed:', error)
      setError(handleWalletError(error))
      throw error
    }
  }

  const handleSignMessage = async (message: string) => {
    try {
      setError(null)
      return await signMessage(message)
    } catch (error: any) {
      console.error('Message signing failed:', error)
      setError(handleWalletError(error))
      throw error
    }
  }

  const formattedAddress = account?.address ? formatWalletAddress(account.address) : ''

  const value: WalletContextType = {
    account,
    chainId,
    isConnected: isWalletConnected(),
    isLoading,
    balance,
    formattedAddress,
    connect,
    disconnect,
    switchNetwork,
    refreshBalance,
    sendTransaction: handleSendTransaction,
    signMessage: handleSignMessage,
    error
  }

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  )
}

export function useWallet() {
  const context = useContext(WalletContext)
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider')
  }
  return context
}