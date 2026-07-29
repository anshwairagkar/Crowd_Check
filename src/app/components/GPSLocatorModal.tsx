'use client';

import React, { useState, useMemo } from 'react';
import { X, Navigation, Loader2, CheckCircle, Radio } from 'lucide-react';
import { Venue, getDensityLevel } from './venueData';

interface GPSLocatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  venues: Venue[];
  onLocate: (name: string) => void;
}

type GPSState = 'idle' | 'locating' | 'located';

const DENSITY_COLORS: Record<string, string> = {
  LOW: 'var(--density-low)',
  MEDIUM: 'var(--density-medium)',
  HIGH: 'var(--density-high)',
  CRITICAL: 'var(--density-critical)',
};

// Math formula to calculate actual distance in kilometers between two map coordinates
function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default function GPSLocatorModal({ isOpen, onClose, venues, onLocate }: GPSLocatorModalProps) {
  const [gpsState, setGpsState] = useState<GPSState>('idle');
  const [userLoc, setUserLoc] = useState<{ lat: number; lng: number } | null>(null);

  if (!isOpen) return null;

  const handleLocateMe = () => {
    setGpsState('locating');

    // 1. Check if the browser supports GPS
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      setGpsState('idle');
      return;
    }

    // 2. Request the real device location
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLoc({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setGpsState('located');
      },
      (error) => {
        console.error('Error getting location:', error);
        alert('Could not get your location. Please ensure location permissions are allowed in your browser pop-up.');
        setGpsState('idle');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // 3. Automatically sort venues by real distance once location is found
  const sortedVenues = useMemo(() => {
    if (!userLoc) return venues.map((v) => ({ ...v, distance: null }));

    return venues
      .map((v) => {
        const distance = v.coordinates
          ? getDistance(userLoc.lat, userLoc.lng, v.coordinates.lat, v.coordinates.lng)
          : 9999;
        return { ...v, distance };
      })
      .sort((a, b) => (a.distance || 0) - (b.distance || 0));
  }, [venues, userLoc]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div
        className="w-full max-w-lg rounded-2xl border shadow-2xl overflow-hidden flex flex-col"
        style={{ background: 'var(--surface-1)', borderColor: 'var(--border)', maxHeight: '85vh' }}
      >
        {/* Header */}
        <div className="p-5 border-b flex items-start justify-between" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(34,211,238,0.1)', color: 'var(--primary)' }}
            >
              <Navigation size={20} />
            </div>
            <div>
              <h2 className="font-semibold text-lg" style={{ color: 'var(--foreground)' }}>
                GPS Venue Locator
              </h2>
              <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                Find monitored venues near your position
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg transition-colors hover:bg-white/5"
            style={{ color: 'var(--muted-foreground)' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-6 overflow-y-auto">
          {/* Status Box */}
          <div
            className="p-4 rounded-xl border flex items-center justify-between transition-all"
            style={{
              background: gpsState === 'located' ? 'rgba(16,185,129,0.05)' : 'rgba(255,255,255,0.02)',
              borderColor: gpsState === 'located' ? 'rgba(16,185,129,0.2)' : 'var(--border)',
            }}
          >
            <div>
              <h3
                className="font-medium flex items-center gap-2"
                style={{ color: gpsState === 'located' ? '#10b981' : 'var(--foreground)' }}
              >
                {gpsState === 'idle' && 'Location not detected'}
                {gpsState === 'locating' && 'Acquiring satellite lock...'}
                {gpsState === 'located' && (
                  <>
                    <CheckCircle size={16} /> Location acquired
                  </>
                )}
              </h3>
              <p className="text-sm mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
                {gpsState === 'idle' && 'Click to access GPS and find nearby venues'}
                {gpsState === 'locating' && 'Please allow location access in your browser'}
                {gpsState === 'located' && userLoc && `${userLoc.lat.toFixed(4)}° N, ${userLoc.lng.toFixed(4)}° E`}
              </p>
            </div>

            {gpsState === 'idle' && (
              <button
                onClick={handleLocateMe}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-transform hover:scale-105 active:scale-95 cursor-pointer"
                style={{ background: 'var(--primary)', color: '#000' }}
              >
                <Navigation size={16} /> Locate Me
              </button>
            )}
            {gpsState === 'locating' && (
              <div style={{ color: 'var(--primary)' }}>
                <Loader2 size={24} className="animate-spin" />
              </div>
            )}
            {gpsState === 'located' && (
              <div
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium"
                style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981' }}
              >
                <Radio size={14} /> GPS Fix
              </div>
            )}
          </div>

          {/* Venues List */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--muted-foreground)' }}>
              {gpsState === 'located' ? 'NEAREST VENUES' : 'ALL MONITORED VENUES'}
            </h4>
            <div className="space-y-2">
              {sortedVenues.map((venue, index) => {
                const density = Math.round((venue.presentCount / venue.maxCapacity) * 100);
                const level = getDensityLevel(venue.presentCount, venue.maxCapacity);
                const color = DENSITY_COLORS[level] || 'var(--foreground)';

                return (
                  <button
                    key={venue.id}
                    onClick={() => {
                      onLocate(venue.name);
                      onClose();
                    }}
                    className="w-full flex items-center justify-between p-4 rounded-xl border transition-colors hover:bg-white/5 text-left cursor-pointer"
                    style={{ borderColor: 'var(--border)', background: 'var(--surface-2)' }}
                  >
                    <div className="flex items-center gap-4">
                      <span className="font-bold text-sm w-4 text-center" style={{ color: 'var(--primary)' }}>
                        {index + 1}
                      </span>
                      <div>
                        <p className="font-medium text-sm" style={{ color: 'var(--foreground)' }}>
                          {venue.name}
                        </p>
                        <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                          {venue.category}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-right">
                      <span className="font-bold text-sm" style={{ color }}>
                        {density}%
                      </span>
                      <span className="text-xs font-medium w-16 text-right" style={{ color: 'var(--muted-foreground)' }}>
                        {venue.distance !== null ? `${venue.distance.toFixed(1)} km` : '---'}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
