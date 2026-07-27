'use client';

import React, { useState, useEffect } from 'react';
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

// Mock distances — static for SSR safety
const MOCK_DISTANCES: Record<string, string> = {
  'venue-001': '0.3 km',
  'venue-002': '0.8 km',
  'venue-003': '2.1 km',
  'venue-004': '0.5 km',
  'venue-005': '3.4 km',
  'venue-006': '1.2 km',
};

export default function GPSLocatorModal({
  isOpen,
  onClose,
  venues,
  onLocate,
}: GPSLocatorModalProps) {
  const [gpsState, setGpsState] = useState<GPSState>('idle');
  const [mockCoords, setMockCoords] = useState<{ lat: string; lng: string } | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setGpsState('idle');
      setMockCoords(null);
    }
  }, [isOpen]);

  const handleLocate = () => {
    setGpsState('locating');
    setTimeout(() => {
      setGpsState('located');
      setMockCoords({ lat: '22.7196', lng: '75.8577' });
    }, 2200);
  };

  const sortedVenues = [...venues].sort((a, b) => {
    const da = parseFloat(MOCK_DISTANCES[a.id] ?? '99');
    const db = parseFloat(MOCK_DISTANCES[b.id] ?? '99');
    return da - db;
  });

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(6,12,24,0.85)', backdropFilter: 'blur(6px)' }}
      role="dialog"
      aria-modal="true"
      aria-label="GPS Locator"
    >
      <div
        className="relative w-full max-w-lg rounded-2xl border shadow-2xl overflow-hidden fade-in-up"
        style={{ background: 'var(--surface-2)', borderColor: 'var(--border)' }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4 border-b"
          style={{ borderColor: 'var(--border)' }}
        >
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'rgba(34,211,238,0.12)' }}
            >
              <Navigation size={16} style={{ color: 'var(--primary)' }} />
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
                GPS Venue Locator
              </p>
              <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                Find monitored venues near your position
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Close GPS modal"
          >
            <X size={16} style={{ color: 'var(--muted-foreground)' }} />
          </button>
        </div>

        {/* GPS status area */}
        <div
          className="mx-5 mt-4 rounded-xl p-4 border"
          style={{
            background: 'rgba(34,211,238,0.04)',
            borderColor: 'rgba(34,211,238,0.15)',
          }}
        >
          {gpsState === 'idle' && (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                  Location not detected
                </p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
                  Click to simulate GPS fix and find nearby venues
                </p>
              </div>
              <button
                onClick={handleLocate}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 active:scale-95"
                style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}
              >
                <Navigation size={14} />
                Locate Me
              </button>
            </div>
          )}

          {gpsState === 'locating' && (
            <div className="flex items-center gap-3">
              <Loader2 size={18} className="animate-spin" style={{ color: 'var(--primary)' }} />
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--primary)' }}>
                  Acquiring GPS signal...
                </p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
                  Triangulating via cell towers and Wi-Fi
                </p>
              </div>
            </div>
          )}

          {gpsState === 'located' && mockCoords && (
            <div className="flex items-start gap-3">
              <CheckCircle size={18} style={{ color: 'var(--density-low)' }} className="flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-semibold" style={{ color: 'var(--density-low)' }}>
                  Location acquired
                </p>
                <p className="text-xs mt-0.5 font-mono text-tabular" style={{ color: 'var(--muted-foreground)' }}>
                  {mockCoords.lat}° N, {mockCoords.lng}° E
                </p>
              </div>
              <div
                className="flex items-center gap-1 text-xs px-2 py-1 rounded"
                style={{ background: 'rgba(34,197,94,0.1)', color: 'var(--density-low)' }}
              >
                <Radio size={10} />
                <span>GPS Fix</span>
              </div>
            </div>
          )}
        </div>

        {/* Venue list sorted by distance */}
        <div className="px-5 py-3">
          <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--muted-foreground)' }}>
            {gpsState === 'located' ? 'Nearest venues' : 'All monitored venues'}
          </p>
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {sortedVenues.map((v, idx) => {
              const level = getDensityLevel(v.presentCount, v.maxCapacity);
              const pct = Math.round((v.presentCount / v.maxCapacity) * 100);
              const dist = MOCK_DISTANCES[v.id] ?? '?';
              return (
                <button
                  key={`gps-venue-${v.id}`}
                  onClick={() => { onLocate(v.name); onClose(); }}
                  className="w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all duration-150 hover:scale-[0.99]"
                  style={{
                    background: 'var(--surface-3)',
                    borderColor: idx === 0 && gpsState === 'located' ? 'rgba(34,211,238,0.3)' : 'var(--border)',
                  }}
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold"
                    style={{
                      background: `${DENSITY_COLORS[level]}18`,
                      color: DENSITY_COLORS[level],
                    }}
                  >
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: 'var(--foreground)' }}>
                      {v.name}
                    </p>
                    <p className="text-xs truncate" style={{ color: 'var(--muted-foreground)' }}>
                      {v.category}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span
                      className="text-xs font-medium px-2 py-0.5 rounded-full"
                      style={{
                        background: `${DENSITY_COLORS[level]}18`,
                        color: DENSITY_COLORS[level],
                      }}
                    >
                      {pct}%
                    </span>
                    {gpsState === 'located' && (
                      <span className="text-xs font-mono text-tabular" style={{ color: 'var(--muted-foreground)' }}>
                        {dist}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="px-5 pb-4">
          <p className="text-xs text-center" style={{ color: 'var(--muted-foreground)' }}>
            GPS coordinates are simulated for demo purposes
          </p>
        </div>
      </div>
    </div>
  );
}
