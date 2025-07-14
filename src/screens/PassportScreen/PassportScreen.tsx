import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, Trophy, Star, Globe, Users, Award, Crown, TrendingUp, Calendar, Filter, ChevronRight, Medal, Zap } from "lucide-react";
import { NavigationBar } from "../../components/ui/navigation-bar";
import { getTopCollectors, getUserStats, mockLeaderboard } from "../../lib/social-gamification";
import { formatPointsWithUSD, formatUSDFromPoints, getPointsTier } from "../../lib/points-system";
import { useTransactions } from "../../hooks/useTransactions";

const cities = [
  {
    name: "Buenos Aires",
    country: "Argentina",
    collectibles: 12,
    points: 2500,
    connections: 3,
    coordinates: { x: 32, y: 82 }
  },
  {
    name: "Denver",
    country: "United States",
    collectibles: 8,
    points: 1800,
    connections: 2,
    coordinates: { x: 22, y: 38 }
  },
  {
    name: "San Francisco",
    country: "United States",
    collectibles: 15,
    points: 3200,
    connections: 2,
    coordinates: { x: 15, y: 38 }
  },
  {
    name: "Prague",
    country: "Czech Republic",
    collectibles: 10,
    points: 2200,
    connections: 1,
    coordinates: { x: 52, y: 32 }
  },
  {
    name: "New York City",
    country: "United States",
    collectibles: 18,
    points: 3800,
    connections: 2,
    coordinates: { x: 25, y: 37 }
  },
  {
    name: "New Delhi",
    country: "India",
    collectibles: 7,
    points: 1500,
    connections: 1,
    coordinates: { x: 70, y: 42 }
  }
];

// User's collected NFTs
const userCollection = [
  {
    id: 1,
    name: "Teatro Colón NFT",
    location: "Buenos Aires, Argentina",
    rarity: "Legendary",
    image: "https://images.pexels.com/photos/208674/pexels-photo-208674.jpeg",
    category: "Architecture",
    points: 800,
    collectedAt: "2024-08-15",
    artist: "Buenos Aires Cultural"
  },
  {
    id: 2,
    name: "Obelisk Monument",
    location: "Buenos Aires, Argentina",
    rarity: "Epic",
    image: "https://images.pexels.com/photos/13294659/pexels-photo-13294659.jpeg",
    category: "Monuments",
    points: 400,
    collectedAt: "2024-08-14",
    artist: "City Landmarks"
  },
  {
    id: 3,
    name: "Golden Gate Bridge",
    location: "San Francisco, USA",
    rarity: "Epic",
    image: "https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg",
    category: "Landmarks",
    points: 500,
    collectedAt: "2024-07-20",
    artist: "SF Landmarks"
  },
  {
    id: 4,
    name: "Times Square",
    location: "New York, USA",
    rarity: "Rare",
    image: "https://images.pexels.com/photos/378570/pexels-photo-378570.jpeg",
    category: "Urban",
    points: 300,
    collectedAt: "2024-07-10",
    artist: "NYC Collection"
  }
];

