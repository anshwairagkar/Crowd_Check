'use client';

import React, { useRef, useEffect, useState } from 'react';
import { getDensityLevel, getOccupancyPercent, Venue, checkIsOpen, DensityLevel } from './venueData';
import { Users, Clock, MapPin, Building2, TrendingUp, TrendingDown, Minus, Video, Car } from 'lucide-react';
import OccupancyRing from './OccupancyRing';
import MiniSparkline from './MiniSparkline';
import CCTVFeedModal from './CCTVFeedModal';

interface VenueCardProps {
  venue: Venue;
  isUpdated: boolean;
  timeShift?: number; // 1. Added timeShift to the interface
}

const DENSITY_CONFIG: Record<DensityLevel, {
  label: string;
  textColor: string;
  bgColor: string;
  borderColor: string;
  ringColor: string;
  glowClass: string;
}> = {
  LOW: {
    label: 'Low',
    textColor: 'var(--density-low)',
    bgColor: 'rgba(34,197,94,0.1)',
    borderColor: 'rgba(34,197,94,0.25)',
    ringColor: 'var(--density-low)',
    glowClass: '',
  },
  MEDIUM: {
    label: 'Medium',
    textColor: 'var(--density-medium)',
    bgColor: 'rgba(245,158,11,0.1)',
    borderColor: 'rgba(245,158,11,0.25)',
    ringColor: 'var(--density-medium)',
    glowClass: 'glow-amber',
  },
  HIGH: {
    label: 'High',
    textColor: 'var(--density-high)',
    bgColor: 'rgba(239,68,68,0.1)',
    borderColor: 'rgba(239,68,68,0.3)',
    ringColor: 'var(--density-high)',
    glowClass: 'glow-red',
  },
  CRITICAL: {
    label: 'Critical',
    textColor: '#fca5a5',
    bgColor: 'rgba(220,38,38,0.15)',
    borderColor: 'rgba(220,38,38,0.4)',
    ringColor: 'var(--density-critical)',
    glowClass: 'glow-red',
  },
};

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  'Food & Dining': Building2,
  'Hospitality': Building2,
  'Retail': Building2,
  'Transport Hub': Building2,
  'Cultural': Building2,
};

// 2. Added the time-checking helper
const checkOpenWithOffset = (hours: string, offsetHours: number) => {
  if (hours === '24/7') return true;
  try {
    const now = new Date();
    now.setHours(now.getHours() + offsetHours);
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const [startStr, endStr] = hours.split(' - ');
    if (!startStr || !endStr) return true;
    
    const startMins = parseInt(startStr.split(':')[0]) * 60 + parseInt(startStr.split(':')[1]);
    const endMins = parseInt(endStr.split(':')[0]) * 60 + parseInt(endStr.split(':')[1]);
    
    if (startMins <= endMins) {
      return currentMinutes >= startMins && currentMinutes < endMins;
    } else { 
      return currentMinutes >= startMins || currentMinutes < endMins;
    }
  } catch (e) { return true; }
};

