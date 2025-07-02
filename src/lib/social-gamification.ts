// Social gamification system for NFT collections
export interface SocialConnection {
  id: string;
  userId: string;
  connectedUserId: string;
  platform: 'twitter' | 'instagram' | 'facebook' | 'discord';
  username: string;
  connectedAt: string;
  isVerified: boolean;
}

export interface CollectionBonus {
  id: string;
  type: 'social_match' | 'special_edition' | 'artist_complete' | 'location_streak' | 'rarity_master';
  name: string;
  description: string;
  points: number;
  badge?: string;
  profileBooster?: {
    type: 'multiplier' | 'badge' | 'title';
    value: number | string;
    duration?: number; // in days
  };
}

export interface LeaderboardEntry {
  userId: string;
  username: string;
  avatar: string;
  totalNFTs: number;
  totalPoints: number;
  rareNFTs: number;
  socialBonuses: number;
  rank: number;
  badges: string[];
  profileBoosters: CollectionBonus['profileBooster'][];
}

export interface ArtistCollection {
  artistId: string;
  artistName: string;
  totalNFTs: number;
  collectedNFTs: number;
  isComplete: boolean;
  completionBonus: number;
}

// Mock data for demonstration
export const mockSocialConnections: SocialConnection[] = [
  {
    id: '1',
    userId: 'user1',
    connectedUserId: 'user2',
    platform: 'twitter',
    username: '@cryptoexplorer',
    connectedAt: '2024-08-15T10:00:00Z',
    isVerified: true
  },
  {
    id: '2',
    userId: 'user1',
    connectedUserId: 'user3',
    platform: 'instagram',
    username: '@nftcollector',
    connectedAt: '2024-08-14T15:30:00Z',
    isVerified: true
  }
];

export const mockLeaderboard: LeaderboardEntry[] = [
  {
    userId: 'user1',
    username: 'Alex Explorer',
    avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg',
    totalNFTs: 47,
    totalPoints: 12850,
    rareNFTs: 8,
    socialBonuses: 450,
    rank: 1,
    badges: ['🏆', '🎨', '🌟'],
    profileBoosters: [
      { type: 'multiplier', value: 1.2, duration: 30 },
      { type: 'title', value: 'NFT Master' }
    ]
  },
  {
    userId: 'user2',
    username: 'Maria Collector',
    avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg',
    totalNFTs: 42,
    totalPoints: 11200,
    rareNFTs: 6,
    socialBonuses: 300,
    rank: 2,
    badges: ['🎨', '🌟'],
    profileBoosters: [
      { type: 'badge', value: 'Art Enthusiast' }
    ]
  },
  {
    userId: 'user3',
    username: 'Carlos Crypto',
    avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg',
    totalNFTs: 38,
    totalPoints: 9750,
    rareNFTs: 5,
    socialBonuses: 250,
    rank: 3,
    badges: ['🌟'],
    profileBoosters: []
  },
  {
    userId: 'user4',
    username: 'Sofia Digital',
    avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg',
    totalNFTs: 35,
    totalPoints: 8900,
    rareNFTs: 4,
    socialBonuses: 200,
    rank: 4,
    badges: ['🎨'],
    profileBoosters: []
  },
  {
    userId: 'user5',
    username: 'Diego Traveler',
    avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg',
    totalNFTs: 32,
    totalPoints: 8100,
    rareNFTs: 3,
    socialBonuses: 150,
    rank: 5,
    badges: [],
    profileBoosters: []
  }
];

export const calculateSocialBonus = (
  nftId: string,
  userConnections: SocialConnection[],
  nearbyCollectors: string[]
): CollectionBonus[] => {
  const bonuses: CollectionBonus[] = [];

  // Check for social matches
  const socialMatches = userConnections.filter(conn => 
    nearbyCollectors.includes(conn.connectedUserId)
  );

  if (socialMatches.length > 0) {
    bonuses.push({
      id: `social-${nftId}`,
      type: 'social_match',
      name: 'Social Collector',
      description: `Collected the same NFT as ${socialMatches.length} connected friend${socialMatches.length > 1 ? 's' : ''}`,
      points: socialMatches.length * 50,
      badge: '🤝'
    });
  }

  return bonuses;
};

