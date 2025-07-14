import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Search, MapPin, Camera, AlertCircle, RefreshCw, CheckCircle, Zap, QrCode } from "lucide-react";
import { NavigationBar } from "../../components/ui/navigation-bar";

// Available collectibles nearby
const nearbyCollectibles = [
  {
    id: 1,
    name: "Teatro Colón NFT",
    location: "Teatro Colón",
    distance: "0.3",
    rarity: "Legendary",
    image: "https://images.pexels.com/photos/208674/pexels-photo-208674.jpeg",
    coordinates: { lat: -34.6011, lng: -58.3831 },
    description: "Exclusive NFT commemorating the historic Teatro Colón opera house",
    artist: "Buenos Aires Cultural",
    category: "Architecture",
    supply: { current: 3, total: 10 },
    points: 800,
    isCollected: false
  },
  {
    id: 2,
    name: "Obelisk Monument",
    location: "Obelisco de Buenos Aires",
    distance: "0.5",
    rarity: "Epic",
    image: "https://images.pexels.com/photos/13294659/pexels-photo-13294659.jpeg",
    coordinates: { lat: -34.6037, lng: -58.3816 },
    description: "Digital collectible of Buenos Aires' most iconic landmark",
    artist: "City Landmarks",
    category: "Monuments",
    supply: { current: 15, total: 50 },
    points: 400,
    isCollected: false
  },
  {
    id: 3,
    name: "La Boca Art",
    location: "La Boca",
    distance: "0.8",
    rarity: "Rare",
    image: "https://images.pexels.com/photos/17235888/pexels-photo-17235888.jpeg",
    coordinates: { lat: -34.6345, lng: -58.3635 },
    description: "Colorful street art NFT from the vibrant La Boca neighborhood",
    artist: "Street Artists Collective",
    category: "Street Art",
    supply: { current: 25, total: 100 },
    points: 200,
    isCollected: false
  }
];