// 3. Destructured timeShift from the props
export default function VenueCard({ venue, isUpdated, timeShift = 0 }: VenueCardProps) {
  // 4. Determine open status based on the timeline slider!
  const isOpen = checkOpenWithOffset(venue.openHours, timeShift);

  const prevPresent = useRef(venue.presentCount);
  const [trend, setTrend] = useState<'up' | 'down' | 'flat'>('flat');
  const [showCCTV, setShowCCTV] = useState(false);
  
  // --- TRAFFIC LIGHT STATE ---
  const [lightStatus, setLightStatus] = useState<'red' | 'yellow' | 'green'>('red');

  // --- DYNAMIC TRAFFIC DATA STATE ---
  const [simPresent, setSimPresent] = useState(venue.presentCount);
  const [simWaiting, setSimWaiting] = useState(venue.waitingCount);

  // --- TRAFFIC LIGHT SIMULATION LOOP ---
  useEffect(() => {
    if (venue.category !== 'Traffic Intersection' || !isOpen) return;

    let timeout: NodeJS.Timeout;
    
    const cycleLight = (current: 'red' | 'yellow' | 'green') => {
      if (current === 'red') {
        setLightStatus('green');
        timeout = setTimeout(() => cycleLight('green'), 60000); // Green for 1 minute
      } else if (current === 'green') {
        setLightStatus('yellow');
        timeout = setTimeout(() => cycleLight('yellow'), 5000); // Yellow for 5 seconds
      } else {
        setLightStatus('red');
        timeout = setTimeout(() => cycleLight('red'), 60000); // Red for 1 minute
      }
    };

    const states: ('red' | 'yellow' | 'green')[] = ['red', 'yellow', 'green'];
    const initial = states[Math.floor(Math.random() * states.length)];
    setLightStatus(initial);
    cycleLight(initial);

    return () => clearTimeout(timeout);
  }, [venue.category, isOpen]);

  // --- DYNAMIC DATA SYNC ---
  // Ties the numbers directly to the traffic light status every time the parent pulses
  useEffect(() => {
    if (venue.category !== 'Traffic Intersection' || !isOpen) {
      setSimPresent(venue.presentCount);
      setSimWaiting(venue.waitingCount);
      return;
    }

    if (lightStatus === 'red') {
      // Red: High queue, almost no crossing
      setSimPresent(Math.floor(Math.random() * 20) + 10); 
      setSimWaiting(Math.floor(Math.random() * 200) + 400); 
    } else if (lightStatus === 'green') {
      // Green: High crossing, clearing queue
      setSimPresent(Math.floor(Math.random() * 150) + 150); 
      setSimWaiting(Math.floor(Math.random() * 30) + 10); 
    } else if (lightStatus === 'yellow') {
      // Yellow: Transitioning
      setSimPresent(Math.floor(Math.random() * 50) + 80); 
      setSimWaiting(Math.floor(Math.random() * 100) + 100); 
    }
  }, [lightStatus, venue.presentCount, venue.category, isOpen]);

  // Determine final display values based on category
  const displayPresent = venue.category === 'Traffic Intersection' && isOpen ? simPresent : venue.presentCount;
  const displayWaiting = venue.category === 'Traffic Intersection' && isOpen ? simWaiting : venue.waitingCount;

  // Calculate density graphics dynamically based on final display values
  const level = getDensityLevel(displayPresent, venue.maxCapacity);
  const pct = getOccupancyPercent(displayPresent, venue.maxCapacity);
  const config = DENSITY_CONFIG[level];

  // --- TREND ARROWS ---
  useEffect(() => {
    if (displayPresent > prevPresent.current) setTrend('up');
    else if (displayPresent < prevPresent.current) setTrend('down');
    else setTrend('flat');
    prevPresent.current = displayPresent;
  }, [displayPresent]);

  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const trendColor = trend === 'up' ? 'var(--density-high)' : trend === 'down' ? 'var(--density-low)' : 'var(--muted-foreground)';

  return (
    <>
      {showCCTV && <CCTVFeedModal venue={venue} onClose={() => setShowCCTV(false)} />}
      <div
        className={`relative rounded-2xl border overflow-hidden card-hover ${config.glowClass} ${isUpdated ? '' : ''}`}
        style={{
          background: 'var(--surface-2)',
          borderColor: level === 'HIGH' || level === 'CRITICAL' ? config.borderColor : 'var(--border)',
          transition: 'border-color 0.5s ease, box-shadow 0.3s ease',
          cursor: 'pointer',
        }}
        onClick={() => setShowCCTV(true)}
        role="button"
        aria-label={`View CCTV feeds for ${venue.name}`}
        tabIndex={0}
        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setShowCCTV(true); }}
      >
        {/* Updated flash overlay */}
        {isUpdated && (
          <div
            className="absolute inset-0 pointer-events-none z-10 rounded-2xl"
            style={{
              background: 'rgba(34,211,238,0.03)',
              transition: 'opacity 0.5s',
            }}
          />
        )}

        {/* Top stripe for high/critical */}
        {(level === 'HIGH' || level === 'CRITICAL') && (
          <div
            className="h-0.5 w-full"
            style={{ background: `linear-gradient(90deg, transparent, ${config.ringColor}, transparent)` }}
          />
        )}

        <div className="p-5">
          {/* Header row */}
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span
                  className="w-1.5 h-1.5 rounded-full live-pulse flex-shrink-0"
                  style={{ background: config.ringColor }}
                />
                <p className="text-xs font-medium uppercase tracking-wider truncate" style={{ color: 'var(--muted-foreground)' }}>
                  {venue.category}
                </p>
              </div>
              
              {/* Title and Traffic Light Container */}
              <div className="flex items-center gap-3">
                <h3
                  className="text-base font-semibold leading-snug"
                  style={{ color: 'var(--foreground)' }}
                  title={venue.name}
                >
                  {venue.name}
                </h3>
                {isOpen && venue.category === 'Traffic Intersection' && (
                  <div
                    className="flex flex-col items-center justify-between py-1.5 px-1 rounded-full border shadow-inner"
                    style={{ background: 'rgba(0,0,0,0.3)', borderColor: 'var(--border)', height: '44px', width: '18px' }}
                    aria-label={`Traffic Light: ${lightStatus}`}
                  >
                    <div className="w-2 h-2 rounded-full transition-colors duration-300" style={{ background: lightStatus === 'red' ? '#ef4444' : 'rgba(239,68,68,0.15)', boxShadow: lightStatus === 'red' ? '0 0 8px #ef4444' : 'none' }} />
                    <div className="w-2 h-2 rounded-full transition-colors duration-300" style={{ background: lightStatus === 'yellow' ? '#facc15' : 'rgba(250,204,21,0.15)', boxShadow: lightStatus === 'yellow' ? '0 0 8px #facc15' : 'none' }} />
                    <div className="w-2 h-2 rounded-full transition-colors duration-300" style={{ background: lightStatus === 'green' ? '#22c55e' : 'rgba(34,197,94,0.15)', boxShadow: lightStatus === 'green' ? '0 0 8px #22c55e' : 'none' }} />
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-1 mt-1">
                <MapPin size={11} style={{ color: 'var(--muted-foreground)' }} className="flex-shrink-0" />
                <p className="text-xs truncate" style={{ color: 'var(--muted-foreground)' }}>
                  {venue.floor && `${venue.floor} · `}{venue.openHours}
                </p>
              </div>
            </div>

            {/* Density badge */}
            <div className="flex flex-col items-end gap-2 flex-shrink-0">
              {!isOpen ? (
                <span
                  className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    borderColor: 'var(--border)',
                    color: 'var(--muted-foreground)',
                  }}
                >
                  Closed
                </span>
              ) : (
                <span
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border"
                  style={{
                    background: config.bgColor,
                    borderColor: config.borderColor,
                    color: config.textColor,
                  }}
                  aria-label={`Density: ${config.label}`}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{
                      background: config.ringColor,
                      boxShadow: `0 0 4px ${config.ringColor}`,
                    }}
                  />
                  {config.label}
                </span>
              )}
            </div>
          </div>

          {/* Occupancy ring + metrics */}
          <div className="flex items-center gap-4 mb-4">
            <OccupancyRing percent={pct} level={level} size={80} />

            <div className="flex-1 space-y-2">
              {/* People / Vehicles inside/crossing */}
              <div
                className="flex items-center justify-between p-2.5 rounded-xl"
                style={{ background: 'var(--surface-3)' }}
              >
                <div className="flex items-center gap-2">
                  {venue.category === 'Traffic Intersection' ? (
                    <Car size={14} style={{ color: config.textColor }} />
                  ) : (
                    <Users size={14} style={{ color: config.textColor }} />
                  )}
                  <span className="text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>
                    {venue.category === 'Traffic Intersection' ? 'Crossing' : 'Inside'}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span
                    className={`text-base font-bold text-tabular ${isUpdated ? 'number-flash' : ''}`}
                    style={{ color: 'var(--foreground)' }}
                  >
                    {displayPresent.toLocaleString()}
                  </span>
                  <TrendIcon size={12} style={{ color: trendColor }} />
                </div>
              </div>

              {/* Max capacity */}
              <div
                className="flex items-center justify-between p-2.5 rounded-xl"
                style={{ background: 'var(--surface-3)' }}
              >
                <div className="flex items-center gap-2">
                  <TrendingUp size={14} style={{ color: 'var(--muted-foreground)' }} />
                  <span className="text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>
                    Capacity
                  </span>
                </div>
                <span className="text-base font-bold text-tabular" style={{ color: 'var(--foreground)' }}>
                  {venue.maxCapacity.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Waiting count / Traffic queue */}
          <div
            className="flex items-center justify-between p-3 rounded-xl mb-3"
            style={{
              background: displayWaiting > 0 ? 'rgba(245,158,11,0.06)' : 'var(--surface-3)',
              border: `1px solid ${displayWaiting > 0 ? 'rgba(245,158,11,0.15)' : 'transparent'}`,
            }}
          >
            <div className="flex items-center gap-2">
              <Clock
                size={14}
                style={{ color: displayWaiting > 0 ? 'var(--density-medium)' : 'var(--muted-foreground)' }}
              />
              <span className="text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>
                {venue.category === 'Traffic Intersection' ? 'Waiting at Light' : 'Waiting Outside'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`text-sm font-bold text-tabular ${isUpdated ? 'number-flash' : ''}`}
                style={{ color: displayWaiting > 0 ? 'var(--density-medium)' : 'var(--muted-foreground)' }}
              >
                {displayWaiting.toLocaleString()}
              </span>
              {displayWaiting > 0 && (
                <span
                  className="text-xs px-1.5 py-0.5 rounded font-medium"
                  style={{ background: 'rgba(245,158,11,0.12)', color: 'var(--density-medium)' }}
                >
                  {venue.category === 'Traffic Intersection' ? 'stopped' : 'queue'}
                </span>
              )}
            </div>
          </div>

          {/* Capacity progress bar */}
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                Occupancy
              </span>
              <span
                className="text-xs font-bold text-tabular"
                style={{ color: config.textColor }}
              >
                {pct}%
              </span>
            </div>
            <div
              className="w-full h-2 rounded-full overflow-hidden"
              style={{ background: 'var(--surface-3)' }}
              role="progressbar"
              aria-valuenow={pct}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`${pct}% occupancy`}
            >
              <div
                className="h-full rounded-full"
                style={{
                  width: `${pct}%`,
                  background: `linear-gradient(90deg, ${config.ringColor}aa, ${config.ringColor})`,
                  boxShadow: `0 0 6px ${config.ringColor}60`,
                  transition: 'width 0.8s ease',
                }}
              />
            </div>
          </div>

          {/* Sparkline */}
          <MiniSparkline venueId={venue.id} presentCount={displayPresent} maxCapacity={venue.maxCapacity} />

          {/* Footer */}
          <div
            className="flex items-center justify-between mt-3 pt-3 border-t"
            style={{ borderColor: 'var(--border)' }}
          >
            <button
              onClick={e => { e.stopPropagation(); setShowCCTV(true); }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-colors hover:bg-white/5"
              aria-label={`View CCTV feeds for ${venue.name}`}
            >
              <Video size={12} style={{ color: 'var(--primary)' }} />
              <span className="text-xs font-medium" style={{ color: 'var(--primary)' }}>
                {venue.cameraCount} feeds
              </span>
            </button>
            <div className="flex items-center gap-1.5">
              <span
                className="w-1.5 h-1.5 rounded-full live-pulse"
                style={{ background: 'var(--density-low)' }}
              />
              <span className="text-xs font-mono text-tabular" style={{ color: 'var(--muted-foreground)' }}>
                {venue.lastUpdated}
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
