import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Users, Share2, Trophy, Twitter, Instagram, Facebook, Settings, Edit3, Camera, MapPin } from "lucide-react";
import { NavigationBar } from "../../components/ui/navigation-bar";

export const ConnectScreen = (): JSX.Element => {
  const navigate = useNavigate();
  
  // Get user profile data (in real app, this would come from auth context)
  const userProfile = JSON.parse(localStorage.getItem('userProfile') || '{}');
  const connectedSocials = userProfile.connectedSocials || [];

  return (
    <div className="flex justify-center w-full bg-[#1F2024]">
      <div className="relative w-[393px] bg-[#1F2024]">
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

        <div className="flex flex-col pt-[58px] pb-[83px]">
          <div className="flex items-center px-4 mb-6">
            <button 
              onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-full bg-[#2C2D32] flex items-center justify-center mr-4"
            >
              <ArrowLeft size={20} className="text-white" />
            </button>
            <h1 className="text-2xl font-bold text-white">Profile & Connections</h1>
          </div>

          {/* User Profile Section */}
          <div className="px-4 mb-8">
            <div className="bg-[#2C2D32] rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className="w-16 h-16 rounded-full bg-[#CBAB58]/20 flex items-center justify-center mr-4 overflow-hidden">
                    {userProfile.image ? (
                      <img src={userProfile.image} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <Camera size={24} className="text-[#CBAB58]" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-white text-lg font-semibold">
                      {userProfile.firstName ? 
                        `${userProfile.firstName} ${userProfile.lastName || ''}`.trim() : 
                        'Your Profile'
                      }
                    </h3>
                    <div className="flex items-center mt-1">
                      <MapPin size={14} className="text-[#71727A] mr-1" />
                      <p className="text-[#71727A] text-sm">
                        {userProfile.location ? 'Location shared' : 'No location set'}
                      </p>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => navigate("/create-profile")}
                  className="p-2 rounded-full bg-[#1F2024] hover:bg-[#CBAB58]/20 transition-colors"
                >
                  <Edit3 size={20} className="text-[#CBAB58]" />
                </button>
              </div>
              
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-white text-xl font-bold">{connectedSocials.length}</p>
                  <p className="text-[#71727A] text-xs">Connected</p>
                </div>
                <div>
                  <p className="text-white text-xl font-bold">11</p>
                  <p className="text-[#71727A] text-xs">Friends</p>
                </div>
                <div>
                  <p className="text-white text-xl font-bold">5,500</p>
                  <p className="text-[#71727A] text-xs">Social Points</p>
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="px-4 mb-8">
            <div className="bg-[#2C2D32] rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full bg-[#CBAB58]/20 flex items-center justify-center mr-4">
                    <Users size={24} className="text-[#CBAB58]" />
                  </div>
                  <div>
                    <h3 className="text-white font-medium">11 Connections</h3>
                    <p className="text-[#71727A] text-sm">5,500 points earned</p>
                  </div>
                </div>
                <Trophy size={24} className="text-[#CBAB58]" />
              </div>
              <div className="h-2 bg-[#1F2024] rounded-full overflow-hidden mb-2">
                <div className="h-full bg-[#CBAB58] w-[55%]" />
              </div>
              <p className="text-[#71727A] text-sm">Connect with 9 more people to reach next tier</p>
            </div>
          </div>

          {/* Referral Section */}
          <div className="px-4 mb-8">
            <h2 className="text-white font-semibold mb-4">Refer Friends</h2>
            <div className="bg-[#2C2D32] rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full bg-[#CBAB58]/20 flex items-center justify-center mr-4">
                    <Share2 size={24} className="text-[#CBAB58]" />
                  </div>
                  <div>
                    <h3 className="text-white font-medium">Share & Earn</h3>
                    <p className="text-[#71727A] text-sm">300 points per referral</p>
                  </div>
                </div>
              </div>
              <button className="w-full h-12 bg-[#CBAB58] rounded-xl text-[#1F2024] font-semibold">
                Share Referral Link
              </button>
            </div>
          </div>

          {/* Social Connections */}
          <div className="px-4">
            <h2 className="text-white font-semibold mb-4">Social Media Accounts</h2>
            <div className="space-y-4">
              <div className="bg-[#2C2D32] rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-12 h-12 rounded-full bg-black flex items-center justify-center mr-4">
                      <Twitter size={24} className="text-white" />
                    </div>
                    <div>
                      <h3 className="text-white font-medium">X</h3>
                      <p className="text-[#71727A] text-sm">
                        {connectedSocials.includes('twitter') ? 'Connected - Find friends' : 'Connect to find friends'}
                      </p>
                    </div>
                  </div>
                  <button className={`px-4 py-2 rounded-lg font-medium ${
                    connectedSocials.includes('twitter') 
                      ? 'bg-green-500/20 text-green-400' 
                      : 'bg-black text-white hover:bg-gray-800'
                  }`}>
                    {connectedSocials.includes('twitter') ? 'Connected' : 'Connect'}
                  </button>
                </div>
              </div>

              <div className="bg-[#2C2D32] rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-12 h-12 rounded-full bg-[#E4405F]/20 flex items-center justify-center mr-4">
                      <Instagram size={24} className="text-[#E4405F]" />
                    </div>
                    <div>
                      <h3 className="text-white font-medium">Instagram</h3>
                      <p className="text-[#71727A] text-sm">
                        {connectedSocials.includes('instagram') ? 'Connected - Share collections' : 'Connect to share collections'}
                      </p>
                    </div>
                  </div>
                  <button className={`px-4 py-2 rounded-lg font-medium ${
                    connectedSocials.includes('instagram') 
                      ? 'bg-green-500/20 text-green-400' 
                      : 'bg-[#E4405F] text-white hover:bg-[#E4405F]/80'
                  }`}>
                    {connectedSocials.includes('instagram') ? 'Connected' : 'Connect'}
                  </button>
                </div>
              </div>

              <div className="bg-[#2C2D32] rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-12 h-12 rounded-full bg-[#1877F2]/20 flex items-center justify-center mr-4">
                      <Facebook size={24} className="text-[#1877F2]" />
                    </div>
                    <div>
                      <h3 className="text-white font-medium">Facebook</h3>
                      <p className="text-[#71727A] text-sm">
                        {connectedSocials.includes('facebook') ? 'Connected - Expand network' : 'Connect to expand network'}
                      </p>
                    </div>
                  </div>
                  <button className={`px-4 py-2 rounded-lg font-medium ${
                    connectedSocials.includes('facebook') 
                      ? 'bg-green-500/20 text-green-400' 
                      : 'bg-[#1877F2] text-white hover:bg-[#1877F2]/80'
                  }`}>
                    {connectedSocials.includes('facebook') ? 'Connected' : 'Connect'}
                  </button>
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