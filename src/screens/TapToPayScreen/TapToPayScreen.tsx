import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, CreditCard, Wifi } from "lucide-react";
import { NavigationBar } from "../../components/ui/navigation-bar";

export const TapToPayScreen = (): JSX.Element => {
  const navigate = useNavigate();
  const location = useLocation();
  const requestedAmount = location.state?.amount || 10000;

  useEffect(() => {
    // Simulate NFC payment completion after 3 seconds
    const timer = setTimeout(() => {
      navigate("/payment-confirmation", { 
        state: { 
          from: "tap-to-pay",
          amount: requestedAmount
        } 
      });
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate, requestedAmount]);

  const arsAmount = requestedAmount;
  const serviceFee = arsAmount * 0.03;
  const totalAmount = arsAmount + serviceFee;
  const usdcAmount = (totalAmount * 0.00086).toFixed(8);

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

        <div className="flex flex-col pt-[58px] pb-[83px]">
          <div className="flex items-center px-4 mb-4">
            <button 
              onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-full bg-[#2C2D32] flex items-center justify-center mr-4"
            >
              <ArrowLeft size={20} className="text-white" />
            </button>
            <h1 className="text-2xl font-bold text-white">Tap to Pay</h1>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center px-4">
            <div className="relative mb-8">
              <div className="w-[280px] h-[180px] bg-gradient-to-r from-[#CBAB58] to-[#E1C87D] rounded-2xl shadow-lg flex items-center justify-center">
                <CreditCard size={48} className="text-[#1F2024]" />
              </div>
              <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2">
                <div className="flex flex-col items-center">
                  <Wifi 
                    size={32} 
                    className="text-[#CBAB58] animate-pulse transform rotate-180" 
                  />
                  <Wifi 
                    size={24} 
                    className="text-[#CBAB58] animate-pulse transform rotate-180 -mt-2" 
                  />
                  <Wifi 
                    size={16} 
                    className="text-[#CBAB58] animate-pulse transform rotate-180 -mt-2" 
                  />
                </div>
              </div>
            </div>

            <div className="text-center space-y-2 mb-8">
              <p className="text-white text-lg font-medium">Hold your phone near the payment terminal</p>
              <p className="text-[#71727A]">Double-click the side button to pay</p>
            </div>

            <div className="w-full bg-[#2C2D32] rounded-xl p-6">
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
                <div className="pt-4 border-t border-white/10">
                  <div className="flex items-center justify-center text-[#CBAB58]">
                    <span className="text-sm">Waiting for terminal...</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <NavigationBar />
      </div>
    </div>
  );
};