import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Star, Clock, MapPin, Lock } from "lucide-react";
import { NavigationBar } from "../../components/ui/navigation-bar";

const offers = [
  {
    id: 1,
    title: "Wine Tasting Experience",
    merchant: "Bodega Catena Zapata",
    location: "Mendoza, Argentina",
    image: "https://images.pexels.com/photos/2702805/pexels-photo-2702805.jpeg",
    points: 5000,
    expiresIn: "5 days",
    description: "Exclusive wine tasting session with our master sommelier, featuring our premium Malbec collection."
  },
  {
    id: 2,
    title: "Chef's Table Experience",
    merchant: "Don Julio",
    location: "Palermo, Buenos Aires",
    image: "https://images.pexels.com/photos/3184183/pexels-photo-3184183.jpeg",
    points: 8000,
    expiresIn: "3 days",
    description: "Private dining experience with our head chef, including a 7-course tasting menu."
  },
  {
    id: 3,
    title: "Tango Class & Show",
    merchant: "La Ventana",
    location: "San Telmo, Buenos Aires",
    image: "https://images.pexels.com/photos/3894247/pexels-photo-3894247.jpeg",
    points: 11500,
    expiresIn: "7 days",
    description: "Private tango lesson followed by VIP seating at our evening show."
  }
];

const userPoints = 11000; // Current user points

export const OffersScreen = (): JSX.Element => {
  const navigate = useNavigate();

  const isOfferAvailable = (requiredPoints: number) => {
    return userPoints >= requiredPoints;
  };

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
            <h1 className="text-2xl font-bold text-white">Special Offers</h1>
          </div>

          <div className="px-4 space-y-6">
            {offers.map((offer) => {
              const available = isOfferAvailable(offer.points);
              return (
                <div 
                  key={offer.id} 
                  className={`bg-[#2C2D32] rounded-xl overflow-hidden ${!available ? 'opacity-50' : ''}`}
                >
                  <div className="h-48 w-full relative">
                    <img 
                      src={offer.image} 
                      alt={offer.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-4 right-4 bg-[#1F2024]/80 backdrop-blur-md px-4 py-2 rounded-full flex items-center">
                      <Star size={16} className="text-[#CBAB58] mr-2" />
                      <span className="text-white font-semibold">{offer.points.toLocaleString()} pts</span>
                    </div>
                  </div>

                  <div className="p-4">
                    <h3 className="text-white text-lg font-semibold mb-2">{offer.title}</h3>
                    <p className="text-[#71727A] text-sm mb-4">{offer.description}</p>

                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center text-[#71727A]">
                          <MapPin size={16} className="mr-1" />
                          <span className="text-sm">{offer.location}</span>
                        </div>
                        <div className="flex items-center text-[#71727A]">
                          <Clock size={16} className="mr-1" />
                          <span className="text-sm">Expires in {offer.expiresIn}</span>
                        </div>
                      </div>
                    </div>

                    <button 
                      className={`w-full h-12 flex items-center justify-center space-x-2 font-semibold rounded-lg transition-colors ${
                        available 
                          ? 'bg-[#CBAB58] text-[#1F2024] hover:bg-[#b69843]' 
                          : 'bg-[#71727A] text-white cursor-not-allowed'
                      }`}
                      disabled={!available}
                    >
                      {available ? (
                        <span>Redeem Offer</span>
                      ) : (
                        <>
                          <Lock size={16} />
                          <span>Need {(offer.points - userPoints).toLocaleString()} more points</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <NavigationBar />
      </div>
    </div>
  );
};