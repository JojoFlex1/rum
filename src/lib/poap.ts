// POAP (Proof of Attendance Protocol) integration
export interface POAPEvent {
  id: number;
  fancy_id: string;
  name: string;
  description: string;
  city: string;
  country: string;
  event_url: string;
  image_url: string;
  animation_url?: string;
  year: number;
  start_date: string;
  end_date: string;
  expiry_date: string;
  supply: number;
  event_template_id: number;
  event_host_id: number;
  private_event: boolean;
}

export interface POAPToken {
  event: POAPEvent;
  tokenId: string;
  owner: string;
  chain: string;
  created: string;
  supply: number;
}

export interface UserPOAPs {
  address: string;
  tokens: POAPToken[];
  total: number;
}

// POAP API endpoints
const POAP_API_BASE = 'https://api.poap.tech';

export const fetchUserPOAPs = async (address: string): Promise<UserPOAPs | null> => {
  try {
    const response = await fetch(`${POAP_API_BASE}/actions/scan/${address}`);
    if (!response.ok) {
      throw new Error('Failed to fetch POAPs');
    }
    const data = await response.json();
    return {
      address,
      tokens: data,
      total: data.length
    };
  } catch (error) {
    console.error('Error fetching POAPs:', error);
    return null;
  }
};

export const fetchPOAPEvent = async (eventId: number): Promise<POAPEvent | null> => {
  try {
    const response = await fetch(`${POAP_API_BASE}/events/id/${eventId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch POAP event');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching POAP event:', error);
    return null;
  }
};

export const fetchNearbyPOAPEvents = async (
  lat: number, 
  lng: number, 
  radius: number = 10
): Promise<POAPEvent[]> => {
  try {
    // Note: POAP doesn't have a direct location-based API
    // This would need to be implemented with a custom backend
    // For now, we'll return mock data based on location
    const mockEvents: POAPEvent[] = [
      {
        id: 12345,
        fancy_id: 'eth-buenos-aires-2024',
        name: 'ETH Buenos Aires 2024',
        description: 'Ethereum conference in Buenos Aires',
        city: 'Buenos Aires',
        country: 'Argentina',
        event_url: 'https://ethbuenosaires.com',
        image_url: 'https://images.pexels.com/photos/730547/pexels-photo-730547.jpeg',
        year: 2024,
        start_date: '2024-08-15',
        end_date: '2024-08-17',
        expiry_date: '2024-12-31',
        supply: 500,
        event_template_id: 1,
        event_host_id: 1,
        private_event: false
      },
      {
        id: 12346,
        fancy_id: 'crypto-meetup-ba-2024',
        name: 'Crypto Meetup BA',
        description: 'Monthly crypto meetup in Buenos Aires',
        city: 'Buenos Aires',
        country: 'Argentina',
        event_url: 'https://cryptomeetup.ba',
        image_url: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg',
        year: 2024,
        start_date: '2024-08-20',
        end_date: '2024-08-20',
        expiry_date: '2024-09-20',
        supply: 100,
        event_template_id: 2,
        event_host_id: 2,
        private_event: false
      }
    ];

    // Filter by location (mock implementation)
    return mockEvents;
  } catch (error) {
    console.error('Error fetching nearby POAP events:', error);
    return [];
  }
};

export const convertPOAPToNFT = (poap: POAPToken) => {
  return {
    id: `poap-${poap.tokenId}`,
    name: poap.event.name,
    description: poap.event.description,
    image: poap.event.image_url,
    animation_url: poap.event.animation_url,
    location: `${poap.event.city}, ${poap.event.country}`,
    coordinates: { lat: -34.6037, lng: -58.3816 }, // Default to Buenos Aires
    rarity: 'Epic',
    category: 'Events',
    artist: 'POAP Protocol',
    supply: {
      current: poap.supply,
      total: poap.event.supply
    },
    attributes: [
      { trait_type: 'Event Type', value: 'POAP' },
      { trait_type: 'Year', value: poap.event.year.toString() },
      { trait_type: 'City', value: poap.event.city },
      { trait_type: 'Country', value: poap.event.country },
      { trait_type: 'Supply', value: poap.event.supply.toString() }
    ],
    rarityScore: Math.min(95, Math.max(70, 100 - (poap.event.supply / 10))),
    points: Math.floor(poap.event.supply < 100 ? 600 : poap.event.supply < 500 ? 400 : 200),
    collectedAt: poap.created,
    isCollected: true,
    isPOAP: true,
    poapData: poap
  };
};