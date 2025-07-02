import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "../../components/ui/card";
import { MapPin } from "lucide-react";

export const ProfileCreationScreen = (): JSX.Element => {
  const [firstName, setFirstName] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLocationShare = () => {
    // Reset any previous error messages
    setLocationError(null);

    if (!('geolocation' in navigator)) {
      setLocationError('Location sharing is not supported in your browser');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        setLocationError(null);
      },
      (error) => {
        let errorMessage = 'Unable to retrieve your location';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Please enable location sharing in your browser settings to share your location';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out';
            break;
          default:
            errorMessage = 'An unknown error occurred while getting your location';
        }
        
        setLocationError(errorMessage);
        console.log("Location error:", errorMessage);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate("/home");
  };

  return (
    <div className="flex justify-center w-full bg-[#1F2024]">
      <div className="relative w-[393px] h-[853px] overflow-hidden">
        <div className="w-full h-full">
          <div className="relative w-full h-full">
            {/* Status Bar */}
            <header className="relative h-[42px] bg-[#1F2024] backdrop-blur-[20px] backdrop-brightness-[100%] [-webkit-backdrop-filter:blur(20px)_brightness(100%)]">
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

            {/* Profile Creation Form */}
            <div className="flex flex-col items-center px-8 pt-[72px]">
              <Card className="w-full border-none bg-transparent shadow-none">
                <CardContent className="p-0 space-y-6">
                  <div className="text-center mb-8">
                    <h2 className="text-white text-2xl font-semibold">Create Profile</h2>
                    <p className="text-[#71727A] mt-2">Please fill in your details</p>
                  </div>
                  
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Profile Image Upload */}
                    <div className="flex flex-col items-center space-y-4">
                      <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="w-24 h-24 rounded-full bg-[#2C2D32] flex items-center justify-center cursor-pointer overflow-hidden"
                      >
                        {imagePreview ? (
                          <img src={imagePreview} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                          <div className="text-[#71727A] text-4xl">+</div>
                        )}
                      </div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                      <p className="text-[#71727A]">Add profile photo</p>
                    </div>

                    <div className="space-y-4">
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="First Name"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          className="w-full h-[52px] px-6 text-white bg-[#2C2D32] rounded-[14px] border-2 border-[#2C2D32] focus:border-[#CBAB58] focus:outline-none placeholder:text-[#71727A]"
                        />
                      </div>

                      {/* Location Button */}
                      <div className="space-y-2">
                        <button
                          type="button"
                          onClick={handleLocationShare}
                          className={`w-full h-[52px] flex items-center justify-center space-x-2 rounded-[14px] border-2 ${
                            location ? 'bg-[#CBAB58]/10 border-[#CBAB58]' : 'bg-[#2C2D32] border-[#2C2D32]'
                          }`}
                        >
                          <MapPin size={20} className={location ? 'text-[#CBAB58]' : 'text-[#71727A]'} />
                          <span className={location ? 'text-[#CBAB58]' : 'text-[#71727A]'}>
                            {location ? 'Location shared' : 'Share location'}
                          </span>
                        </button>
                        {locationError && (
                          <p className="text-red-500 text-sm text-center">{locationError}</p>
                        )}
                      </div>
                    </div>

                    <button 
                      type="submit"
                      className="w-full h-[52px] text-[#1F2024] text-[17px] font-semibold rounded-[14px] bg-[#CBAB58] hover:bg-[#b69843]"
                    >
                      Continue
                    </button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};