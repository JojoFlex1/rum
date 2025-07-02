import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Trophy, Medal, Award, Crown, Star, Users, TrendingUp, Calendar, Filter } from "lucide-react";
import { NavigationBar } from "../../components/ui/navigation-bar";
import { getTopCollectors, getUserStats, mockLeaderboard, LeaderboardEntry } from "../../lib/social-gamification";

export const LeaderboardScreen = (): JSX.Element => {
  const navigate = useNavigate();
  const [timeFilter, setTimeFilter] = useState<'all' | 'month' | 'week'>('all');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'nfts' | 'points' | 'social'>('all');
  
  const currentUserId = 'user1'; // This would come from auth context
  const userStats = getUserStats(currentUserId);
  const topCollectors = getTopCollectors(10);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown size={24} className="text-yellow-500" />;
      case 2:
        return <Medal size={24} className="text-gray-400" />;
      case 3:
        return <Award size={24} className="text-amber-600" />;
      default:
        return <span className="text-[#71727A] font-bold text-lg">#{rank}</span>;
    }
  };

  const getRankBadge = (rank: number) => {
    if (rank <= 3) {
      return `bg-gradient-to-r ${
        rank === 1 ? 'from-yellow-500 to-yellow-600' :
        rank === 2 ? 'from-gray-400 to-gray-500' :
        'from-amber-600 to-amber-700'
      }`;
    }
    return 'bg-[#2C2D32]';
  };

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
            <h1 className="text-2xl font-bold text-white">Leaderboard</h1>
          </div>

          {/* User Stats Card */}
          <div className="px-4 mb-6">
            <div className="bg-gradient-to-r from-[#CBAB58] to-[#E1C87D] p-6 rounded-2xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full bg-[#1F2024] flex items-center justify-center mr-4">
                    {getRankIcon(userStats.rank)}
                  </div>
                  <div>
                    <h3 className="text-[#1F2024] text-lg font-bold">Your Rank</h3>
                    <p className="text-[#1F2024]/70">#{userStats.rank} globally</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[#1F2024] text-2xl font-bold">{formatPoints(userStats.totalPoints)}</p>
                  <p className="text-[#1F2024]/70 text-sm">points</p>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-[#1F2024] text-xl font-bold">{userStats.totalNFTs}</p>
                  <p className="text-[#1F2024]/70 text-xs">NFTs</p>
                </div>
                <div className="text-center">
                  <p className="text-[#1F2024] text-xl font-bold">{userStats.rareNFTs}</p>
                  <p className="text-[#1F2024]/70 text-xs">Rare</p>
                </div>
                <div className="text-center">
                  <p className="text-[#1F2024] text-xl font-bold">+{userStats.socialBonuses}</p>
                  <p className="text-[#1F2024]/70 text-xs">Social</p>
                </div>
              </div>

              {userStats.badges.length > 0 && (
                <div className="mt-4 pt-4 border-t border-[#1F2024]/20">
                  <div className="flex items-center space-x-2">
                    <span className="text-[#1F2024]/70 text-sm">Badges:</span>
                    {userStats.badges.map((badge, index) => (
                      <span key={index} className="text-lg">{badge}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Filters */}
          <div className="px-4 mb-6">
            <div className="flex space-x-2 mb-4">
              <div className="flex bg-[#2C2D32] rounded-xl p-1">
                {(['all', 'month', 'week'] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setTimeFilter(filter)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      timeFilter === filter
                        ? 'bg-[#CBAB58] text-[#1F2024]'
                        : 'text-white hover:bg-[#1F2024]'
                    }`}
                  >
                    {filter === 'all' ? 'All Time' : filter === 'month' ? 'This Month' : 'This Week'}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex space-x-2">
              {(['all', 'nfts', 'points', 'social'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setCategoryFilter(filter)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    categoryFilter === filter
                      ? 'bg-[#CBAB58] text-[#1F2024]'
                      : 'bg-[#2C2D32] text-white hover:bg-[#71727A]'
                  }`}
                >
                  {filter === 'all' ? 'All' : 
                   filter === 'nfts' ? 'NFTs' :
                   filter === 'points' ? 'Points' : 'Social'}
                </button>
              ))}
            </div>
          </div>

          {/* Top 3 Podium */}
          <div className="px-4 mb-8">
            <div className="flex items-end justify-center space-x-4">
              {/* 2nd Place */}
              {topCollectors[1] && (
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full overflow-hidden mb-2 border-2 border-gray-400">
                    <img 
                      src={topCollectors[1].avatar} 
                      alt={topCollectors[1].username}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="bg-gray-400 text-white px-3 py-6 rounded-t-xl text-center min-w-[80px]">
                    <Medal size={20} className="mx-auto mb-1" />
                    <p className="text-xs font-bold">{topCollectors[1].username.split(' ')[0]}</p>
                    <p className="text-xs">{formatPoints(topCollectors[1].totalPoints)}</p>
                  </div>
                </div>
              )}

              {/* 1st Place */}
              {topCollectors[0] && (
                <div className="flex flex-col items-center">
                  <div className="w-20 h-20 rounded-full overflow-hidden mb-2 border-4 border-yellow-500">
                    <img 
                      src={topCollectors[0].avatar} 
                      alt={topCollectors[0].username}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="bg-gradient-to-t from-yellow-500 to-yellow-400 text-[#1F2024] px-4 py-8 rounded-t-xl text-center min-w-[90px]">
                    <Crown size={24} className="mx-auto mb-1" />
                    <p className="text-sm font-bold">{topCollectors[0].username.split(' ')[0]}</p>
                    <p className="text-sm">{formatPoints(topCollectors[0].totalPoints)}</p>
                  </div>
                </div>
              )}

              {/* 3rd Place */}
              {topCollectors[2] && (
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full overflow-hidden mb-2 border-2 border-amber-600">
                    <img 
                      src={topCollectors[2].avatar} 
                      alt={topCollectors[2].username}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="bg-amber-600 text-white px-3 py-6 rounded-t-xl text-center min-w-[80px]">
                    <Award size={20} className="mx-auto mb-1" />
                    <p className="text-xs font-bold">{topCollectors[2].username.split(' ')[0]}</p>
                    <p className="text-xs">{formatPoints(topCollectors[2].totalPoints)}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Full Leaderboard */}
          <div className="px-4">
            <h2 className="text-white font-semibold mb-4">Top Collectors</h2>
            <div className="space-y-3">
              {topCollectors.map((entry, index) => (
                <div 
                  key={entry.userId}
                  className={`p-4 rounded-xl flex items-center justify-between ${
                    entry.userId === currentUserId 
                      ? 'bg-[#CBAB58]/20 border border-[#CBAB58]' 
                      : 'bg-[#2C2D32]'
                  }`}
                >
                  <div className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-4 ${getRankBadge(entry.rank)}`}>
                      {entry.rank <= 3 ? (
                        getRankIcon(entry.rank)
                      ) : (
                        <span className="text-white font-bold text-sm">#{entry.rank}</span>
                      )}
                    </div>
                    
                    <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
                      <img 
                        src={entry.avatar} 
                        alt={entry.username}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    <div>
                      <h3 className={`font-medium ${
                        entry.userId === currentUserId ? 'text-[#CBAB58]' : 'text-white'
                      }`}>
                        {entry.username}
                        {entry.userId === currentUserId && <span className="text-xs ml-2">(You)</span>}
                      </h3>
                      <div className="flex items-center space-x-4 mt-1">
                        <div className="flex items-center">
                          <Trophy size={12} className="text-[#71727A] mr-1" />
                          <span className="text-[#71727A] text-sm">{entry.totalNFTs} NFTs</span>
                        </div>
                        <div className="flex items-center">
                          <Users size={12} className="text-[#71727A] mr-1" />
                          <span className="text-[#71727A] text-sm">+{entry.socialBonuses}</span>
                        </div>
                      </div>
                      {entry.badges.length > 0 && (
                        <div className="flex space-x-1 mt-1">
                          {entry.badges.map((badge, badgeIndex) => (
                            <span key={badgeIndex} className="text-sm">{badge}</span>
                          ))}
                        </div>
                      )}
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

          {/* Achievement Showcase */}
          <div className="px-4 mt-8">
            <h2 className="text-white font-semibold mb-4">Recent Achievements</h2>
            <div className="space-y-3">
              <div className="bg-[#2C2D32] p-4 rounded-xl">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-[#CBAB58]/20 flex items-center justify-center mr-4">
                    <Star size={20} className="text-[#CBAB58]" />
                  </div>
                  <div>
                    <h3 className="text-white font-medium">Social Collector</h3>
                    <p className="text-[#71727A] text-sm">Maria collected the same NFT as 2 friends</p>
                  </div>
                  <div className="ml-auto text-[#CBAB58] font-bold">+100</div>
                </div>
              </div>
              
              <div className="bg-[#2C2D32] p-4 rounded-xl">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center mr-4">
                    <Crown size={20} className="text-purple-500" />
                  </div>
                  <div>
                    <h3 className="text-white font-medium">Legendary Hunter</h3>
                    <p className="text-[#71727A] text-sm">Carlos collected a legendary Teatro Colón NFT</p>
                  </div>
                  <div className="ml-auto text-purple-500 font-bold">+500</div>
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