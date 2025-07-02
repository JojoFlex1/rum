import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Users, Share2, Trophy, Twitter, Instagram, Facebook } from "lucide-react";
import { NavigationBar } from "../../components/ui/navigation-bar";

export const ConnectScreen = (): JSX.Element => {
  const navigate = useNavigate();

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
            <h1 className="text-2xl font-bold text-white">Connect</h1>
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
            <h2 className="text-white font-semibold mb-4">Connect Social Media</h2>
            <div className="space-y-4">
              <div className="bg-[#2C2D32] rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-12 h-12 rounded-full bg-black flex items-center justify-center mr-4">
                      <Twitter size={24} className="text-white" />
                    </div>
                    <div>
                      <h3 className="text-white font-medium">X</h3>
                      <p className="text-[#71727A] text-sm">Connect to verify connections</p>
                    </div>
                  </div>
                  <button className="px-4 py-2 bg-black rounded-lg text-white font-medium">
                    Connect
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
                      <p className="text-[#71727A] text-sm">Connect to verify connections</p>
                    </div>
                  </div>
                  <button className="px-4 py-2 bg-[#E4405F] rounded-lg text-white font-medium">
                    Connect
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
                      <p className="text-[#71727A] text-sm">Connect to verify connections</p>
                    </div>
                  </div>
                  <button className="px-4 py-2 bg-[#1877F2] rounded-lg text-white font-medium">
                    Connect
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