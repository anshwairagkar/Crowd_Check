'use client';

import React from 'react';
import { Venue } from './venueData';
import VenueCard from './VenueCard';
import { Building2, Search } from 'lucide-react';

interface VenueGridProps {
  venues: Venue[];
  changedIds: Set<string>;
  searchQuery: string;
}

export default function VenueGrid({ venues, changedIds, searchQuery }: VenueGridProps) {
  if (venues.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center py-20 rounded-2xl border"
        style={{ background: 'var(--surface-2)', borderColor: 'var(--border)' }}
      >
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
          style={{ background: 'rgba(34,211,238,0.08)' }}
        >
          {searchQuery ? (
            <Search size={28} style={{ color: 'var(--primary)' }} />
          ) : (
            <Building2 size={28} style={{ color: 'var(--primary)' }} />
          )}
        </div>
        <h3 className="text-base font-semibold mb-1" style={{ color: 'var(--foreground)' }}>
          {searchQuery ? 'No venues match your search' : 'No venues configured'}
        </h3>
        <p className="text-sm text-center max-w-xs" style={{ color: 'var(--muted-foreground)' }}>
          {searchQuery
            ? `No results for "${searchQuery}". Try a different name or category.`
            : 'Add venues to begin monitoring crowd density with AI camera feeds.'}
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-medium" style={{ color: 'var(--muted-foreground)' }}>
          Showing{' '}
          <span className="font-semibold" style={{ color: 'var(--foreground)' }}>
            {venues.length}
          </span>{' '}
          venue{venues.length !== 1 ? 's' : ''}
        </p>
        <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--muted-foreground)' }}>
          <LegendDot color="var(--density-low)" label="Low" />
          <LegendDot color="var(--density-medium)" label="Medium" />
          <LegendDot color="var(--density-high)" label="High" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3 gap-4">
        {venues.map(venue => (
          <VenueCard
            key={venue.id}
            venue={venue}
            isUpdated={changedIds.has(venue.id)}
          />
        ))}
      </div>
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className="w-2 h-2 rounded-full" style={{ background: color }} />
      {label}
    </span>
  );
}