export const PassportScreen = (): JSX.Element => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'collection' | 'stats' | 'leaderboard'>('overview');
  const [collectionFilter, setCollectionFilter] = useState<'all' | 'legendary' | 'epic' | 'rare'>('all');
  const { totalPoints } = useTransactions();
  
  const currentUserId = 'user1';
  const userStats = getUserStats(currentUserId);
  const topCollectors = getTopCollectors(5);
  const userTier = getPointsTier(totalPoints);
  const totalCollectibles = cities.reduce((sum, city) => sum + city.collectibles, 0);
  const totalConnections = cities.reduce((sum, city) => sum + city.connections, 0);

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "Legendary":
        return "text-yellow-400";
      case "Epic":
        return "text-purple-400";
      case "Rare":
        return "text-blue-400";
      default:
        return "text-gray-400";
    }
  };

  const getRarityBg = (rarity: string) => {
    switch (rarity) {
      case "Legendary":
        return "bg-yellow-400/20 border-yellow-400";
      case "Epic":
        return "bg-purple-400/20 border-purple-400";
      case "Rare":
        return "bg-blue-400/20 border-blue-400";
      default:
        return "bg-gray-400/20 border-gray-400";
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown size={20} className="text-yellow-500" />;
      case 2:
        return <Medal size={20} className="text-gray-400" />;
      case 3:
        return <Award size={20} className="text-amber-600" />;
      default:
        return <span className="text-[#71727A] font-bold text-sm">#{rank}</span>;
    }
  };

  const filteredCollection = userCollection.filter(nft => {
    if (collectionFilter === 'all') return true;
    return nft.rarity.toLowerCase() === collectionFilter;
  });

  const formatPoints = (points: number) => {
    if (points >= 1000) {
      return `${(points / 1000).toFixed(1)}k`;
    }
    return points.toString();
  };

  return (
    <div className="flex justify-center w-full bg-[#1F2024]">
      <div className="relative w-[393px] bg-[#1F2024] min-h-screen">
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
            <h1 className="text-2xl font-bold text-white">Travel Passport</h1>
          </div>

          {/* Status Tier Bar */}
          <div className="px-4 mb-6">
            <div className="bg-gradient-to-r from-[#CBAB58] to-[#E1C87D] rounded-2xl p-6" style={{ background: `linear-gradient(to right, ${userTier.color}, ${userTier.color}80)` }}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full bg-[#1F2024] flex items-center justify-center mr-4">
                    <Crown size={24} className="text-[#CBAB58]" />
                  </div>
                  <div>
                    <h3 className="text-[#1F2024] text-lg font-bold">{userTier.tier} Tier</h3>
                    <p className="text-[#1F2024]/70">Rank #{userStats.rank} globally</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[#1F2024] text-2xl font-bold">{totalPoints.toLocaleString()}</p>
                  <p className="text-[#1F2024]/70 text-sm">{formatUSDFromPoints(totalPoints)} value</p>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-[#1F2024] text-xl font-bold">{totalCollectibles}</p>
                  <p className="text-[#1F2024]/70 text-xs">NFTs</p>
                </div>
                <div className="text-center">
                  <p className="text-[#1F2024] text-xl font-bold">{totalConnections}</p>
                  <p className="text-[#1F2024]/70 text-xs">Connections</p>
                </div>
                <div className="text-center">
                  <p className="text-[#1F2024] text-xl font-bold">{cities.length}</p>
                  <p className="text-[#1F2024]/70 text-xs">Cities</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="px-4 mb-6">
            <div className="flex bg-[#2C2D32] rounded-xl p-1">
              {(['overview', 'collection', 'stats', 'leaderboard'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === tab
                      ? 'bg-[#CBAB58] text-[#1F2024]'
                      : 'text-white hover:bg-[#1F2024]'
                  }`}
                >
                  {tab === 'overview' ? 'Overview' :
                   tab === 'collection' ? 'Collection' :
                   tab === 'stats' ? 'Stats' : 'Leaderboard'}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <div className="px-4 space-y-6">
              {/* Points Staking Info */}
              <div className="bg-[#2C2D32] rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white font-semibold">This Month</h3>
                  <div className="text-right">
                    <span className="text-[#CBAB58] font-bold">+248 pts</span>
                    <p className="text-[#71727A] text-xs">{formatUSDFromPoints(248)} earned</p>
                  </div>
                </div>
                <div className="h-2 bg-[#1F2024] rounded-full overflow-hidden mb-2">
                  <div className="h-full bg-[#CBAB58] w-[75%]" />
                </div>
                <p className="text-[#71727A] text-sm">Tier benefits: {userTier.benefits[0]}</p>
              </div>

              {/* World Map */}
              <div className="bg-[#2C2D32] rounded-2xl p-6">
                <h3 className="text-white font-semibold mb-4">Cities Visited</h3>
                <div className="relative w-full h-[200px] bg-[#1F2024] rounded-lg overflow-hidden">
                  <img 
                    src="https://images.pexels.com/photos/41949/earth-earth-at-night-night-lights-41949.jpeg"
                    alt="World Map"
                    className="w-full h-full object-cover opacity-40"
                  />
                  {cities.map((city, index) => (
                    <div
                      key={index}
                      className="absolute group cursor-pointer"
                      style={{
                        left: `${city.coordinates.x}%`,
                        top: `${city.coordinates.y}%`
                      }}
                    >
                      <div className="relative">
                        <div className="w-3 h-3 bg-[#CBAB58] rounded-full animate-pulse" />
                        <div className="absolute -inset-1 bg-[#CBAB58] rounded-full opacity-30 animate-ping" />
                      </div>
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        <div className="bg-[#2C2D32] text-white text-xs py-1 px-2 rounded">
                          {city.name}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-[#2C2D32] rounded-2xl p-6">
                <h3 className="text-white font-semibold mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  {userCollection.slice(0, 3).map((nft) => (
                    <div key={nft.id} className="flex items-center">
                      <div className="w-10 h-10 rounded-lg overflow-hidden mr-3">
                        <img src={nft.image} alt={nft.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1">
                        <p className="text-white text-sm font-medium">{nft.name}</p>
                        <p className="text-[#71727A] text-xs">{nft.location}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[#CBAB58] text-sm font-bold">+{nft.points}</p>
                        <p className="text-[#71727A] text-xs">{nft.collectedAt}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'collection' && (
            <div className="px-4 space-y-6">
              {/* Collection Filters */}
              <div className="flex space-x-2 overflow-x-auto">
                {(['all', 'legendary', 'epic', 'rare'] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setCollectionFilter(filter)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                      collectionFilter === filter
                        ? 'bg-[#CBAB58] text-[#1F2024]'
                        : 'bg-[#2C2D32] text-white hover:bg-[#71727A]'
                    }`}
                  >
                    {filter.charAt(0).toUpperCase() + filter.slice(1)}
                  </button>
                ))}
              </div>

              {/* Collection Grid */}
              <div className="space-y-4">
                {filteredCollection.map((nft) => (
                  <div
                    key={nft.id}
                    className={`p-4 rounded-xl border ${getRarityBg(nft.rarity)}`}
                  >
                    <div className="flex items-center">
                      <div className="w-16 h-16 rounded-xl overflow-hidden mr-4">
                        <img 
                          src={nft.image} 
                          alt={nft.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-white font-medium">{nft.name}</h3>
                        <div className="flex items-center space-x-2 mb-1">
                          <MapPin size={12} className="text-[#71727A]" />
                          <span className="text-[#71727A] text-sm">{nft.location}</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center">
                            <Trophy size={12} className={getRarityColor(nft.rarity)} />
                            <span className={`ml-1 text-sm ${getRarityColor(nft.rarity)}`}>
                              {nft.rarity}
                            </span>
                          </div>
                          <div className="flex items-center">
                            <Zap size={12} className="text-[#CBAB58]" />
                            <span className="ml-1 text-xs text-[#CBAB58]">
                              +{nft.points}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[#71727A] text-xs">Collected</p>
                        <p className="text-white text-sm">{nft.collectedAt}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick Collect Button */}
              <button
                onClick={() => navigate('/collectibles')}
                className="w-full bg-[#CBAB58] text-[#1F2024] py-4 rounded-xl font-semibold hover:bg-[#b69843] transition-colors flex items-center justify-center"
              >
                <Zap size={20} className="mr-2" />
                Find More Collectibles
              </button>
            </div>
          )}

          {activeTab === 'stats' && (
            <div className="px-4 space-y-6">
              {/* Cities List */}
              <div className="bg-[#2C2D32] rounded-2xl p-6">
                <h3 className="text-white font-semibold mb-4">Cities Visited</h3>
                <div className="space-y-3">
                  {cities.map((city, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <h4 className="text-white font-medium">{city.name}</h4>
                        <div className="flex items-center mt-1">
                          <Globe size={12} className="text-[#71727A] mr-1" />
                          <span className="text-[#71727A] text-sm">{city.country}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                          <Users size={16} className="text-[#CBAB58] mr-1" />
                          <span className="text-[#CBAB58]">{city.connections}</span>
                        </div>
                        <div className="flex items-center">
                          <Star size={16} className="text-[#CBAB58] mr-1" />
                          <span className="text-[#CBAB58]">{city.collectibles}</span>
                        </div>
                        <div className="flex items-center">
                          <Trophy size={16} className="text-[#CBAB58] mr-1" />
                          <span className="text-[#CBAB58]">{city.points.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Connections Made */}
              <div className="bg-[#2C2D32] rounded-2xl p-6">
                <h3 className="text-white font-semibold mb-4">Social Stats</h3>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="w-12 h-12 rounded-full bg-[#CBAB58]/20 flex items-center justify-center mr-4">
                      <Users size={24} className="text-[#CBAB58]" />
                    </div>
                    <div>
                      <h4 className="text-white font-medium">{totalConnections} People</h4>
                      <p className="text-[#71727A] text-sm">Connected across cities</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[#CBAB58] font-bold">+5,500</p>
                    <p className="text-[#71727A] text-sm">Points earned</p>
                  </div>
                </div>
                <div className="h-2 bg-[#1F2024] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#CBAB58]" 
                    style={{ width: `${(totalConnections / 20) * 100}%` }}
                  />
                </div>
                <p className="text-[#71727A] text-sm mt-2">Connect with 9 more people to reach next tier</p>
              </div>
            </div>
          )}

          {activeTab === 'leaderboard' && (
            <div className="px-4 space-y-6">
              {/* User Rank Card */}
              <div className="bg-gradient-to-r from-[#CBAB58]/20 to-[#E1C87D]/20 border border-[#CBAB58]/30 p-6 rounded-2xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-12 h-12 rounded-full bg-[#CBAB58]/20 flex items-center justify-center mr-4">
                      {getRankIcon(userStats.rank)}
                    </div>
                    <div>
                      <h3 className="text-white text-lg font-bold">Your Rank</h3>
                      <p className="text-[#CBAB58]">#{userStats.rank} globally</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white text-2xl font-bold">{formatPoints(userStats.totalPoints)}</p>
                    <p className="text-[#71727A] text-sm">points</p>
                  </div>
                </div>
              </div>

              {/* Top Collectors */}
              <div className="bg-[#2C2D32] rounded-2xl p-6">
                <h3 className="text-white font-semibold mb-4">Top Collectors</h3>
                <div className="space-y-3">
                  {topCollectors.map((entry, index) => (
                    <div 
                      key={entry.userId}
                      className={`p-4 rounded-xl flex items-center justify-between ${
                        entry.userId === currentUserId 
                          ? 'bg-[#CBAB58]/20 border border-[#CBAB58]' 
                          : 'bg-[#1F2024]'
                      }`}
                    >
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center mr-4">
                          {getRankIcon(entry.rank)}
                        </div>
                        
                        <div className="w-10 h-10 rounded-full overflow-hidden mr-3">
                          <img 
                            src={entry.avatar} 
                            alt={entry.username}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        
                        <div>
                          <h4 className={`font-medium ${
                            entry.userId === currentUserId ? 'text-[#CBAB58]' : 'text-white'
                          }`}>
                            {entry.username}
                            {entry.userId === currentUserId && <span className="text-xs ml-2">(You)</span>}
                          </h4>
                          <div className="flex items-center space-x-3 mt-1">
                            <div className="flex items-center">
                              <Trophy size={12} className="text-[#71727A] mr-1" />
                              <span className="text-[#71727A] text-sm">{entry.totalNFTs} NFTs</span>
                            </div>
                            <div className="flex items-center">
                              <Users size={12} className="text-[#71727A] mr-1" />
                              <span className="text-[#71727A] text-sm">+{entry.socialBonuses}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className={`font-bold ${
                          entry.userId === currentUserId ? 'text-[#CBAB58]' : 'text-white'
                        }`}>
                          {formatPoints(entry.totalPoints)}
                        </p>
                        <p className="text-[#71727A] text-sm">points</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* View Full Leaderboard */}
              <button
                onClick={() => navigate('/collectibles/leaderboard')}
                className="w-full bg-[#2C2D32] text-white py-4 rounded-xl font-medium hover:bg-[#71727A] transition-colors flex items-center justify-center"
              >
                <TrendingUp size={20} className="mr-2" />
                View Full Leaderboard
                <ChevronRight size={20} className="ml-2" />
              </button>
            </div>
          )}
        </div>

        <NavigationBar />
      </div>
    </div>
  );
};