export const CollectiblesScreen = (): JSX.Element => {
  const navigate = useNavigate();
  const [selectedCollectible, setSelectedCollectible] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCollectionSuccess, setShowCollectionSuccess] = useState<number | null>(null);
  const [scanning, setScanning] = useState(false);
  const [cameraPermission, setCameraPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');
  const [currentStream, setCurrentStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isHttps, setIsHttps] = useState(false);
  const [showDemoPrompt, setShowDemoPrompt] = useState(true);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Check if we're on HTTPS
    const isSecure = window.location.protocol === 'https:' || 
                    window.location.hostname === 'localhost' || 
                    window.location.hostname === '127.0.0.1';
    setIsHttps(isSecure);
  }, []);

  const requestCameraPermission = async (): Promise<boolean> => {
    try {
      setError(null);
      
      if (!isHttps) {
        setError('Camera access requires HTTPS. Please use a secure connection.');
        setCameraPermission('denied');
        return false;
      }

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError('Camera access is not supported in this browser.');
        setCameraPermission('denied');
        return false;
      }

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1280, min: 640 },
          height: { ideal: 720, min: 480 }
        },
        audio: false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setCurrentStream(stream);
      setCameraPermission('granted');
      return true;
    } catch (err: any) {
      console.error('Camera permission error:', err);
      setCameraPermission('denied');
      
      let errorMessage = 'Unable to access camera. ';
      
      if (err.name === 'NotAllowedError') {
        errorMessage += 'Please enable camera permissions in your browser settings.';
      } else if (err.name === 'NotFoundError') {
        errorMessage += 'No camera found on this device.';
      } else {
        errorMessage += 'Please try again or use a different device.';
      }
      
      setError(errorMessage);
      return false;
    }
  };

  const startCamera = async () => {
    if (!videoRef.current) return false;

    try {
      const hasPermission = await requestCameraPermission();
      if (!hasPermission || !currentStream) return false;

      videoRef.current.srcObject = currentStream;
      
      return new Promise<boolean>((resolve) => {
        if (!videoRef.current) {
          resolve(false);
          return;
        }

        videoRef.current.onloadedmetadata = () => {
          if (videoRef.current) {
            videoRef.current.play()
              .then(() => {
                setScanning(true);
                setShowDemoPrompt(false);
                // Simulate QR detection after 3 seconds for demo
                setTimeout(() => {
                  if (scanning) {
                    handleQRDetection();
                  }
                }, 3000);
                resolve(true);
              })
              .catch((err) => {
                console.error('Error playing video:', err);
                setError('Failed to start camera preview.');
                resolve(false);
              });
          }
        };
      });
    } catch (error: any) {
      console.error('Error starting camera:', error);
      setError('Failed to start camera. Please try again.');
      return false;
    }
  };

  const stopCamera = () => {
    setScanning(false);
    
    if (currentStream) {
      currentStream.getTracks().forEach(track => track.stop());
      setCurrentStream(null);
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const handleQRDetection = () => {
    // Simulate detecting a random collectible
    const randomCollectible = nearbyCollectibles[Math.floor(Math.random() * nearbyCollectibles.length)];
    stopCamera();
    handleCollectibleSelect(randomCollectible.id);
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "Legendary":
        return "text-yellow-400 border-yellow-400/30 bg-yellow-400/10";
      case "Epic":
        return "text-purple-400 border-purple-400/30 bg-purple-400/10";
      case "Rare":
        return "text-blue-400 border-blue-400/30 bg-blue-400/10";
      default:
        return "text-gray-400 border-gray-400/30 bg-gray-400/10";
    }
  };

  const handleCollectibleSelect = async (collectibleId: number) => {
    if (selectedCollectible === collectibleId) return;

    setSelectedCollectible(collectibleId);
    
    // Simulate collection process
    setTimeout(() => {
      setShowCollectionSuccess(collectibleId);
      setSelectedCollectible(null);
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setShowCollectionSuccess(null);
      }, 3000);
    }, 1000);
  };

  const handleDemoCollection = () => {
    // Simulate immediate collection for demo
    const randomCollectible = nearbyCollectibles[Math.floor(Math.random() * nearbyCollectibles.length)];
    handleCollectibleSelect(randomCollectible.id);
  };

  const filteredCollectibles = nearbyCollectibles.filter(collectible => {
    return collectible.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
           collectible.location.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="flex justify-center w-full bg-[#1F2024]">
      <div className="relative w-[393px] bg-[#1F2024] min-h-screen">
        {/* Status Bar */}
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

        <div className="flex flex-col pt-[58px] pb-[100px]">
          {/* Header */}
          <div className="flex items-center px-6 mb-6">
            <button 
              onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-full bg-[#2C2D32] flex items-center justify-center mr-4 hover:bg-[#3C3D42] transition-colors"
            >
              <ArrowLeft size={20} className="text-white" />
            </button>
            <h1 className="text-2xl font-bold text-white">Quick Collect</h1>
          </div>

          {/* Collection Success Notification */}
          {showCollectionSuccess && (
            <div className="px-6 mb-6">
              <div className="bg-green-500/20 border border-green-500/30 p-4 rounded-xl animate-pulse">
                <div className="flex items-center">
                  <CheckCircle size={24} className="text-green-500 mr-3 flex-shrink-0" />
                  <div>
                    <h3 className="text-green-500 font-bold">NFT Collected!</h3>
                    <p className="text-green-400 text-sm">
                      {nearbyCollectibles.find(c => c.id === showCollectionSuccess)?.name} added to your collection
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* QR Code Scanning Section */}
          <div className="px-6 mb-6">
            <div className="bg-gradient-to-r from-[#CBAB58]/20 to-[#E1C87D]/20 border border-[#CBAB58]/30 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-white text-lg font-bold mb-1">Scan QR Code</h3>
                  <p className="text-white/70 text-sm">Find NFTs by scanning QR codes at locations</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-[#CBAB58]/20 flex items-center justify-center">
                  <QrCode size={24} className="text-[#CBAB58]" />
                </div>
              </div>
              
              {!scanning ? (
                <div className="space-y-3">
                  <button
                    onClick={startCamera}
                    className="w-full bg-[#CBAB58] text-[#1F2024] py-3 rounded-xl font-semibold hover:bg-[#b69843] transition-colors flex items-center justify-center"
                  >
                    <Camera size={20} className="mr-2" />
                    Start Camera
                  </button>
                  
                  <button
                    onClick={handleDemoCollection}
                    className="w-full bg-[#2C2D32] text-white py-3 rounded-xl font-medium hover:bg-[#3C3D42] transition-colors"
                  >
                    Try Demo Collection
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative w-full h-[200px] rounded-xl overflow-hidden bg-[#1F2024]">
                    <video
                      ref={videoRef}
                      className="w-full h-full object-cover"
                      playsInline
                      muted
                    />
                    <canvas ref={canvasRef} className="hidden" />
                    
                    {/* Scanning overlay */}
                    <div className="absolute inset-0 pointer-events-none">
                      <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-[#CBAB58]"></div>
                      <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-[#CBAB58]"></div>
                      <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-[#CBAB58]"></div>
                      <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-[#CBAB58]"></div>
                      
                      {/* Scanning line */}
                      <div className="absolute inset-x-4 top-4 bottom-4">
                        <div className="w-full h-0.5 bg-[#CBAB58] scan-line"></div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-3">
                    <button
                      onClick={stopCamera}
                      className="flex-1 bg-[#2C2D32] text-white py-3 rounded-xl font-medium hover:bg-[#3C3D42] transition-colors"
                    >
                      Stop Camera
                    </button>
                    <div className="flex-1 bg-[#CBAB58]/20 text-[#CBAB58] py-3 rounded-xl font-medium text-center">
                      Scanning...
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="mt-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
                  <div className="flex items-start">
                    <AlertCircle size={16} className="text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                    <p className="text-red-500 text-sm">{error}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Search Bar */}
          <div className="px-6 mb-6">
            <div className="relative">
              <Search size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#71727A]" />
              <input
                type="text"
                placeholder="Search nearby collectibles"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-12 pl-12 pr-4 bg-[#2C2D32] rounded-xl text-white placeholder-[#71727A] focus:outline-none focus:ring-2 focus:ring-[#CBAB58] border border-[#2C2D32] focus:border-[#CBAB58] transition-colors"
              />
            </div>
          </div>

          {/* Section Header */}
          <div className="px-6 mb-4">
            <div className="flex items-center justify-between">
              <h2 className="text-white font-semibold text-lg">Explore Nearby</h2>
              <span className="text-[#71727A] text-sm">
                {filteredCollectibles.length} available
              </span>
            </div>
          </div>

          {/* Nearby Collectibles List */}
          <div className="px-6 space-y-4">
            {filteredCollectibles.length === 0 ? (
              <div className="text-center py-12">
                <QrCode size={48} className="text-[#71727A] mx-auto mb-4" />
                <p className="text-[#71727A] text-lg font-medium">No collectibles found</p>
                <p className="text-[#71727A] text-sm mt-2">Try adjusting your search or explore different areas</p>
              </div>
            ) : (
              filteredCollectibles.map((collectible) => (
                <div
                  key={collectible.id}
                  className={`p-4 rounded-xl border transition-all duration-200 ${
                    selectedCollectible === collectible.id 
                      ? "bg-[#CBAB58]/20 border-[#CBAB58] scale-[1.02]" 
                      : collectible.isCollected
                        ? "bg-green-500/10 border-green-500/30"
                        : "bg-[#2C2D32] border-[#2C2D32] hover:border-[#CBAB58]/50"
                  }`}
                >
                  <div className="flex items-center">
                    {/* NFT Image */}
                    <div className="w-16 h-16 rounded-xl overflow-hidden mr-4 flex-shrink-0 border border-white/10">
                      <img 
                        src={collectible.image} 
                        alt={collectible.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    
                    {/* NFT Details */}
                    <div className="flex-1 min-w-0">
                      <h3 className={`font-semibold mb-1 truncate ${
                        selectedCollectible === collectible.id ? "text-[#CBAB58]" : "text-white"
                      }`}>
                        {collectible.name}
                      </h3>
                      
                      <div className="flex items-center space-x-2 mb-2">
                        <MapPin size={12} className="text-[#71727A] flex-shrink-0" />
                        <span className="text-[#71727A] text-sm truncate">
                          {collectible.location}
                        </span>
                        <span className="text-[#71727A]">•</span>
                        <span className="text-[#71727A] text-sm">
                          {collectible.distance} km
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <span className={`text-xs px-2 py-1 rounded-full border ${getRarityColor(collectible.rarity)}`}>
                          {collectible.rarity}
                        </span>
                        <div className="flex items-center">
                          <Zap size={12} className="text-[#CBAB58] mr-1" />
                          <span className="text-[#CBAB58] text-xs font-medium">
                            +{collectible.points}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Action Button */}
                    <button 
                      onClick={() => handleCollectibleSelect(collectible.id)}
                      disabled={selectedCollectible === collectible.id || collectible.isCollected}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ml-3 ${
                        collectible.isCollected
                          ? "bg-green-500/20 text-green-500 cursor-not-allowed"
                          : selectedCollectible === collectible.id 
                            ? "bg-[#2C2D32] text-white" 
                            : "bg-[#CBAB58] text-[#1F2024] hover:bg-[#b69843]"
                      }`}
                    >
                      {collectible.isCollected ? "Collected" :
                       selectedCollectible === collectible.id ? "Collecting..." : "Collect"}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <NavigationBar />
      </div>
    </div>
  );
};