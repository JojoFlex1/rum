import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Download, ChevronRight, Wallet, CreditCard, Banknote, QrCode, X, Calendar, ExternalLink, Copy, Check } from "lucide-react";
import { NavigationBar } from "../../components/ui/navigation-bar";
import { formatUSDFromPoints } from "../../lib/points-system";
import { useTransactions } from "../../hooks/useTransactions";
import { formatAddressForDisplay, getNetworkDisplayName, getNetworkColor } from "../../lib/crypto-utils";

export const HistoryScreen = (): JSX.Element => {
  const navigate = useNavigate();
  const [showDownloadPopup, setShowDownloadPopup] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

  // Get actual transaction data
  const { transactions, isLoading } = useTransactions();

  const getPaymentIcon = (method: string) => {
    switch (method) {
      case "crypto":
      case "scan":
        return <QrCode size={20} className="text-[#CBAB58]" />;
      case "cash":
        return <Banknote size={20} className="text-[#CBAB58]" />;
      case "tap":
        return <Wallet size={20} className="text-[#CBAB58]" />;
      default:
        return <CreditCard size={20} className="text-[#CBAB58]" />;
    }
  };

  const getPaymentTypeLabel = (method: string) => {
    switch (method) {
      case "crypto":
      case "scan":
        return "Crypto Payment";
      case "cash":
        return "Cash Payment";
      case "tap":
        return "Tap Payment";
      default:
        return "Card Payment";
    }
  };

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case "crypto":
      case "scan":
        return "QR Scan";
      case "cash":
        return "ATM";
      case "tap":
        return "NFC Tap";
      default:
        return "Card";
    }
  };

  const handleDownload = () => {
    setShowDownloadPopup(true);
  };

  const handleConfirmDownload = () => {
    // In a real app, this would trigger a CSV/PDF download with the date parameters
    console.log("Downloading transactions from", startDate, "to", endDate);
    setShowDownloadPopup(false);
    setStartDate("");
    setEndDate("");
  };

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedAddress(id);
      setTimeout(() => setCopiedAddress(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const openBlockExplorer = (hash: string, network: string) => {
    if (!hash) return;
    
    let explorerUrl = '';
    switch (network) {
      case 'ethereum':
        explorerUrl = `https://etherscan.io/tx/${hash}`;
        break;
      case 'bitcoin':
        explorerUrl = `https://blockstream.info/tx/${hash}`;
        break;
      case 'solana':
        explorerUrl = `https://explorer.solana.com/tx/${hash}`;
        break;
      case 'algorand':
        explorerUrl = `https://algoexplorer.io/tx/${hash}`;
        break;
      default:
        return;
    }
    
    window.open(explorerUrl, '_blank');
  };

  return (
    <div className="flex justify-center w-full bg-[#1F2024]">
      <div className="relative w-[393px] bg-[#1F2024]">
        {/* Status Bar */}
        <header className="fixed top-0 w-[393px] z-50 h-[42px] bg-[#1F2024] backdrop-blur-[20px] backdrop-brightness-[100%] [-webkit-backdrop-filter:blur(20px)_brightness(100%)]">
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

        {/* Main Content */}
        <div className="flex flex-col px-4 pt-[58px] pb-[83px]">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <button 
                onClick={() => navigate(-1)}
                className="w-10 h-10 rounded-full bg-[#2C2D32] flex items-center justify-center mr-4"
              >
                <ArrowLeft size={20} className="text-white" />
              </button>
              <h1 className="text-2xl font-bold text-white">Transaction History</h1>
            </div>
            <button 
              onClick={handleDownload}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-[#2C2D32]"
            >
              <Download size={20} className="text-[#CBAB58]" />
            </button>
          </div>

          {/* Transactions List */}
          <div className="space-y-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#CBAB58]"></div>
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-12">
                <Wallet size={48} className="text-[#71727A] mx-auto mb-4" />
                <p className="text-[#71727A] text-lg font-medium">No transactions yet</p>
                <p className="text-[#71727A] text-sm mt-2">Complete a payment to see your transaction history</p>
              </div>
            ) : (
              transactions.map((transaction, index) => (
                <div 
                  key={transaction.id}
                  className="bg-[#2C2D32] rounded-xl p-4 border border-[#71727A]/20"
                >
                  {/* Transaction Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-[#CBAB58]/10 flex items-center justify-center mr-3">
                        {getPaymentIcon(transaction.payment_method)}
                      </div>
                      <div>
                        <h3 className="text-white font-semibold">Transaction #{transactions.length - index}</h3>
                        <p className="text-[#71727A] text-sm">{transaction.date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[#CBAB58] font-bold">+{transaction.points_earned} pts</p>
                      <p className="text-[#71727A] text-xs">{formatUSDFromPoints(transaction.points_earned)}</p>
                    </div>
                  </div>

                  {/* Transaction Details Grid */}
                  <div className="space-y-3">
                    {/* Wallet Address */}
                    {transaction.wallet_address && (
                      <div className="flex items-center justify-between">
                        <span className="text-[#71727A] text-sm">Wallet Address</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-white font-mono text-sm">
                            {formatAddressForDisplay(transaction.wallet_address)}
                          </span>
                          <button
                            onClick={() => copyToClipboard(transaction.wallet_address!, transaction.id)}
                            className="p-1 rounded hover:bg-[#1F2024] transition-colors"
                          >
                            {copiedAddress === transaction.id ? (
                              <Check size={14} className="text-green-500" />
                            ) : (
                              <Copy size={14} className="text-[#71727A]" />
                            )}
                          </button>
                          {transaction.transaction_hash && (
                            <button
                              onClick={() => openBlockExplorer(transaction.transaction_hash!, transaction.network || 'ethereum')}
                              className="p-1 rounded hover:bg-[#1F2024] transition-colors"
                            >
                              <ExternalLink size={14} className="text-[#71727A]" />
                            </button>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Amount */}
                    <div className="flex items-center justify-between">
                      <span className="text-[#71727A] text-sm">Amount</span>
                      <div className="text-right">
                        <p className="text-white font-medium">
                          ARS {transaction.amount_ars.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                        <p className="text-[#CBAB58] text-sm">
                          {transaction.amount_crypto.toFixed(6)} {transaction.crypto_symbol}
                        </p>
                      </div>
                    </div>

                    {/* Payment Type & Method */}
                    <div className="flex items-center justify-between">
                      <span className="text-[#71727A] text-sm">Payment Type</span>
                      <span className="text-white text-sm">{getPaymentTypeLabel(transaction.payment_method)}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-[#71727A] text-sm">Payment Method</span>
                      <span className="text-white text-sm">{getPaymentMethodLabel(transaction.payment_method)}</span>
                    </div>

                    {/* Blockchain */}
                    {transaction.network && (
                      <div className="flex items-center justify-between">
                        <span className="text-[#71727A] text-sm">Blockchain</span>
                        <div className="flex items-center">
                          <div 
                            className="w-3 h-3 rounded-full mr-2" 
                            style={{ backgroundColor: getNetworkColor(transaction.network) }}
                          />
                          <span className="text-white text-sm">
                            {getNetworkDisplayName(transaction.network)}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Points Earned */}
                    <div className="flex items-center justify-between pt-2 border-t border-[#71727A]/20">
                      <span className="text-[#71727A] text-sm">Points Earned</span>
                      <div className="text-right">
                        <p className="text-[#CBAB58] font-semibold">{transaction.points_earned} points</p>
                        <p className="text-[#71727A] text-xs">≈ {formatUSDFromPoints(transaction.points_earned)} value</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Download Popup */}
          {showDownloadPopup && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="w-[340px] bg-[#2C2D32] rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-white text-lg font-semibold">Download Transactions</h2>
                  <button 
                    onClick={() => setShowDownloadPopup(false)}
                    className="w-8 h-8 rounded-full bg-[#1F2024] flex items-center justify-center"
                  >
                    <X size={16} className="text-white" />
                  </button>
                </div>

                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-white/60 mb-2">Start Date</label>
                    <div className="relative">
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full h-12 px-4 bg-[#1F2024] text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-[#CBAB58]"
                      />
                      <Calendar size={16} className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#CBAB58]" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-white/60 mb-2">End Date</label>
                    <div className="relative">
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full h-12 px-4 bg-[#1F2024] text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-[#CBAB58]"
                      />
                      <Calendar size={16} className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#CBAB58]" />
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleConfirmDownload}
                  disabled={!startDate || !endDate}
                  className={`w-full h-12 rounded-xl font-semibold ${
                    startDate && endDate
                      ? 'bg-[#CBAB58] text-[#1F2024] hover:bg-[#b69843]'
                      : 'bg-[#71727A] text-white/60 cursor-not-allowed'
                  }`}
                >
                  Download
                </button>
              </div>
            </div>
          )}
        </div>

        <NavigationBar />
      </div>
    </div>
  );
};