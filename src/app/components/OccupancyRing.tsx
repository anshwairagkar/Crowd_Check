'use client';

import React from 'react';
import { DensityLevel } from './venueData';

interface OccupancyRingProps {
  percent: number;
  level: DensityLevel;
  size?: number;
}

const RING_COLORS: Record<DensityLevel, string> = {
  LOW: '#22c55e',
  MEDIUM: '#f59e0b',
  HIGH: '#ef4444',
  CRITICAL: '#dc2626',
};

const TRACK_COLORS: Record<DensityLevel, string> = {
  LOW: 'rgba(34,197,94,0.12)',
  MEDIUM: 'rgba(245,158,11,0.12)',
  HIGH: 'rgba(239,68,68,0.12)',
  CRITICAL: 'rgba(220,38,38,0.15)',
};

export default function OccupancyRing({ percent, level, size = 80 }: OccupancyRingProps) {
  const radius = (size - 10) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percent / 100) * circumference;
  const color = RING_COLORS[level];
  const track = TRACK_COLORS[level];

  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        <defs>
          <filter id={`glow-${level}`}>
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={track}
          strokeWidth={7}
        />
        {/* Progress */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={7}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          filter={`url(#glow-${level})`}
          style={{ transition: 'stroke-dashoffset 0.8s ease' }}
        />
      </svg>
      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="text-base font-bold text-tabular leading-none"
          style={{ color, fontSize: size < 70 ? '12px' : '14px' }}
        >
          {percent}%
        </span>
        <span
          className="text-xs leading-none mt-0.5"
          style={{ color: 'var(--muted-foreground)', fontSize: '9px' }}
        >
          full
        </span>
      </div>
    </div>
  );
}
