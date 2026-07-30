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
    lastUpdated: '00:00:00',
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
    lastUpdated: '00:00:00',
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
    lastUpdated: '00:00:00',
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
    lastUpdated: '00:00:00',
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
    lastUpdated: '00:00:00',
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
    lastUpdated: '00:00:00',
  },
  {
    id: 'venue-007',
    name: 'Treasure Island Mall (TI Mall)',
    category: 'Retail',
    address: '11, Mahatma Gandhi Rd, South Tukoganj, Indore, Madhya Pradesh 452001',
    coordinates: { lat: 22.72097, lng: 75.87853 },
    maxCapacity: 3500,
    presentCount: 1280,
    waitingCount: 21,
    cameraCount: 85,
    floor: '8 Floors',
    openHours: '11:00 – 22:00',
    lastUpdated: '00:00:00',
  },
  {
    id: "venue-008",
    name: "Chappan Dukan",
    category: "Food & Dining",
    address: "Chappan Dukan, New Palasia, Indore, Madhya Pradesh 452001",
    coordinates: { "lat": 22.7244, "lng": 75.8839 },
    maxCapacity: 4000,
    presentCount: 1850,
    waitingCount: 120,
    cameraCount: 36,
    floor: "Ground Floor",
    openHours: "06:00 - 23:00",
    lastUpdated: "00:00:00"
  },
  {
    id: "venue-009",
    name: "Sarafa Bazar",
    category: "Food & Dining",
    address: "Sarafa Bazar, Rajwada, Indore, Madhya Pradesh 452002",
    coordinates: { "lat": 22.7196, "lng": 75.8537 },
    maxCapacity: 6000,
    presentCount: 6000,
    waitingCount: 0,
    cameraCount: 48,
    floor: "Ground Floor",
    openHours: "20:00 - 02:00",
    lastUpdated: "00:00:00"
  },
  {
    id: "venue-010",
    name: "Radisson Blu Hotel Indore",
    category: "Hospitality",
    address: "12, Scheme No 94, Sector EB, Vijay Nagar, Indore, Madhya Pradesh 452010",
    coordinates: { "lat": 22.7442, "lng": 75.8976 },
    maxCapacity: 1500,
    presentCount: 650,
    waitingCount: 0,
    cameraCount: 120,
    floor: "9 Floors",
    openHours: "00:00 - 24:00",
    lastUpdated: "00:00:00"
  },
  {
    id: "venue-011",
    name: "Indore Marriott Hotel",
    category: "Hospitality",
    address: "H-2, Scheme No 54, Meghdoot Garden, Vijay Nagar, Indore, Madhya Pradesh 452010",
    coordinates: { "lat": 22.7501, "lng": 75.8952 },
    maxCapacity: 1800,
    presentCount: 720,
    waitingCount: 0,
    cameraCount: 140,
    floor: "8 Floors",
    openHours: "00:00 - 24:00",
    lastUpdated: "00:00:00"
  },
  {
    id: "venue-012",
    name: "Phoenix Citadel Mall",
    category: "Retail",
    address: "MR-10, Junction, Jhalariya, Indore, Madhya Pradesh 452016",
    coordinates: { "lat": 22.7562, "lng": 75.9431 },
    maxCapacity: 25000,
    presentCount: 16000,
    waitingCount: 450,
    cameraCount: 450,
    floor: "5 Floors",
    openHours: "11:00 - 22:00",
    lastUpdated: "00:00:00"
  },
  {
    id: "venue-013",
    name: "Madhya Pradesh High Court (Indore Bench)",
    category: "Government",
    address: "High Court Road, South Tukoganj, Indore, Madhya Pradesh 452001",
    coordinates: { "lat": 22.7219, "lng": 75.8778 },
    maxCapacity: 2500,
    presentCount: 1100,
    waitingCount: 15,
    cameraCount: 75,
    floor: "3 Floors",
    openHours: "10:00 - 17:00",
    lastUpdated: "00:00:00"
  },
  {
    id: "venue-014",
    name: "Devi Ahilyabai Holkar International Airport (IDR)",
    category: "Transport Hub",
    address: "Depot Road, Dhar Road, Indore, Madhya Pradesh 452005",
    coordinates: { "lat": 22.7217, "lng": 75.8011 },
    maxCapacity: 7000,
    presentCount: 1950,
    waitingCount: 80,
    cameraCount: 210,
    floor: "2 Floors",
    openHours: "00:00 - 24:00",
    lastUpdated: "00:00:00"
  },
  {
    id: "venue-015",
    name: "Indore Junction",
    category: "Transport Hub",
    address: "Chhoti Gwaltoli, Indore, Madhya Pradesh 452001",
    coordinates: { "lat": 22.7175, "lng": 75.8692 },
    maxCapacity: 35000,
    presentCount: 9200,
    waitingCount: 0,
    cameraCount: 160,
    floor: "Ground Floor",
    openHours: "00:00 - 24:00",
    lastUpdated: "00:00:00"
  },
  {
    id: "venue-016",
    name: "Rajwada Palace",
    category: "Cultural",
    address: "Rajwada, Indore, Madhya Pradesh 452002",
    coordinates: { "lat": 22.7195, "lng": 75.8538 },
    maxCapacity: 1200,
    presentCount: 450,
    waitingCount: 35,
    cameraCount: 32,
    floor: "7 Floors",
    openHours: "10:00 - 17:00",
    lastUpdated: "00:00:00"
  },
  {
    id: "venue-017",
    name: "Khajrana Ganesh Temple",
    category: "Cultural",
    address: "Khajrana Road, Ganeshpuri Colony, Indore, Madhya Pradesh 452016",
    coordinates: { "lat": 22.7388, "lng": 75.8994 },
    maxCapacity: 15000,
    presentCount: 3200,
    waitingCount: 150,
    cameraCount: 64,
    floor: "Ground Floor",
    openHours: "05:00 - 23:00",
    lastUpdated: "00:00:00"
  },
  {
    id: "venue-018",
    name: "Lal Bagh Palace",
    category: "Cultural",
    address: "Nai Duniya, Revenue Colony, Indra Mani Nagar, Indore, Madhya Pradesh 452009",
    coordinates: { "lat": 22.6997, "lng": 75.8344 },
    maxCapacity: 1000,
    presentCount: 220,
    waitingCount: 10,
    cameraCount: 28,
    floor: "3 Floors",
    openHours: "10:00 - 17:00",
    lastUpdated: "00:00:00"
  },
  {
    id: "venue-019",
    name: "Maharaja Yeshwantrao Hospital (MYH)",
    category: "Healthcare",
    address: "MY Hospital Road, Chhoti Gwaltoli, Indore, Madhya Pradesh 452001",
    coordinates: { "lat": 22.7214, "lng": 75.8698 },
    maxCapacity: 6000,
    presentCount: 4100,
    waitingCount: 85,
    cameraCount: 110,
    floor: "7 Floors",
    openHours: "00:00 - 24:00",
    lastUpdated: "00:00:00"
  },
  {
    id: "venue-020",
    name: "Choithram Hospital and Research Centre",
    category: "Healthcare",
    address: "Manik Bagh Road, Choithram Square, Indore, Madhya Pradesh 452014",
    coordinates: { "lat": 22.6865, "lng": 75.8451 },
    maxCapacity: 2500,
    presentCount: 1350,
    waitingCount: 20,
    cameraCount: 95,
    floor: "5 Floors",
    openHours: "00:00 - 24:00",
    lastUpdated: "00:00:00"
  },
  {
    id: "venue-021",
    name: "Medanta Super Specialty Hospital",
    category: "Healthcare",
    address: "Plot No. 8, PU4, Commercial Scheme, Vijay Nagar, Indore, Madhya Pradesh 452010",
    coordinates: { "lat": 22.7486, "lng": 75.8967 },
    maxCapacity: 1800,
    presentCount: 980,
    waitingCount: 15,
    cameraCount: 80,
    floor: "6 Floors",
    openHours: "00:00 - 24:00",
    lastUpdated: "00:00:00"
  },
  {
    id: "venue-022",
    name: "IIT Indore",
    category: "Education",
    address: "Khandwa Road, Simrol, Indore, Madhya Pradesh 453552",
    coordinates: { "lat": 22.5204, "lng": 75.9207 },
    maxCapacity: 8000,
    presentCount: 4200,
    waitingCount: 0,
    cameraCount: 280,
    floor: "Campus",
    openHours: "00:00 - 24:00",
    lastUpdated: "00:00:00"
  },
  {
    id: "venue-023",
    name: "IIM Indore",
    category: "Education",
    address: "Prabandh Shikhar, Rau-Pithampur Road, Indore, Madhya Pradesh 453556",
    coordinates: { "lat": 22.6214, "lng": 75.7831 },
    maxCapacity: 5000,
    presentCount: 2900,
    waitingCount: 0,
    cameraCount: 210,
    floor: "Campus",
    openHours: "00:00 - 24:00",
    lastUpdated: "00:00:00"
  },
  {
    id: "venue-024",
    name: "Devi Ahilya Vishwavidyalaya (DAVV)",
    category: "Education",
    address: "Nalanda Campus, RNT Marg, Indore, Madhya Pradesh 452001",
    coordinates: { "lat": 22.7161, "lng": 75.8711 },
    maxCapacity: 12000,
    presentCount: 5400,
    waitingCount: 0,
    cameraCount: 190,
    floor: "Campus",
    openHours: "09:00 - 18:00",
    lastUpdated: "00:00:00"
  },
  {
    id: "venue-025",
    name: "Indore Municipal Corporation (IMC)",
    category: "Government",
    address: "Narayan Singgh Saput Marg, Shivaji Nagar, Indore, Madhya Pradesh 452007",
    coordinates: { "lat": 22.7138, "lng": 75.8672 },
    maxCapacity: 2000,
    presentCount: 850,
    waitingCount: 40,
    cameraCount: 85,
    floor: "4 Floors",
    openHours: "10:00 - 18:00",
    lastUpdated: "00:00:00"
  },
  {
  "id": "venue-026",
  "name": "Bhawarkuan Square",
  "category": "Traffic Intersection",
  "address": "AB Road, Bhawarkuan, Indore, Madhya Pradesh 452001",
  "coordinates": { "lat": 22.6865, "lng": 75.8722 },
  "maxCapacity": 500,
  "presentCount": 300,
  "waitingCount": 300,
  "cameraCount": 3,
  "floor": "Street Level",
  "openHours": "00:00 - 24:00",
  "lastUpdated": "00:00:00"
  },
  {
  "id": "venue-027",
  "name": "Palasia Square",
  "category": "Traffic Intersection",
  "address": "MG Road, Old Palasia, Indore, Madhya Pradesh 452001",
  "coordinates": { "lat": 22.7242, "lng": 75.8838 },
  "maxCapacity": 800,
  "presentCount": 580,
  "waitingCount": 290,
  "cameraCount": 5,
  "floor": "Street Level",
  "openHours": "00:00 - 24:00",
  "lastUpdated": "00:00:00"
  },
  {
  "id": "venue-028",
  "name": "Vijay Nagar Square",
  "category": "Traffic Intersection",
  "address": "AB Road, Scheme No 54, Indore, Madhya Pradesh 452010",
  "coordinates": { "lat": 22.7544, "lng": 75.8839 },
  "maxCapacity": 1000,
  "presentCount": 720,
  "waitingCount": 380,
  "cameraCount": 6,
  "floor": "Metro Level",
  "openHours": "00:00 - 24:00",
  "lastUpdated": "00:00:00"
  },
  {
  "id": "venue-029",
  "name": "Radisson Square",
  "category": "Traffic Intersection",
  "address": "Eastern Ring Road, Vijay Nagar, Indore, Madhya Pradesh 452010",
  "coordinates": { "lat": 22.7533, "lng": 75.8937 },
  "maxCapacity": 1200,
  "presentCount": 850,
  "waitingCount": 450,
  "cameraCount": 8,
  "floor": "Flyover",
  "openHours": "00:00 - 24:00",
  "lastUpdated": "00:00:00"
  },

];

// Helper function to check if a venue is currently open
export function checkIsOpen(openHours: string): boolean {
  if (!openHours || openHours.includes('24/7')) return true;

  try {
    const [start, end] = openHours.split(' - ');
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTime = currentHour + currentMinute / 60;

    const [startH, startM] = start.split(':').map(Number);
    const startTime = startH + (startM || 0) / 60;

    const [endH, endM] = end.split(':').map(Number);
    const endTime = endH + (endM || 0) / 60;

    if (startTime < endTime) {
      // Normal hours (e.g., 09:00 - 21:00)
      return currentTime >= startTime && currentTime <= endTime;
    } else {
      // Overnight hours (e.g., 05:00 - 01:00)
      return currentTime >= startTime || currentTime <= endTime;
    }
  } catch (e) {
    return true; // If there is a typo in the hours, assume it is open to be safe
  }
}
