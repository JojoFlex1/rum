import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card, CardContent } from "../../components/ui/card";
import { Home, History, Import as Passport, Mic, CreditCard, Award, Gift, Settings, MapPin, LogOut, Users, Zap, Send } from "lucide-react";
import { useAuth } from "../../components/AuthProvider";
import { mockUserPoints, formatPointsWithUSD, formatUSDFromPoints, getPointsTier } from "../../lib/points-system";

export const HomeScreen = (): JSX.Element => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();
  const [userLocation, setUserLocation] = useState<string>("Buenos Aires");

  // Get user profile data
  const userProfile = JSON.parse(localStorage.getItem('userProfile') || '{}');
  const connectedSocials = userProfile.connectedSocials || [];
  const userTier = getPointsTier(mockUserPoints.lifetimeEarned);

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}`
            );
            const data = await response.json();
            const city = data.address.city || data.address.town || data.address.village || "Buenos Aires";
            setUserLocation(city);
          } catch (error) {
            console.error("Error fetching location:", error);
            setUserLocation("Buenos Aires");
          }
        },
        (error) => {
          console.error("Geolocation error:", error);
          setUserLocation("Buenos Aires");
        }
      );
    }
  }, []);

  const handleLogout = async () => {
    try {
      await signOut();
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const getUserName = () => {
    // Check user metadata first
    if (user?.user_metadata?.first_name && user.user_metadata.first_name.trim()) {
      return user.user_metadata.first_name.trim();
    }
    
    // Check stored profile data
    if (userProfile.firstName && userProfile.firstName.trim()) {
      return userProfile.firstName.trim();
    }
    
    // Check if there's a stored demo name
    const storedEmail = localStorage.getItem('userEmail');
    if (storedEmail === 'demo@aurum.com') {
      return 'Alex'; // Demo user name
    }
    
    // Return empty string if no name is available
    return '';
  };

  const getGreeting = () => {
    const name = getUserName();
    if (name) {
      return `Good morning, ${name}`;
    }
    return "Good morning";
  };

  return (
    <div className="flex justify-center w-full bg-[#1F2024]">
      <div className="relative w-[393px] h-[853px] overflow-hidden">
        <div className="w-full h-full">
          <div className="relative w-full h-full">
            {/* Background Image */}
            <div className="absolute inset-0 w-full h-full">
              <img 
                src="https://images.pexels.com/photos/1533720/pexels-photo-1533720.jpeg"
                alt="Early morning ocean sunrise with waves"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/20" />
            </div>

            {/* Status Bar */}
            <header className="relative h-[42px] bg-transparent">
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
            <div className="flex flex-col px-6 pt-4 h-[calc(100%-42px)] relative">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">
                    {getGreeting()}
                  </h1>
                  <div className="flex items-center">
                    <MapPin size={20} className="text-[#71727A] mr-2" />
                    <p className="text-xl text-[#71727A]">Ready to explore</p>
                  </div>
                  <p className="text-xl text-[#71727A] ml-7">{userLocation}?</p>
                </div>
                <div className="flex items-center space-x-3">
                  <button 
                    onClick={handleLogout}
                    className="w-10 h-10 rounded-full bg-[#2C2D32]/50 flex items-center justify-center"
                  >
                    <LogOut size={20} className="text-white/60" />
                  </button>
                  <button 
                    onClick={() => navigate("/create-profile")}
                    className="w-10 h-10 rounded-full bg-[#2C2D32]/50 flex items-center justify-center"
                  >
                    <Settings size={20} className="text-white/60" />
                  </button>
                </div>
              </div>

              {/* Points, Connections, and Collectibles Summary */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="bg-[#2C2D32]/40 backdrop-blur-lg rounded-2xl p-4">
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full bg-[#CBAB58] flex items-center justify-center mb-2">
                      <Award size={24} className="text-[#1F2024]" />
                    </div>
                    <p className="text-white text-lg font-bold">{mockUserPoints.totalPoints.toLocaleString()}</p>
                    <p className="text-[#CBAB58] text-xs">{formatUSDFromPoints(mockUserPoints.totalPoints)}</p>
                    <p className="text-[#71727A] text-xs">{userTier.tier} Tier</p>
                  </div>
                </div>
                <div className="bg-[#2C2D32]/40 backdrop-blur-lg rounded-2xl p-4">
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full bg-[#CBAB58] flex items-center justify-center mb-2">
                      <Users size={24} className="text-[#1F2024]" />
                    </div>
                    <p className="text-white text-xl font-bold">11</p>
                    <p className="text-[#CBAB58] text-xs">Friends</p>
                  </div>
                </div>
                <div className="bg-[#2C2D32]/40 backdrop-blur-lg rounded-2xl p-4">
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full bg-[#CBAB58] flex items-center justify-center mb-2">
                      <Gift size={24} className="text-[#1F2024]" />
                    </div>
                    <p className="text-white text-xl font-bold">70</p>
                    <p className="text-[#CBAB58] text-xs">NFTs</p>
                  </div>
                </div>
              </div>

              {/* Spacer to push content down */}
              <div className="flex-grow" />

              {/* Voice Command Button */}
              <div className="flex flex-col items-center mb-8">
                <button 
                  onClick={() => navigate("/voice-command")}
                  className="w-32 h-32 rounded-full bg-[#CBAB58] flex items-center justify-center shadow-lg mb-4"
                >
                  <Mic size={64} className="text-[#1F2024]" />
                </button>
                <p className="text-[#71727A] text-sm">Tap to speak</p>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-center space-x-12 mb-24">
                <button 
                  onClick={() => navigate("/voice-command")}
                  className="w-36 h-12 rounded-2xl bg-[#CBAB58] flex items-center justify-center shadow-lg"
                >
                  <Send size={20} className="text-[#1F2024] mr-1" />
                  <span className="text-[#1F2024] text-lg font-semibold">Pay</span>
                </button>
                <button 
                  onClick={() => navigate("/collectibles")}
                  className="w-36 h-12 rounded-2xl bg-[#CBAB58] flex items-center justify-center shadow-lg"
                >
                  <Zap size={20} className="text-[#1F2024] mr-1" />
                  <span className="text-[#1F2024] text-lg font-semibold">Collect</span>
                </button>
              </div>

              {/* Navigation Bar */}
              <div className="absolute bottom-0 left-0 right-0 h-[83px] bg-[#1F2024]/80 backdrop-blur-lg border-t border-white/10">
                <div className="flex justify-around items-center h-full">
                  <button 
                    onClick={() => navigate("/payments")}
                    className="flex flex-col items-center"
                  >
                    <CreditCard size={24} className={location.pathname === "/payments" ? "text-[#CBAB58]" : "text-white/60"} />
                    <span className={location.pathname === "/payments" ? "text-[#CBAB58] text-xs mt-1" : "text-white/60 text-xs mt-1"}>Wallet</span>
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};