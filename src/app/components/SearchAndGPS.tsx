'use client';

import React, { useState } from 'react';
import { Search, RefreshCw, Pause, Play, ChevronDown, X, Navigation } from 'lucide-react';
import { Venue } from './venueData';
import GPSLocatorModal from './GPSLocatorModal';

interface SearchAndGPSProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  filterCategory: string;
  onCategoryChange: (c: string) => void;
  categories: string[];
  isSimulating: boolean;
  onToggleSimulation: () => void;
  refreshInterval: number;
  onRefreshIntervalChange: (n: number) => void;
  onGPSLocate: (name: string) => void;
  venues: Venue[];
}

export default function SearchAndGPS({
  searchQuery,
  onSearchChange,
  filterCategory,
  onCategoryChange,
  categories,
  isSimulating,
  onToggleSimulation,
  refreshInterval,
  onRefreshIntervalChange,
  onGPSLocate,
  venues,
}: SearchAndGPSProps) {
  const [gpsOpen, setGpsOpen] = useState(false);
  const [intervalOpen, setIntervalOpen] = useState(false);

  const intervals = [1, 2, 3, 5, 10];

  return (
    <>
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
        {/* Search */}
        <div className="relative flex-1 min-w-0">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: 'var(--muted-foreground)' }}
          />
          <input
            type="text"
            placeholder="Search venues by name, address, or category..."
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-9 py-2.5 rounded-lg text-sm border transition-colors focus:outline-none focus:ring-2"
            style={{
              background: 'var(--surface-2)',
              borderColor: 'var(--border)',
              color: 'var(--foreground)',
              '--tw-ring-color': 'rgba(34,211,238,0.3)',
            } as React.CSSProperties}
            aria-label="Search venues"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-white/10 transition-colors"
              aria-label="Clear search"
            >
              <X size={13} style={{ color: 'var(--muted-foreground)' }} />
            </button>
          )}
        </div>

        {/* Category filter */}
        <div className="relative">
          <select
            value={filterCategory}
            onChange={e => onCategoryChange(e.target.value)}
            className="appearance-none pl-3 pr-8 py-2.5 rounded-lg text-sm border cursor-pointer focus:outline-none focus:ring-2 min-w-[160px]"
            style={{
              background: 'var(--surface-2)',
              borderColor: 'var(--border)',
              color: 'var(--foreground)',
            }}
            aria-label="Filter by category"
          >
            {categories.map(c => (
              <option key={`cat-${c}`} value={c} style={{ background: 'var(--surface-2)' }}>
                {c === 'ALL' ? 'All Categories' : c}
              </option>
            ))}
          </select>
          <ChevronDown
            size={14}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: 'var(--muted-foreground)' }}
          />
        </div>

        {/* GPS Locator */}
        <button
          onClick={() => setGpsOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium border transition-all duration-150 hover:scale-[0.98] active:scale-95"
          style={{
            background: 'rgba(34,211,238,0.08)',
            borderColor: 'rgba(34,211,238,0.25)',
            color: 'var(--primary)',
          }}
          aria-label="Open GPS locator"
        >
          <Navigation size={15} />
          <span className="hidden sm:inline">GPS Locate</span>
        </button>

        {/* Refresh interval */}
        <div className="relative">
          <button
            onClick={() => setIntervalOpen(o => !o)}
            className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm border transition-colors hover:bg-white/5"
            style={{
              background: 'var(--surface-2)',
              borderColor: 'var(--border)',
              color: 'var(--muted-foreground)',
            }}
            aria-label="Refresh interval"
            aria-expanded={intervalOpen}
          >
            <RefreshCw
              size={14}
              className={isSimulating ? 'animate-spin-slow' : ''}
              style={{ color: isSimulating ? 'var(--primary)' : 'var(--muted-foreground)' }}
            />
            <span className="font-mono text-xs text-tabular">{refreshInterval}s</span>
            <ChevronDown size={12} />
          </button>

          {intervalOpen && (
            <div
              className="absolute right-0 top-full mt-1 rounded-lg border shadow-xl z-20 py-1 min-w-[120px]"
              style={{ background: 'var(--surface-elevated)', borderColor: 'var(--border)' }}
            >
              <p className="px-3 py-1.5 text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--muted-foreground)' }}>
                Refresh every
              </p>
              {intervals.map(i => (
                <button
                  key={`interval-${i}`}
                  onClick={() => { onRefreshIntervalChange(i); setIntervalOpen(false); }}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-white/5 transition-colors flex items-center justify-between"
                  style={{ color: refreshInterval === i ? 'var(--primary)' : 'var(--foreground)' }}
                >
                  <span>{i} second{i > 1 ? 's' : ''}</span>
                  {refreshInterval === i && (
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--primary)' }} />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Simulate toggle */}
        <button
          onClick={onToggleSimulation}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium border transition-all duration-150 hover:scale-[0.98] active:scale-95"
          style={{
            background: isSimulating ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)',
            borderColor: isSimulating ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.25)',
            color: isSimulating ? 'var(--density-low)' : 'var(--density-high)',
          }}
          aria-label={isSimulating ? 'Pause simulation' : 'Resume simulation'}
        >
          {isSimulating ? <Pause size={14} /> : <Play size={14} />}
          <span className="hidden sm:inline">{isSimulating ? 'Pause' : 'Resume'}</span>
        </button>
      </div>

      <GPSLocatorModal
        isOpen={gpsOpen}
        onClose={() => setGpsOpen(false)}
        venues={venues}
        onLocate={onGPSLocate}
      />
    </>
  );
}
