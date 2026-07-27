'use client';

import React from 'react';
import { Venue, getDensityLevel } from './venueData';
import { Radio, Clock } from 'lucide-react';

interface LiveTickerBarProps {
  venues: Venue[];
  lastRefresh: string;
}

export default function LiveTickerBar({ venues, lastRefresh }: LiveTickerBarProps) {
  const totalPeople = venues.reduce((s, v) => s + v.presentCount, 0);
  const highCount = venues.filter(v => {
    const lvl = getDensityLevel(v.presentCount, v.maxCapacity);
    return lvl === 'HIGH' || lvl === 'CRITICAL';
  }).length;

  return (
    <div
      className="flex items-center justify-between rounded-lg px-4 py-2.5 border"
      style={{
        background: 'rgba(34,211,238,0.04)',
        borderColor: 'rgba(34,211,238,0.15)',
      }}
    >
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-full live-pulse flex-shrink-0"
            style={{ background: 'var(--density-low)' }}
          />
          <Radio size={14} style={{ color: 'var(--primary)' }} />
          <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--primary)' }}>
            Live Feed
          </span>
        </div>
        <span className="text-xs" style={{ color: 'var(--border)' }}>|</span>
        <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
          <span className="font-semibold text-tabular" style={{ color: 'var(--foreground)' }}>
            {totalPeople.toLocaleString()}
          </span>{' '}
          people monitored across{' '}
          <span className="font-semibold" style={{ color: 'var(--foreground)' }}>
            {venues.length}
          </span>{' '}
          venues
        </span>
        {highCount > 0 && (
          <>
            <span className="text-xs" style={{ color: 'var(--border)' }}>|</span>
            <span
              className="text-xs font-semibold flex items-center gap-1"
              style={{ color: 'var(--density-high)' }}
            >
              <span className="w-1.5 h-1.5 rounded-full alert-pulse" style={{ background: 'var(--density-high)', display: 'inline-block' }} />
              {highCount} venue{highCount > 1 ? 's' : ''} at HIGH density
            </span>
          </>
        )}
      </div>

      <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--muted-foreground)' }}>
        <Clock size={12} />
        <span>Last refresh</span>
        <span className="font-mono font-semibold text-tabular" style={{ color: 'var(--primary)' }}>
          {lastRefresh || '--:--:--'}
        </span>
      </div>
    </div>
  );
}
