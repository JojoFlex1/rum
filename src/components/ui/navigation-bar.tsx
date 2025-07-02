import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Home, History, Import as Passport, Mic, CreditCard, Award, Gift } from "lucide-react";

export const NavigationBar = (): JSX.Element => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="fixed bottom-0 left-0 right-0 h-[83px] bg-[#1F2024]/80 backdrop-blur-lg border-t border-white/10">
      <div className="flex justify-around items-center h-full">
        <button 
          onClick={() => navigate("/payments")}
          className="flex flex-col items-center"
        >
          <CreditCard size={24} className={location.pathname === "/payments" ? "text-[#CBAB58]" : "text-white/60"} />
          <span className={location.pathname === "/payments" ? "text-[#CBAB58] text-xs mt-1" : "text-white/60 text-xs mt-1"}>Accounts</span>
        </button>
        <button 
          onClick={() => navigate("/offers")}
          className="flex flex-col items-center"
        >
          <Gift size={24} className={location.pathname === "/offers" ? "text-[#CBAB58]" : "text-white/60"} />
          <span className={location.pathname === "/offers" ? "text-[#CBAB58] text-xs mt-1" : "text-white/60 text-xs mt-1"}>Offers</span>
        </button>
        <button 
          onClick={() => navigate("/home")}
          className="flex flex-col items-center"
        >
          <Home size={24} className={location.pathname === "/home" ? "text-[#CBAB58]" : "text-white/60"} />
          <span className={location.pathname === "/home" ? "text-[#CBAB58] text-xs mt-1" : "text-white/60 text-xs mt-1"}>Home</span>
        </button>
        <button 
          onClick={() => navigate("/history")}
          className="flex flex-col items-center"
        >
          <History size={24} className={location.pathname === "/history" ? "text-[#CBAB58]" : "text-white/60"} />
          <span className={location.pathname === "/history" ? "text-[#CBAB58] text-xs mt-1" : "text-white/60 text-xs mt-1"}>History</span>
        </button>
        <button 
          onClick={() => navigate("/passport")}
          className="flex flex-col items-center"
        >
          <Passport size={24} className={location.pathname === "/passport" ? "text-[#CBAB58]" : "text-white/60"} />
          <span className={location.pathname === "/passport" ? "text-[#CBAB58] text-xs mt-1" : "text-white/60 text-xs mt-1"}>Passport</span>
        </button>
      </div>
    </div>
  );
};