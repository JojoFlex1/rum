import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { CheckCircle2, Clock, Award, ExternalLink, Copy } from "lucide-react";
import { NavigationBar } from "../../components/ui/navigation-bar";
import { formatAddressForDisplay, getNetworkDisplayName, getNetworkColor } from "../../lib/crypto-utils";
import { calculatePaymentPoints, formatPointsWithUSD, formatUSDFromPoints } from "../../lib/points-system";

export const PaymentConfirmationScreen = (): JSX.Element => {
  const navigate = useNavigate();
  const location = useLocation();
  const requestedAmount = location.state?.amount || 10000;
  const walletAddress = location.state?.walletAddress;
  const network = location.state?.network || 'ethereum';
  const arsAmount = requestedAmount;
  const serviceFee = arsAmount * 0.03;
  const isATM = location.state?.from === "cash-to-pay";
  const atmFee = isATM ? arsAmount * 0.05 : 0;
  const totalAmount = arsAmount + serviceFee + atmFee;
  const usdcAmount = (totalAmount * 0.00086).toFixed(8);
  
  // Calculate points earned (convert ARS to USD first, then calculate points)
  const totalAmountUSD = totalAmount * 0.00086 * 1163; // Convert to USD (rough rate)
  const pointsEarned = calculatePaymentPoints(totalAmountUSD);

  const getPaymentMethod = () => {
    const path = location.state?.from || "";
    if (path === "cash-to-pay") return "cash";
    if (path === "scan-to-pay") return "scan";
    if (path === "tap-to-pay") return "tap";
    return "tap";
  };

  const getPaymentDetails = () => {
    const method = getPaymentMethod();
    switch (method) {
      case "cash":
        return {
          label: "ATM Location",
          value: "ATM Banco Galicia"
        };
      case "scan":
        return {
          label: "Recipient Wallet",
          value: walletAddress ? formatAddressForDisplay(walletAddress) : "0x1234...5678"
        };
      case "tap":
        return {
          label: "Terminal #",
          value: "T-789012"
        };
    }
  };

  const paymentDetails = getPaymentDetails();

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const openBlockExplorer = () => {
    if (!walletAddress) return;
    
    let explorerUrl = '';
    switch (network) {
      case 'ethereum':
        explorerUrl = `https://etherscan.io/address/${walletAddress}`;
        break;
      case 'bitcoin':
        explorerUrl = `https://blockstream.info/address/${walletAddress}`;
        break;
      case 'solana':
        explorerUrl = `https://explorer.solana.com/address/${walletAddress}`;
        break;
      default:
        return;
    }
    
    window.open(explorerUrl, '_blank');
  };

  useEffect(() => {
    const handleBackButton = (e: TouchEvent) => {
      e.preventDefault();
      navigate("/home");
    };

    window.addEventListener("touchstart", handleBackButton);

    return () => {
      window.removeEventListener("touchstart", handleBackButton);
    };
  }, [navigate]);

  return (
    <div className="flex justify-center w-full bg-[#1F2024]">
      <div className="relative w-[393px] bg-[#1F2024]">
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

        <div className="flex flex-col items-center justify-center min-h-screen px-4 pt-[42px] pb-[83px]">
          <div className="mb-8">
            <CheckCircle2 size={80} className="text-[#CBAB58]" />
          </div>

          <h1 className="text-2xl font-bold text-white mb-2">Payment Confirmed!</h1>
          <p className="text-[#71727A] text-center mb-12">
            Your payment has been processed successfully
          </p>

          <div className="w-full bg-[#CBAB58]/10 border border-[#CBAB58] rounded-xl p-6 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Award size={24} className="text-[#CBAB58] mr-3" />
                <div>
                  <span className="text-white">Points Earned</span>
                  <p className="text-[#CBAB58] text-sm">{formatUSDFromPoints(pointsEarned)} cashback value</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[#CBAB58] font-bold text-xl">+{pointsEarned}</span>
                <p className="text-[#71727A] text-sm">{formatUSDFromPoints(pointsEarned)}</p>
              </div>
            </div>
          </div>

          <div className="w-full bg-[#2C2D32] rounded-xl p-6 mb-8">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-white/60">Amount (ARS)</span>
                <span className="text-white font-medium">
                  {arsAmount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/60">Service Fee (3%)</span>
                <span className="text-[#71727A] font-medium">
                  {serviceFee.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              {isATM && (
                <div className="flex justify-between items-center">
                  <span className="text-white/60">ATM Fee (5%)</span>
                  <span className="text-[#71727A] font-medium">
                    {atmFee.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-white/60">Total (ARS)</span>
                <span className="text-white font-medium">
                  {totalAmount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/60">Amount (USDC)</span>
                <span className="text-[#CBAB58] font-medium">≈ {usdcAmount} USDC</span>
              </div>
              
              {/* Wallet Information */}
              {walletAddress && (
                <>
                  <div className="pt-4 border-t border-white/10">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-white/60">Network</span>
                      <div className="flex items-center">
                        <div 
                          className="w-3 h-3 rounded-full mr-2" 
                          style={{ backgroundColor: getNetworkColor(network) }}
                        />
                        <span className="text-white font-medium">
                          {getNetworkDisplayName(network)}
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-white/60">Recipient</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-white font-mono text-sm">
                          {formatAddressForDisplay(walletAddress)}
                        </span>
                        <button
                          onClick={() => copyToClipboard(walletAddress)}
                          className="p-1 rounded hover:bg-white/10 transition-colors"
                        >
                          <Copy size={14} className="text-[#71727A]" />
                        </button>
                        <button
                          onClick={openBlockExplorer}
                          className="p-1 rounded hover:bg-white/10 transition-colors"
                        >
                          <ExternalLink size={14} className="text-[#71727A]" />
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}
              
              <div className="pt-4 border-t border-white/10">
                <div className="flex items-center text-[#CBAB58]">
                  <Clock size={20} className="mr-2" />
                  <span className="text-sm">Transaction completed</span>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full bg-[#2C2D32] rounded-xl p-6 mb-12">
            <h3 className="text-white/60 mb-2">Reference Number</h3>
            <p className="text-white font-medium">AUR-2025-0234-5678</p>
          </div>

          <div className="w-full space-y-4">
            <button 
              onClick={() => navigate("/home")}
              className="w-full h-[52px] bg-[#CBAB58] text-[#1F2024] font-semibold rounded-xl hover:bg-[#b69843] transition-colors"
            >
              Back to Home
            </button>
            <button className="w-full h-[52px] bg-transparent border border-[#CBAB58] text-[#CBAB58] font-semibold rounded-xl hover:bg-[#CBAB58]/10 transition-colors">
              Download Receipt
            </button>
          </div>
        </div>

        <NavigationBar />
      </div>
    </div>
  );
};