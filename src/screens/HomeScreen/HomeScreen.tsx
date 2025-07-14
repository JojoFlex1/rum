import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Home, History, Import as Passport, Mic, CreditCard, Award, Gift, Settings, MapPin, LogOut, Users, Zap, Send } from "lucide-react";
import { useAuth } from "../../components/AuthProvider";
import { NavigationBar } from "../../components/ui/navigation-bar";
import { SkipLink } from "../../components/SkipLink";
import { LiveRegion } from "../../components/LiveRegion";
import { AccessibleButton } from "../../components/AccessibleButton";
import { useAnnouncement } from "../../hooks/useAnnouncement";
import { useFocusManagement } from "../../hooks/useFocusManagement";
import { formatPointsWithUSD, formatUSDFromPoints, getPointsTier } from "../../lib/points-system";
import { useTransactions } from "../../hooks/useTransactions";

export const HomeScreen = (): JSX.Element => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();
  const [userLocation, setUserLocation] = useState<string>("Buenos Aires");
  const { announcement, announce } = useAnnouncement();
  const { elementRef: mainRef } = useFocusManagement(true);

  // Get actual transaction data
  const { totalPoints, transactions } = useTransactions();

  // Get user profile data
  const userProfile = JSON.parse(localStorage.getItem('userProfile') || '{}');
  const connectedSocials = userProfile.connectedSocials || [];
  const userTier = getPointsTier(totalPoints);

  useEffect(() => {
    // Announce page load
    announce("Home screen loaded. Ready to explore payments and rewards.");

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
            announce(`Location updated to ${city}`);
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
  }, [announce]);

  const handleLogout = async () => {
    try {
      await signOut();
      announce("Signed out successfully");
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
      announce("Error signing out. Please try again.");
    }
  };

  const handleVoiceCommand = () => {
    announce("Opening voice command interface");
    navigate("/voice-command");
  };

  const handleSendPayment = () => {
    announce("Opening payment interface");
    navigate("/voice-command");
  };

  const handleCollectNFTs = () => {
    announce("Opening collectibles interface");
    navigate("/collectibles");
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
      <SkipLink />
      <LiveRegion message={announcement} />
      
      <div className="relative w-[393px] h-[853px] overflow-hidden">
        <div className="w-full h-full">
          <div className="relative w-full h-full">
            {/* Background Image */}
            <div className="absolute inset-0 w-full h-full">
              <img 
                src="https://images.pexels.com/photos/1533720/pexels-photo-1533720.jpeg"
                alt="Early morning ocean sunrise with gentle waves creating a peaceful atmosphere"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/20" aria-hidden="true" />
            </div>

            {/* Status Bar */}
            <header className="relative h-[42px] bg-transparent" role="banner">
              <div className="absolute w-14 h-[17px] top-[13px] left-[21px]">
                <time 
                  className="absolute w-[54px] -top-px left-0 [font-family:'SF_Pro_Text-Semibold',Helvetica] font-normal text-white text-[15px] text-center tracking-[-0.17px] leading-[normal]"
                  dateTime="03:33"
                  aria-label="Current time: 3:33"
                >
                  3:33
                </time>
              </div>

              <div className="absolute w-[68px] h-3.5 top-[15px] left-[311px] overflow-hidden" aria-label="Device status indicators">
                <div 
                  className="absolute -top-1 left-[41px] [font-family:'SF_Pro_Text-Regular',Helvetica] font-normal text-white text-[17px] tracking-[0] leading-[normal] whitespace-nowrap" 
                  aria-label="Battery at full charge"
                >
                  􀛨
                </div>

                <img
                  className="absolute w-[17px] h-[11px] top-0.5 left-0"
                  alt="Full signal strength"
                  src="/signal.svg"
                />

                <div 
                  className="absolute -top-0.5 left-[21px] [font-family:'SF_Pro_Text-Regular',Helvetica] font-normal text-white text-sm tracking-[0] leading-[normal]" 
                  aria-label="WiFi connected"
                >
                  􀙇
                </div>
              </div>
            </header>

            {/* Main Content */}
            <main 
              id="main-content"
              ref={mainRef}
              className="flex flex-col px-6 pt-4 h-[calc(100%-42px)] relative"
              tabIndex={-1}
            >
              {/* Header Section */}
              <section className="flex items-center justify-between mb-8" aria-labelledby="welcome-heading">
                <div>
                  <h1 id="welcome-heading" className="text-3xl font-bold text-white mb-2">
                    {getGreeting()}
                  </h1>
                  <div className="flex items-center">
                    <MapPin size={20} className="text-[#9ca3af] mr-2" aria-hidden="true" />
                    <p className="text-xl text-[#9ca3af]" aria-label={`Ready to explore ${userLocation}`}>
                      Ready to explore {userLocation}?
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3" role="group" aria-label="Account actions">
                  <AccessibleButton
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                    ariaLabel="Sign out of account"
                    className="w-10 h-10 rounded-full bg-[#2C2D32]/50 hover:bg-[#2C2D32]/70 p-0"
                    leftIcon={<LogOut size={20} className="text-white/60" />}
                  />
                  <AccessibleButton
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate("/create-profile")}
                    ariaLabel="Edit profile settings"
                    className="w-10 h-10 rounded-full bg-[#2C2D32]/50 hover:bg-[#2C2D32]/70 p-0"
                    leftIcon={<Settings size={20} className="text-white/60" />}
                  />
                </div>
              </section>

              {/* Stats Summary */}
              <section className="grid grid-cols-3 gap-4 mb-8" aria-labelledby="stats-heading">
                <h2 id="stats-heading" className="sr-only">Account Statistics</h2>
                
                <div 
                  className="bg-[#2C2D32]/40 backdrop-blur-lg rounded-2xl p-4 focus-within:ring-2 focus-within:ring-[#CBAB58] focus-within:ring-offset-2 focus-within:ring-offset-transparent" 
                  role="group" 
                  aria-labelledby="points-stat"
                  tabIndex={0}
                >
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full bg-[#CBAB58] flex items-center justify-center mb-2" aria-hidden="true">
                      <Award size={24} className="text-[#1F2024]" />
                    </div>
                    <p 
                      id="points-stat" 
                      className="text-white text-lg font-bold" 
                      aria-label={`${totalPoints.toLocaleString()} reward points worth ${formatUSDFromPoints(totalPoints)}`}
                    >
                      {totalPoints.toLocaleString()}
                    </p>
                    <p className="text-[#E1C87D] text-xs font-medium" aria-hidden="true">
                      Points
                    </p>
                  </div>
                </div>

                <div 
                  className="bg-[#2C2D32]/40 backdrop-blur-lg rounded-2xl p-4 focus-within:ring-2 focus-within:ring-[#CBAB58] focus-within:ring-offset-2 focus-within:ring-offset-transparent" 
                  role="group" 
                  aria-labelledby="friends-stat"
                  tabIndex={0}
                >
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full bg-[#CBAB58] flex items-center justify-center mb-2" aria-hidden="true">
                      <Users size={24} className="text-[#1F2024]" />
                    </div>
                    <p id="friends-stat" className="text-white text-xl font-bold" aria-label="11 connected friends">
                      11
                    </p>
                    <p className="text-[#E1C87D] text-xs font-medium">Friends</p>
                  </div>
                </div>

                <div 
                  className="bg-[#2C2D32]/40 backdrop-blur-lg rounded-2xl p-4 focus-within:ring-2 focus-within:ring-[#CBAB58] focus-within:ring-offset-2 focus-within:ring-offset-transparent" 
                  role="group" 
                  aria-labelledby="nfts-stat"
                  tabIndex={0}
                >
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full bg-[#CBAB58] flex items-center justify-center mb-2" aria-hidden="true">
                      <Gift size={24} className="text-[#1F2024]" />
                    </div>
                    <p id="nfts-stat" className="text-white text-xl font-bold" aria-label="70 collected NFTs">
                      70
                    </p>
                    <p className="text-[#E1C87D] text-xs font-medium">NFTs</p>
                  </div>
                </div>
              </section>

              {/* Spacer to push content down */}
              <div className="flex-grow" />

              {/* Voice Command Section */}
              <section className="flex flex-col items-center mb-8" aria-labelledby="voice-section">
                <h2 id="voice-section" className="sr-only">Voice Commands</h2>
                <AccessibleButton
                  variant="primary"
                  onClick={handleVoiceCommand}
                  ariaLabel="Start voice command for payments. Say commands like 'Send 100 pesos using scan to pay'"
                  className="w-32 h-32 rounded-full shadow-lg mb-4 hover:shadow-xl"
                  leftIcon={<Mic size={64} />}
                >
                  <span className="sr-only">Voice Command</span>
                </AccessibleButton>
                <p className="text-[#9ca3af] text-center" aria-hidden="true">
                  Tap to speak your payment
                </p>
              </section>

              {/* Quick Actions */}
              <section className="mb-24" aria-labelledby="quick-actions">
                <h2 id="quick-actions" className="sr-only">Quick Actions</h2>
                <div className="flex justify-center space-x-6">
                  <AccessibleButton
                    variant="primary"
                    size="lg"
                    onClick={handleSendPayment}
                    ariaLabel="Send payment to someone using voice commands or manual input"
                    className="w-36 shadow-lg hover:shadow-xl"
                    leftIcon={<Send size={20} />}
                  >
                    Send
                  </AccessibleButton>
                  <AccessibleButton
                    variant="primary"
                    size="lg"
                    onClick={handleCollectNFTs}
                    ariaLabel="Collect NFTs and rewards by scanning QR codes or exploring nearby locations"
                    className="w-36 shadow-lg hover:shadow-xl"
                    leftIcon={<Zap size={20} />}
                  >
                    Collect
                  </AccessibleButton>
                </div>
              </section>
            </main>

            <NavigationBar />
          </div>
        </div>
      </div>
    </div>
  );
};