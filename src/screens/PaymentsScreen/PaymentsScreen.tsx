import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Wallet, ExternalLink, Copy, Check, RefreshCw, CreditCard, Shield, Settings, ChevronRight, Apple, AlertCircle, Zap } from "lucide-react";
import { NavigationBar } from "../../components/ui/navigation-bar";
import { useWallet } from "../../components/WalletProvider";
import { getSupportedNetworks, getNetworkName, getNetworkType } from "../../lib/reown";

export const PaymentsScreen = (): JSX.Element => {
  const navigate = useNavigate();
  const { 
    account, 
    chainId, 
    isConnected, 
    isLoading, 
    balance,
    formattedAddress,
    connect, 
    disconnect, 
    switchNetwork,
    refreshBalance,
    error
  } = useWallet();
  
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showNetworkSelector, setShowNetworkSelector] = useState(false);
  const [appleWalletSupported, setAppleWalletSupported] = useState(false);
  const [allowVoiceTransactions, setAllowVoiceTransactions] = useState(true);

  useEffect(() => {
    // Check if Apple Wallet is supported
    const checkAppleWalletSupport = () => {
      const isAppleDevice = /iPad|iPhone|iPod|Macintosh/.test(navigator.userAgent);
      const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
      setAppleWalletSupported(isAppleDevice && isSafari);
    };

    checkAppleWalletSupport();
  }, []);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedAddress(true);
      setTimeout(() => setCopiedAddress(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleRefreshBalance = async () => {
    setIsRefreshing(true);
    try {
      await refreshBalance();
    } catch (error) {
      console.error('Failed to refresh balance:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleNetworkSwitch = async (networkId: number) => {
    try {
      await switchNetwork(networkId);
      setShowNetworkSelector(false);
    } catch (error) {
      console.error('Failed to switch network:', error);
    }
  };

  const handleAddToAppleWallet = () => {
    if (appleWalletSupported) {
      alert('This would add your AURUM payment card to Apple Wallet. Feature coming soon!');
    } else {
      alert('Apple Wallet is only supported on iOS Safari and macOS Safari');
    }
  };

  const supportedNetworks = getSupportedNetworks();
  const currentNetwork = supportedNetworks.find(n => n.id === chainId);
  const evmNetworks = supportedNetworks.filter(n => n.type === 'evm');

  return (
    <div className="flex justify-center w-full bg-[#1F2024]">
      <div className="relative w-[393px] bg-[#1F2024] min-h-screen">
        <header className="fixed top-0 w-[393px] z-50 h-[42px] bg-[#1F2024] backdrop-blur-[20px] backdrop-brightness-[100%]">
          <div className="absolute w-14 h-[17px] top-[13px] left-[21px]">
            <div className="absolute w-[54px] -top-px left-0 [font-family:'SF_Pro_Text-Semibold',Helvetica] font-normal text-white text-[15px] text-center tracking-[-0.17px] leading-[normal]">
              3:33
            </div>
          </div>

          <div className="absolute w-[68px] h-3.5 top-[15px] left-[311px] overflow-hidden">
            <div className="absolute -top-1 left-[41px] [font-family:'SF_Pro_Text-Regular',Helvetica] font-normal text-white text-[17px] tracking-[0] leading-[normal] whitespace-nowrap">
              􀛨
            </div>

            <img
              className="absolute w-[17px] h-[11px] top-0.5 left-0"
              alt="Signal"
              src="/signal.svg"
            />

            <div className="absolute -top-0.5 left-[21px] [font-family:'SF_Pro_Text-Regular',Helvetica] font-normal text-white text-sm tracking-[0] leading-[normal]">
              􀙇
            </div>
          </div>
        </header>

        <div className="flex flex-col px-4 pt-[58px] pb-[83px]">
          <div className="flex items-center mb-8">
            <button 
              onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-full bg-[#2C2D32] flex items-center justify-center mr-4"
            >
              <ArrowLeft size={20} className="text-white" />
            </button>
            <h1 className="text-2xl font-bold text-white">Wallet</h1>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center">
              <AlertCircle size={20} className="text-red-500 mr-3 flex-shrink-0" />
              <div>
                <p className="text-red-500 text-sm font-medium">Wallet Error</p>
                <p className="text-red-400 text-xs">{error}</p>
              </div>
            </div>
          )}

          {/* Wallet Connection Section */}
          <div className="mb-8">
            <h2 className="text-white text-lg font-semibold mb-4">Ethereum Wallets</h2>
            
            {isConnected && account ? (
              <div className="bg-gradient-to-r from-[#CBAB58] to-[#E1C87D] p-6 rounded-2xl mb-4">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-[#1F2024] text-sm mb-1">Connected Wallet</p>
                    <div className="flex items-center">
                      <h3 className="text-[#1F2024] text-xl font-bold mr-2">
                        {balance} {currentNetwork?.symbol || 'ETH'}
                      </h3>
                      <button 
                        onClick={handleRefreshBalance}
                        disabled={isRefreshing}
                        className="p-1 rounded-full hover:bg-[#1F2024]/10 disabled:opacity-50"
                      >
                        <RefreshCw 
                          size={16} 
                          className={`text-[#1F2024] ${isRefreshing ? 'animate-spin' : ''}`} 
                        />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-600 rounded-full animate-pulse" />
                    <span className="text-[#1F2024] text-xs font-medium">Connected</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-[#1F2024] text-sm mb-1">Address</p>
                    <div className="flex items-center space-x-2">
                      <p className="text-[#1F2024] font-medium">{formattedAddress}</p>
                      <button 
                        onClick={() => copyToClipboard(account.address)}
                        className="p-1 rounded-full hover:bg-[#1F2024]/10"
                      >
                        {copiedAddress ? (
                          <Check size={14} className="text-[#1F2024]" />
                        ) : (
                          <Copy size={14} className="text-[#1F2024]" />
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[#1F2024] text-sm mb-1">Network</p>
                    <button
                      onClick={() => setShowNetworkSelector(!showNetworkSelector)}
                      className="flex items-center space-x-1 bg-[#1F2024]/20 px-2 py-1 rounded-lg"
                    >
                      <p className="text-[#1F2024] font-medium text-sm">{getNetworkName(chainId || 1)}</p>
                      <ChevronRight size={12} className="text-[#1F2024]" />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-[#2C2D32] p-6 rounded-2xl mb-4">
                <div className="text-center">
                  <Wallet size={48} className="text-[#CBAB58] mx-auto mb-4" />
                  <h3 className="text-white text-lg font-semibold mb-2">Connect Your Ethereum Wallet</h3>
                  <p className="text-[#71727A] mb-6">
                    Connect MetaMask, Coinbase Wallet, WalletConnect, or other Ethereum wallets to start making payments
                  </p>
                  <button 
                    onClick={connect}
                    disabled={isLoading}
                    className="bg-[#CBAB58] text-[#1F2024] px-6 py-3 rounded-xl font-semibold hover:bg-[#b69843] transition-colors disabled:opacity-50 flex items-center justify-center mx-auto"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#1F2024] mr-2"></div>
                        Loading...
                      </>
                    ) : (
                      <>
                        <Zap size={20} className="mr-2" />
                        Connect Wallet
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Network Selector */}
            {showNetworkSelector && isConnected && (
              <div className="bg-[#2C2D32] rounded-xl p-4 mb-4">
                <h3 className="text-white font-medium mb-3">Switch Network</h3>
                <div className="grid grid-cols-1 gap-2">
                  {evmNetworks.map((network) => (
                    <button
                      key={network.id}
                      onClick={() => typeof network.id === 'number' && handleNetworkSwitch(network.id)}
                      className={`p-3 rounded-lg border transition-colors text-left ${
                        network.id === chainId
                          ? 'bg-[#CBAB58]/20 border-[#CBAB58] text-[#CBAB58]'
                          : 'bg-[#1F2024] border-[#1F2024] text-white hover:border-[#CBAB58]/50'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="text-sm font-medium">{network.name}</div>
                          <div className="text-xs opacity-70">{network.symbol}</div>
                        </div>
                        {network.id === chainId && (
                          <div className="w-2 h-2 bg-[#CBAB58] rounded-full" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Wallet Actions */}
            {isConnected && (
              <div className="grid grid-cols-2 gap-4 mb-4">
                <button 
                  onClick={disconnect}
                  className="bg-[#2C2D32] p-4 rounded-xl flex flex-col items-center hover:bg-red-500/10 transition-colors"
                >
                  <ExternalLink size={24} className="text-red-500 mb-2" />
                  <span className="text-red-500 font-medium">Disconnect</span>
                </button>
                <button 
                  onClick={connect}
                  className="bg-[#2C2D32] p-4 rounded-xl flex flex-col items-center hover:bg-[#CBAB58]/10 transition-colors"
                >
                  <Plus size={24} className="text-[#CBAB58] mb-2" />
                  <span className="text-[#CBAB58] font-medium">Add Wallet</span>
                </button>
              </div>
            )}
          </div>

          {/* Apple Wallet Section */}
          <div className="mb-8">
            <h2 className="text-white text-lg font-semibold mb-4">Payment Cards</h2>
            
            <div className="bg-[#2C2D32] rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-xl bg-black flex items-center justify-center mr-4">
                    <Apple size={24} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">Apple Wallet</h3>
                    <p className="text-[#71727A] text-sm">Add AURUM card to Apple Wallet</p>
                  </div>
                </div>
                <ChevronRight size={20} className="text-[#71727A]" />
              </div>
              
              <p className="text-[#71727A] text-sm mb-4">
                Add your AURUM payment card to Apple Wallet for quick and secure payments using Face ID or Touch ID.
              </p>
              
              <button 
                onClick={handleAddToAppleWallet}
                className={`w-full h-12 rounded-xl font-semibold transition-colors ${
                  appleWalletSupported
                    ? 'bg-[#CBAB58] text-[#1F2024] hover:bg-[#b69843]'
                    : 'bg-[#71727A] text-white cursor-not-allowed'
                }`}
                disabled={!appleWalletSupported}
              >
                {appleWalletSupported ? 'Add to Apple Wallet' : 'Not Available on This Device'}
              </button>
            </div>
          </div>

          {/* Wallet Permissions Section */}
          <div className="mb-8">
            <h2 className="text-white text-lg font-semibold mb-4">Wallet Permissions</h2>
            
            <div className="bg-[#2C2D32] rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-white font-medium mb-1">Allow voice-only transactions</h3>
                  <p className="text-[#71727A] text-sm">Enable payments using voice commands without manual confirmation</p>
                </div>
                <button
                  onClick={() => setAllowVoiceTransactions(!allowVoiceTransactions)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    allowVoiceTransactions ? 'bg-[#CBAB58]' : 'bg-[#71727A]'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      allowVoiceTransactions ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Security & Permissions */}
          <div className="mb-8">
            <h2 className="text-white text-lg font-semibold mb-4">Security & Settings</h2>
            
            <div className="space-y-3">
              <button className="w-full bg-[#2C2D32] p-4 rounded-xl flex items-center justify-between hover:bg-[#CBAB58]/10 transition-colors">
                <div className="flex items-center">
                  <Shield size={24} className="text-[#CBAB58] mr-4" />
                  <div className="text-left">
                    <h3 className="text-white font-medium">Advanced Permissions</h3>
                    <p className="text-[#71727A] text-sm">Manage detailed app permissions for connected wallets</p>
                  </div>
                </div>
                <ChevronRight size={20} className="text-[#71727A]" />
              </button>

              <button className="w-full bg-[#2C2D32] p-4 rounded-xl flex items-center justify-between hover:bg-[#CBAB58]/10 transition-colors">
                <div className="flex items-center">
                  <CreditCard size={24} className="text-[#CBAB58] mr-4" />
                  <div className="text-left">
                    <h3 className="text-white font-medium">Payment Methods</h3>
                    <p className="text-[#71727A] text-sm">Manage your connected payment methods</p>
                  </div>
                </div>
                <ChevronRight size={20} className="text-[#71727A]" />
              </button>

              <button className="w-full bg-[#2C2D32] p-4 rounded-xl flex items-center justify-between hover:bg-[#CBAB58]/10 transition-colors">
                <div className="flex items-center">
                  <Settings size={24} className="text-[#CBAB58] mr-4" />
                  <div className="text-left">
                    <h3 className="text-white font-medium">Account Settings</h3>
                    <p className="text-[#71727A] text-sm">Update your account preferences</p>
                  </div>
                </div>
                <ChevronRight size={20} className="text-[#71727A]" />
              </button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mb-8">
            <h2 className="text-white text-lg font-semibold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => navigate("/voice-command")}
                className="bg-[#2C2D32] p-4 rounded-xl flex flex-col items-center hover:bg-[#CBAB58]/10 transition-colors"
              >
                <Wallet size={24} className="text-[#CBAB58] mb-2" />
                <span className="text-white font-medium">Send Payment</span>
              </button>
              <button 
                onClick={() => navigate("/history")}
                className="bg-[#2C2D32] p-4 rounded-xl flex flex-col items-center hover:bg-[#CBAB58]/10 transition-colors"
              >
                <ExternalLink size={24} className="text-[#CBAB58] mb-2" />
                <span className="text-white font-medium">View History</span>
              </button>
            </div>
          </div>

          {/* Powered by Reown */}
          <div className="text-center">
            <p className="text-[#71727A] text-xs">
              Wallet connections powered by{' '}
              <a 
                href="https://reown.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[#CBAB58] hover:underline"
              >
                Reown
              </a>
            </p>
          </div>
        </div>

        <NavigationBar />
      </div>
    </div>
  );
};