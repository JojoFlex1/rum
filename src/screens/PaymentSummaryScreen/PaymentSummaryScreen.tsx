import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import { NavigationBar } from "../../components/ui/navigation-bar";

export const PaymentSummaryScreen = (): JSX.Element => {
  const navigate = useNavigate();
  const location = useLocation();
  const requestedAmount = location.state?.amount || 10000;
  const arsAmount = requestedAmount;
  const serviceFee = arsAmount * 0.03;
  const isATM = location.state?.from === "cash-to-pay";
  const atmFee = isATM ? arsAmount * 0.05 : 0;
  const totalAmount = arsAmount + serviceFee + atmFee;
  const usdcAmount = (totalAmount * 0.00086).toFixed(8);

  const handleConfirm = () => {
    navigate("/payment-confirmation", { 
      state: { 
        from: location.state?.from || "tap-to-pay",
        amount: requestedAmount
      } 
    });
  };

  const getPaymentMethod = () => {
    const path = location.state?.from || "";
    if (path.includes("cash-to-pay")) return "cash";
    if (path.includes("scan-to-pay")) return "scan";
    if (path.includes("tap-to-pay")) return "tap";
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
          label: "Wallet Address",
          value: "0x1234...5678"
        };
      case "tap":
        return {
          label: "Terminal #",
          value: "T-789012"
        };
    }
  };

  const paymentDetails = getPaymentDetails();

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

        <div className="flex flex-col px-4 pt-[58px] pb-[83px]">
          <div className="flex items-center mb-8">
            <button 
              onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-full bg-[#2C2D32] flex items-center justify-center mr-4"
            >
              <ArrowLeft size={20} className="text-white" />
            </button>
            <h1 className="text-2xl font-bold text-white">Payment Summary</h1>
          </div>

          <div className="bg-[#CBAB58]/10 border border-[#CBAB58] rounded-xl p-6 mb-8">
            <div className="flex items-center mb-4">
              <AlertTriangle size={24} className="text-[#CBAB58] mr-3" />
              <h2 className="text-[#CBAB58] font-semibold">Important Notice</h2>
            </div>
            <p className="text-white/80 text-sm leading-relaxed">
              This is a permanent action that cannot be undone. Please verify all details before confirming the transaction.
            </p>
          </div>

          <div className="bg-[#2C2D32] rounded-xl p-6 mb-8">
            <h2 className="text-white font-semibold mb-4">Payment Details</h2>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-white/60">Amount (ARS)</span>
                <span className="text-white font-medium">
                  {arsAmount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Service Fee (3%)</span>
                <span className="text-[#71727A] font-medium">
                  {serviceFee.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              {isATM && (
                <div className="flex justify-between">
                  <span className="text-white/60">ATM Fee (5%)</span>
                  <span className="text-[#71727A] font-medium">
                    {atmFee.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-white/60">Total (ARS)</span>
                <span className="text-white font-medium">
                  {totalAmount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Amount (USDC)</span>
                <span className="text-[#CBAB58] font-medium">≈ {usdcAmount} USDC</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">{paymentDetails?.label}</span>
                <span className="text-white font-medium">{paymentDetails?.value}</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <button 
              onClick={handleConfirm}
              className="w-full h-[52px] bg-[#CBAB58] text-[#1F2024] font-semibold rounded-xl hover:bg-[#b69843] transition-colors"
            >
              Confirm & Pay
            </button>
            <button 
              onClick={() => navigate(-1)}
              className="w-full h-[52px] bg-transparent border border-[#CBAB58] text-[#CBAB58] font-semibold rounded-xl hover:bg-[#CBAB58]/10 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>

        <NavigationBar />
      </div>
    </div>
  );
};