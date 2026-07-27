'use client';

import React, { useState } from 'react';
import { Venue, getDensityLevel } from './venueData';
import { AlertTriangle, X, ChevronRight } from 'lucide-react';

interface AlertBannerProps {
  venues: Venue[];
}

export default function AlertBanner({ venues }: AlertBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed || venues.length === 0) return null;

  return (
    <div
      className="relative flex items-start gap-3 rounded-lg px-4 py-3 border alert-pulse"
      style={{
        background: 'rgba(239,68,68,0.07)',
        borderColor: 'rgba(239,68,68,0.3)',
      }}
      role="alert"
      aria-live="polite"
    >
      <AlertTriangle
        size={18}
        className="flex-shrink-0 mt-0.5"
        style={{ color: 'var(--density-high)' }}
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold" style={{ color: 'var(--density-high)' }}>
          {venues.length} venue{venues.length > 1 ? 's' : ''} approaching or exceeding safe capacity
        </p>
        <div className="mt-1 flex flex-wrap gap-2">
          {venues.map(v => {
            const level = getDensityLevel(v.presentCount, v.maxCapacity);
            const pct = Math.round((v.presentCount / v.maxCapacity) * 100);
            return (
              <span
                key={`alert-${v.id}`}
                className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium border"
                style={{
                  background: level === 'CRITICAL' ? 'rgba(220,38,38,0.2)' : 'rgba(239,68,68,0.15)',
                  borderColor: level === 'CRITICAL' ? 'rgba(220,38,38,0.5)' : 'rgba(239,68,68,0.3)',
                  color: level === 'CRITICAL' ? '#fca5a5' : '#fca5a5',
                }}
              >
                <ChevronRight size={10} />
                {v.name} — {pct}% full
              </span>
            );
          })}
        </div>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="p-1 rounded transition-colors hover:bg-white/10"
        aria-label="Dismiss alert"
      >
        <X size={14} style={{ color: 'var(--muted-foreground)' }} />
      </button>
    </div>
  );
}
