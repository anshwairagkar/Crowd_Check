export type DensityLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface Venue {
  id: string;
  name: string;
  category: string;
  address: string;
  coordinates: { lat: number; lng: number };
  maxCapacity: number;
  presentCount: number;
  waitingCount: number;
  cameraCount: number;
  floor?: string;
  openHours: string;
  lastUpdated: string;
}

export function getDensityLevel(present: number, max: number): DensityLevel {
  const ratio = present / max;
  if (ratio > 1.0) return 'CRITICAL';
  if (ratio > 0.85) return 'HIGH';
  if (ratio >= 0.5) return 'MEDIUM';
  return 'LOW';
}

export function getOccupancyPercent(present: number, max: number): number {
  return Math.min(Math.round((present / max) * 100), 100);
}

export const INITIAL_VENUES: Venue[] = [
  {
    id: 'venue-001',
    name: 'Central Station Cafeteria',
    category: 'Food & Dining',
    address: '1 Central Plaza, Level 2, New York, NY 10007',
    coordinates: { lat: 40.7128, lng: -74.006 },
    maxCapacity: 320,
    presentCount: 274,
    waitingCount: 38,
    cameraCount: 8,
    floor: 'Level 2',
    openHours: '06:00 – 22:00',
    lastUpdated: '07:42:22',
  },
  {
    id: 'venue-002',
    name: 'Grand Plaza Hotel Lobby',
    category: 'Hospitality',
    address: '500 Grand Plaza Ave, Manhattan, NY 10036',
    coordinates: { lat: 40.758, lng: -73.9855 },
    maxCapacity: 180,
    presentCount: 67,
    waitingCount: 0,
    cameraCount: 6,
    floor: 'Ground Floor',
    openHours: '24/7',
    lastUpdated: '07:42:21',
  },
  {
    id: 'venue-003',
    name: 'Westfield Shopping Centre',
    category: 'Retail',
    address: '235 Westfield Blvd, Brooklyn, NY 11201',
    coordinates: { lat: 40.6892, lng: -73.9442 },
    maxCapacity: 2400,
    presentCount: 1892,
    waitingCount: 145,
    cameraCount: 24,
    floor: 'All Floors',
    openHours: '09:00 – 21:00',
    lastUpdated: '07:42:20',
  },
  {
    id: 'venue-004',
    name: 'City Hall Metro Station',
    category: 'Transport Hub',
    address: 'City Hall Station, Park Row, New York, NY 10007',
    coordinates: { lat: 40.7135, lng: -74.0087 },
    maxCapacity: 800,
    presentCount: 312,
    waitingCount: 54,
    cameraCount: 12,
    floor: 'Concourse',
    openHours: '05:00 – 01:00',
    lastUpdated: '07:42:19',
  },
  {
    id: 'venue-005',
    name: 'Brooklyn Museum Atrium',
    category: 'Cultural',
    address: '200 Eastern Pkwy, Brooklyn, NY 11238',
    coordinates: { lat: 40.6712, lng: -73.9637 },
    maxCapacity: 650,
    presentCount: 88,
    waitingCount: 0,
    cameraCount: 10,
    floor: 'Main Atrium',
    openHours: '11:00 – 18:00',
    lastUpdated: '07:42:18',
  },
  {
    id: 'venue-006',
    name: 'Hudson Yards Food Hall',
    category: 'Food & Dining',
    address: '20 Hudson Yards, Level 4, New York, NY 10001',
    coordinates: { lat: 40.7538, lng: -74.0009 },
    maxCapacity: 420,
    presentCount: 388,
    waitingCount: 72,
    cameraCount: 14,
    floor: 'Level 4',
    openHours: '08:00 – 23:00',
    lastUpdated: '07:42:17',
  },
  {
    id: 'venue-007',
    name: 'Treasure Island Mall (TI Mall)',
    category: 'Retail',
    address: '11, Mahatma Gandhi Rd, South Tukoganj, Indore, Madhya Pradesh 452001',
    coordinates: { lat: 22.72097, lng: 75.87853 },
    maxCapacity: 2400,
    presentCount: 128,
    waitingCount: 555,
    cameraCount: 21,
    floor: '8 Floors',
    openHours: '11:00 – 22:00',
    lastUpdated: '07:42:18',
  },
];
