'use client';

import { Venue, INITIAL_VENUES } from './venueData';

const STORAGE_KEY = 'crowdcheck_venues';

export function loadVenues(): Venue[] {
  if (typeof window === 'undefined') return INITIAL_VENUES;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL_VENUES;
    const parsed = JSON.parse(raw) as Venue[];
    return parsed.length > 0 ? parsed : INITIAL_VENUES;
  } catch {
    return INITIAL_VENUES;
  }
}

export function saveVenues(venues: Venue[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(venues));
  } catch {
    // storage full or unavailable — silently ignore
  }
}

export function generateVenueId(): string {
  return `venue-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function createVenue(
  name: string,
  category: string,
  address: string,
  maxCapacity: number,
  floor: string,
  openHours: string,
  cameraCount: number
): Venue {
  return {
    id: generateVenueId(),
    name,
    category,
    address,
    coordinates: { lat: 40.7128 + (Math.random() - 0.5) * 0.1, lng: -74.006 + (Math.random() - 0.5) * 0.1 },
    maxCapacity,
    presentCount: Math.floor(maxCapacity * 0.3),
    waitingCount: 0,
    cameraCount,
    floor: floor || undefined,
    openHours,
    lastUpdated: new Date().toLocaleTimeString('en-US', { hour12: false }),
  };
}
