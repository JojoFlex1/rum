// Points system with USD conversion logic
// 1 point = $0.10 USD

export const POINTS_TO_USD_RATE = 0.10;

export interface PointsTransaction {
  id: string;
  userId: string;
  amount: number;
  type: 'earned' | 'redeemed' | 'bonus';
  source: 'payment' | 'social' | 'collectible' | 'referral' | 'offer';
  description: string;
  timestamp: string;
  metadata?: {
    transactionId?: string;
    collectibleId?: string;
    referralId?: string;
    offerId?: string;
  };
}

export interface UserPointsBalance {
  totalPoints: number;
  availablePoints: number;
  pendingPoints: number;
  lifetimeEarned: number;
  lifetimeRedeemed: number;
  usdValue: number;
}

// Convert points to USD
export const pointsToUSD = (points: number): number => {
  return points * POINTS_TO_USD_RATE;
};

// Convert USD to points
export const usdToPoints = (usd: number): number => {
  return Math.round(usd / POINTS_TO_USD_RATE);
};

// Format points with USD value
export const formatPointsWithUSD = (points: number): string => {
  const usdValue = pointsToUSD(points);
  return `${points.toLocaleString()} pts ($${usdValue.toFixed(2)})`;
};

// Format USD value from points
export const formatUSDFromPoints = (points: number): string => {
  const usdValue = pointsToUSD(points);
  return `$${usdValue.toFixed(2)}`;
};

// Calculate points earned from payment amount
export const calculatePaymentPoints = (amountUSD: number): number => {
  // 1 point per $1 spent
  return Math.floor(amountUSD);
};

// Calculate social bonus points
export const calculateSocialBonus = (basePoints: number, socialConnections: number): number => {
  // 5% bonus per social connection, max 50% bonus
  const bonusMultiplier = Math.min(socialConnections * 0.05, 0.5);
  return Math.floor(basePoints * bonusMultiplier);
};

// Calculate collectible points
export const calculateCollectiblePoints = (rarity: string): number => {
  switch (rarity.toLowerCase()) {
    case 'legendary':
      return 1000; // $100 value
    case 'epic':
      return 500;  // $50 value
    case 'rare':
      return 200;  // $20 value
    case 'common':
      return 50;   // $5 value
    default:
      return 10;   // $1 value
  }
};

// Calculate referral bonus
export const calculateReferralBonus = (): number => {
  return 300; // $30 value for successful referral
};

// Check if user can redeem points for offer
export const canRedeemOffer = (userPoints: number, offerCost: number): boolean => {
  return userPoints >= offerCost;
};

// Calculate offer discount in USD
export const calculateOfferDiscount = (offerPoints: number): number => {
  return pointsToUSD(offerPoints);
};

// Get points tier based on total earned
export const getPointsTier = (lifetimePoints: number): {
  tier: string;
  color: string;
  nextTier?: string;
  pointsToNext?: number;
  benefits: string[];
} => {
  if (lifetimePoints >= 50000) { // $5000+ earned
    return {
      tier: 'Diamond',
      color: '#E1C87D',
      benefits: ['2x points on all purchases', 'Exclusive offers', 'Priority support', 'Free premium features']
    };
  } else if (lifetimePoints >= 20000) { // $2000+ earned
    return {
      tier: 'Platinum',
      color: '#C0C0C0',
      nextTier: 'Diamond',
      pointsToNext: 50000 - lifetimePoints,
      benefits: ['1.5x points on purchases', 'Early access to offers', 'Premium support']
    };
  } else if (lifetimePoints >= 10000) { // $1000+ earned
    return {
      tier: 'Gold',
      color: '#CBAB58',
      nextTier: 'Platinum',
      pointsToNext: 20000 - lifetimePoints,
      benefits: ['1.25x points on purchases', 'Exclusive monthly offers', 'Priority customer service']
    };
  } else if (lifetimePoints >= 5000) { // $500+ earned
    return {
      tier: 'Silver',
      color: '#A8A8A8',
      nextTier: 'Gold',
      pointsToNext: 10000 - lifetimePoints,
      benefits: ['1.1x points on purchases', 'Monthly bonus offers']
    };
  } else {
    return {
      tier: 'Bronze',
      color: '#CD7F32',
      nextTier: 'Silver',
      pointsToNext: 5000 - lifetimePoints,
      benefits: ['Standard points earning', 'Basic offers']
    };
  }
};

// Calculate total points from transaction history
export const calculateTotalPointsFromHistory = (transactions: PointsTransaction[]): UserPointsBalance => {
  const earned = transactions
    .filter(t => t.type === 'earned')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const redeemed = transactions
    .filter(t => t.type === 'redeemed')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);
  
  const totalPoints = earned - redeemed;
  
  return {
    totalPoints,
    availablePoints: totalPoints,
    pendingPoints: 0,
    lifetimeEarned: earned,
    lifetimeRedeemed: redeemed,
    usdValue: pointsToUSD(totalPoints)
  };
};