export const checkSpecialEditionBonus = (nft: any): CollectionBonus | null => {
  if (nft.rarity === 'Legendary' && nft.supply?.total <= 10) {
    return {
      id: `special-${nft.id}`,
      type: 'special_edition',
      name: 'Legendary Collector',
      description: 'Collected a rare special edition NFT',
      points: 500,
      badge: '👑',
      profileBooster: {
        type: 'multiplier',
        value: 1.5,
        duration: 7
      }
    };
  }

  if (nft.supply?.total <= 5) {
    return {
      id: `ultra-rare-${nft.id}`,
      type: 'special_edition',
      name: 'Ultra Rare Hunter',
      description: 'Collected an ultra-rare NFT (≤5 supply)',
      points: 1000,
      badge: '💎',
      profileBooster: {
        type: 'title',
        value: 'Diamond Collector'
      }
    };
  }

  return null;
};

export const checkArtistCollectionBonus = (
  artistCollections: ArtistCollection[]
): CollectionBonus[] => {
  const bonuses: CollectionBonus[] = [];

  artistCollections.forEach(collection => {
    if (collection.isComplete) {
      bonuses.push({
        id: `artist-complete-${collection.artistId}`,
        type: 'artist_complete',
        name: 'Master Collector',
        description: `Completed ${collection.artistName}'s entire collection`,
        points: collection.completionBonus,
        badge: '🎨',
        profileBooster: {
          type: 'badge',
          value: `${collection.artistName} Completionist`
        }
      });
    }
  });

  return bonuses;
};

export const calculateLocationStreak = (
  userCollections: any[],
  location: string
): CollectionBonus | null => {
  const locationNFTs = userCollections.filter(nft => 
    nft.location.includes(location)
  );

  if (locationNFTs.length >= 5) {
    return {
      id: `location-streak-${location}`,
      type: 'location_streak',
      name: 'Location Explorer',
      description: `Collected ${locationNFTs.length} NFTs in ${location}`,
      points: locationNFTs.length * 25,
      badge: '📍',
      profileBooster: {
        type: 'title',
        value: `${location} Explorer`
      }
    };
  }

  return null;
};

export const calculateRarityMasterBonus = (
  userCollections: any[]
): CollectionBonus | null => {
  const legendaryCount = userCollections.filter(nft => nft.rarity === 'Legendary').length;
  const epicCount = userCollections.filter(nft => nft.rarity === 'Epic').length;

  if (legendaryCount >= 3 && epicCount >= 10) {
    return {
      id: 'rarity-master',
      type: 'rarity_master',
      name: 'Rarity Master',
      description: 'Collected 3+ Legendary and 10+ Epic NFTs',
      points: 2000,
      badge: '⭐',
      profileBooster: {
        type: 'multiplier',
        value: 2.0,
        duration: 30
      }
    };
  }

  return null;
};

export const getUserRank = (userId: string): number => {
  const userEntry = mockLeaderboard.find(entry => entry.userId === userId);
  return userEntry?.rank || mockLeaderboard.length + 1;
};

export const getTopCollectors = (limit: number = 10): LeaderboardEntry[] => {
  return mockLeaderboard.slice(0, limit);
};

export const getUserStats = (userId: string) => {
  const userEntry = mockLeaderboard.find(entry => entry.userId === userId);
  if (!userEntry) {
    return {
      rank: mockLeaderboard.length + 1,
      totalNFTs: 0,
      totalPoints: 0,
      rareNFTs: 0,
      socialBonuses: 0,
      badges: [],
      profileBoosters: []
    };
  }

  return {
    rank: userEntry.rank,
    totalNFTs: userEntry.totalNFTs,
    totalPoints: userEntry.totalPoints,
    rareNFTs: userEntry.rareNFTs,
    socialBonuses: userEntry.socialBonuses,
    badges: userEntry.badges,
    profileBoosters: userEntry.profileBoosters
  };
};