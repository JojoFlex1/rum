import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, MapPin, Search, HandCoins } from "lucide-react";
import { GoogleMap, useLoadScript, Marker } from "@react-google-maps/api";
import { NavigationBar } from "../../components/ui/navigation-bar";

const mapContainerStyle = {
  width: "100%",
  height: "100%",
};

const center = {
  lat: -34.6037,
  lng: -58.3816,
};

const atms = [
  { id: 1, name: "ATM Banco Galicia", lat: -34.6037, lng: -58.3816, distance: "0.3" },
  { id: 2, name: "ATM Banco Santander", lat: -34.6057, lng: -58.3836, distance: "0.5" },
  { id: 3, name: "ATM BBVA", lat: -34.6077, lng: -58.3856, distance: "0.8" },
];

const libraries: ("places" | "drawing" | "geometry" | "localContext" | "visualization")[] = ["places"];

export const CashToPayScreen = (): JSX.Element => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedAtm, setSelectedAtm] = useState<number | null>(null);
  const requestedAmount = location.state?.amount || 10000;

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: "YOUR_GOOGLE_MAPS_API_KEY",
    libraries,
  });

  const handleSelectAtm = (atmId: number) => {
    setSelectedAtm(atmId);
    navigate("/payment-summary", { 
      state: { 
        from: "cash-to-pay",
        amount: requestedAmount
      } 
    });
  };

  if (loadError) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#1F2024] text-white">
        Error loading maps
      </div>
    );
  }

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
            <h1 className="text-2xl font-bold text-white">Find ATM</h1>
          </div>

          <div className="px-4 mb-4">
            <div className="relative">
              <Search size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#71727A]" />
              <input
                type="text"
                placeholder="Search location"
                className="w-full h-12 pl-12 pr-4 bg-[#2C2D32] rounded-xl text-white placeholder-[#71727A] focus:outline-none focus:ring-2 focus:ring-[#CBAB58]"
              />
            </div>
          </div>

          <div className="px-4 mb-4">
            <div className="bg-[#2C2D32] p-3 rounded-xl">
              <div className="flex items-center text-[#CBAB58]">
                <HandCoins size={16} className="mr-2 flex-shrink-0" />
                <span className="text-sm">We've negotiated a discounted rate with our ATM partners. All fees are non-refundable.</span>
              </div>
            </div>
          </div>

          <div className="relative flex-1 h-[300px] mb-4">
            {!isLoaded ? (
              <div className="w-full h-full flex items-center justify-center bg-[#2C2D32] text-white">
                Loading map...
              </div>
            ) : (
              <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={center}
                zoom={15}
                options={{
                  styles: [{ elementType: "geometry", stylers: [{ color: "#242f3e" }] }],
                }}
              >
                {atms.map((atm) => (
                  <Marker
                    key={atm.id}
                    position={{ lat: atm.lat, lng: atm.lng }}
                    onClick={() => handleSelectAtm(atm.id)}
                  />
                ))}
              </GoogleMap>
            )}
          </div>

          <div className="px-4 pb-8">
            <h2 className="text-white font-semibold mb-4">Nearby ATMs</h2>
            <div className="space-y-4">
              {atms.map((atm) => (
                <div
                  key={atm.id}
                  className={`p-4 rounded-xl flex items-center justify-between ${
                    selectedAtm === atm.id ? "bg-[#CBAB58]" : "bg-[#2C2D32]"
                  }`}
                  onClick={() => handleSelectAtm(atm.id)}
                >
                  <div className="flex items-center">
                    <div className={`w-10 h-10 rounded-full ${
                      selectedAtm === atm.id ? "bg-[#1F2024]" : "bg-[#1F2024]"
                    } flex items-center justify-center mr-4`}>
                      <MapPin size={20} className={
                        selectedAtm === atm.id ? "text-[#CBAB58]" : "text-[#CBAB58]"
                      } />
                    </div>
                    <div>
                      <h3 className={`font-medium ${
                        selectedAtm === atm.id ? "text-[#1F2024]" : "text-white"
                      }`}>{atm.name}</h3>
                      <p className={
                        selectedAtm === atm.id ? "text-[#1F2024]/70" : "text-[#71727A]"
                      }>{atm.distance} km away</p>
                    </div>
                  </div>
                  <button 
                    className={`px-4 py-2 rounded-lg ${
                      selectedAtm === atm.id 
                        ? "bg-[#1F2024] text-white" 
                        : "bg-[#CBAB58] text-[#1F2024]"
                    } font-medium`}
                  >
                    Select
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <NavigationBar />
      </div>
    </div>
  );
};