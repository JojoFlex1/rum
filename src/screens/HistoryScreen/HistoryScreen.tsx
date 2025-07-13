import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Download, ChevronRight, Wallet, CreditCard, Banknote, QrCode, X, Calendar } from "lucide-react";
import { NavigationBar } from "../../components/ui/navigation-bar";
import { calculatePaymentPoints, formatUSDFromPoints } from "../../lib/points-system";

export const HistoryScreen = (): JSX.Element => {
  const navigate = useNavigate();
  const [showDownloadPopup, setShowDownloadPopup] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const transactions = [
    {
      id: 1,
      title: "La Cabrera",
      date: "Aug 15, 2025",
      amount: "ARS 87,209",
      cryptoAmount: "75.00 USDC",
      paymentMethod: "crypto",
      category: "Restaurant",
      pointsEarned: 87
    },
    {
      id: 2,
      title: "Café Martinez",
      date: "Aug 15, 2025",
      amount: "ARS 9,884",
      cryptoAmount: "8.50 USDC",
      paymentMethod: "cash",
      category: "Coffee Shop",
      pointsEarned: 10
    },
    {
      id: 3,
      title: "Teatro Colón",
      date: "Aug 14, 2025",
      amount: "ARS 34,884",
      cryptoAmount: "30.00 USDC",
      paymentMethod: "crypto",
      category: "Tourism",
      pointsEarned: 35
    },
    {
      id: 4,
      title: "BA Taxi",
      date: "Aug 14, 2025",
      amount: "ARS 17,442",
      cryptoAmount: "15.00 USDC",
      paymentMethod: "cash",
      category: "Transportation",
      pointsEarned: 17
    },
    {
      id: 5,
      title: "Don Julio",
      date: "Aug 13, 2025",
      amount: "ARS 98,837",
      cryptoAmount: "85.00 USDC",
      paymentMethod: "card",
      category: "Restaurant",
      pointsEarned: 99
    }
  ];

  const getPaymentIcon = (method: string) => {
    switch (method) {
      case "crypto":
        return <QrCode size={24} className="text-[#CBAB58]" />;
      case "cash":
        return <Banknote size={24} className="text-[#CBAB58]" />;
      case "atm":
        return <Wallet size={24} className="text-[#CBAB58]" />;
      default:
        return <CreditCard size={24} className="text-[#CBAB58]" />;
    }
  };

  const getPaymentLabel = (method: string) => {
    switch (method) {
      case "crypto":
        return "Crypto Payment";
      case "cash":
        return "Cash Payment";
      case "atm":
        return "ATM Withdrawal";
      default:
        return "Card Payment";
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
            {transactions.map((transaction) => (
              <div 
                key={transaction.id}
                className="flex items-center justify-between p-4 bg-[#2C2D32] rounded-xl"
              >
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full bg-[#CBAB58]/10 flex items-center justify-center mr-4">
                    {getPaymentIcon(transaction.paymentMethod)}
                  </div>
                  <div>
                    <h3 className="text-white font-medium">{transaction.title}</h3>
                    <div className="flex items-center space-x-2">
                      <span className="text-[#CBAB58] text-xs">{transaction.category}</span>
                      <span className="text-white/60 text-xs">•</span>
                      <span className="text-white/60 text-xs">{getPaymentLabel(transaction.paymentMethod)}</span>
                      <span className="text-white/60 text-xs">•</span>
                      <span className="text-white/60 text-xs">{transaction.date}</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-white font-medium">-{transaction.amount}</span>
                  <span className="text-[#CBAB58] text-sm">-{transaction.cryptoAmount}</span>
                  <span className="text-green-400 text-xs">+{transaction.pointsEarned} pts ({formatUSDFromPoints(transaction.pointsEarned)})</span>
                </div>
              </div>
            ))}
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