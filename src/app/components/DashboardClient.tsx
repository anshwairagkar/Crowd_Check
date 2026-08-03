'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Toaster, toast } from 'sonner';
import { Venue, getDensityLevel, checkIsOpen } from './venueData';
import { loadVenues, saveVenues } from './mockDb';
import SearchAndGPS from './SearchAndGPS';
import SummaryKPIRow from './SummaryKPIRow';
import VenueGrid from './VenueGrid';
import AlertBanner from './AlertBanner';
import LiveTickerBar from './LiveTickerBar';
import AdminPanel from './AdminPanel';
import { Settings2 } from 'lucide-react';
import DashboardTopbar from './DashboardTopbar';

export interface AppSettings {
  predictive: boolean;
  weather: boolean;
  sensitivity: 'low' | 'normal' | 'high';
  colorblind: boolean;
  nightVision: boolean;
  gridDensity: 'comfortable' | 'compact';
}

function fluctuateCount(current: number, max: number, delta: number): number {
  const noise = Math.floor((Math.random() - 0.45) * delta);
  const next = current + noise;
  return Math.max(0, Math.min(max, next));
}

export default function DashboardClient() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [isSimulating, setIsSimulating] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(3);
  const [lastRefresh, setLastRefresh] = useState('');
  const [changedIds, setChangedIds] = useState<Set<string>>(new Set());
  const [showAdmin, setShowAdmin] = useState(false);
  const [filterHighRisk, setFilterHighRisk] = useState(false);
  const prevHighRisk = useRef<string[]>([]);
  
  const [settings, setSettings] = useState<AppSettings>({
    predictive: false,
    weather: true,
    sensitivity: 'normal',
    colorblind: false,
    nightVision: false,
    gridDensity: 'comfortable',
  });

  // Load venues from localStorage on mount
  useEffect(() => {
    setVenues(loadVenues());
    setLastRefresh(new Date().toLocaleTimeString('en-US', { hour12: false }));
  }, []);

  // Persist venues to localStorage whenever they change
  const saveRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const persistVenues = useCallback((updated: Venue[]) => {
    if (saveRef.current) clearTimeout(saveRef.current);
    saveRef.current = setTimeout(() => saveVenues(updated), 500);
  }, []);

  // Live simulation
  useEffect(() => {
    if (!isSimulating || venues.length === 0) return;

    const interval = setInterval(() => {
      setVenues(prev => {
        const updated = prev.map(v => {
          const now = new Date().toLocaleTimeString('en-US', { hour12: false });
          const isOpen = checkIsOpen(v.openHours);

          if (!isOpen) {
            return { ...v, presentCount: 0, waitingCount: 0, lastUpdated: now };
          }

          const newPresent = fluctuateCount(v.presentCount, v.maxCapacity, 18);
          const newWaiting = fluctuateCount(v.waitingCount, Math.floor(v.maxCapacity * 0.3), 8);
          return { ...v, presentCount: newPresent, waitingCount: newWaiting, lastUpdated: now };
        });

        const highRiskNow = updated
          .filter(v => {
            const level = getDensityLevel(v.presentCount, v.maxCapacity);
            return level === 'HIGH' || level === 'CRITICAL';
          })
          .map(v => v.id);

        const newlyHigh = highRiskNow.filter(id => !prevHighRisk.current.includes(id));
        newlyHigh.forEach(id => {
          const v = updated.find(x => x.id === id);
          if (v) {
            toast.error(`⚠ ${v.name} reached HIGH density`, {
              description: `${v.presentCount} / ${v.maxCapacity} capacity`,
              duration: 5000,
            });
          }
        });
        prevHighRisk.current = highRiskNow;

        setChangedIds(new Set(updated.map(v => v.id)));
        setTimeout(() => setChangedIds(new Set()), 600);

        return updated;
      });

      setLastRefresh(new Date().toLocaleTimeString('en-US', { hour12: false }));
    }, refreshInterval * 1000);

    return () => clearInterval(interval);
  }, [isSimulating, refreshInterval, venues.length]);

  // Admin handlers
  const handleAddVenue = useCallback((venue: Venue) => {
    setVenues(prev => {
      const updated = [...prev, venue];
      saveVenues(updated);
      return updated;
    });
    toast.success(`Venue added: ${venue.name}`, { duration: 3000 });
  }, []);

  const handleUpdateVenue = useCallback((venue: Venue) => {
    setVenues(prev => {
      const updated = prev.map(v => v.id === venue.id ? venue : v);
      saveVenues(updated);
      return updated;
    });
    toast.success(`Updated: ${venue.name}`, { duration: 3000 });
  }, []);

  const handleDeleteVenue = useCallback((id: string) => {
    setVenues(prev => {
      const target = prev.find(v => v.id === id);
      const updated = prev.filter(v => v.id !== id);
      saveVenues(updated);
      if (target) toast.info(`Removed: ${target.name}`, { duration: 3000 });
      return updated;
    });
  }, []);

  // --- NEW: AI ENGINE DATA MODIFIER ---
  // We apply the mathematical settings before distributing the data to the rest of the app
  const simulatedVenues = venues.map(venue => {
    let simulatedPresent = venue.presentCount;

    // Predictive: Add 15% to simulate future crowd growth
    if (settings.predictive) {
      simulatedPresent = Math.min(venue.maxCapacity, Math.floor(simulatedPresent * 1.15));
    }

    // Weather: If active, randomly drop outdoor venue counts by 30%
    if (settings.weather && venue.category === 'Traffic Intersection') {
      simulatedPresent = Math.floor(simulatedPresent * 0.7);
    }

    return { ...venue, presentCount: simulatedPresent };
  });

  const filteredVenues = simulatedVenues.filter(v => {
    const matchesSearch =
      v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'ALL' || v.category === filterCategory;
    const matchesHighRisk = !filterHighRisk || (() => {
      const level = getDensityLevel(v.presentCount, v.maxCapacity);
      return level === 'HIGH' || level === 'CRITICAL';
    })();
    return matchesSearch && matchesCategory && matchesHighRisk;
  });

  const categories = ['ALL', ...Array.from(new Set(simulatedVenues.map(v => v.category)))];

  const highRiskVenues = simulatedVenues.filter(v => {
    const level = getDensityLevel(v.presentCount, v.maxCapacity);
    return level === 'HIGH' || level === 'CRITICAL';
  });

  const handleGPSLocate = useCallback((nearestName: string) => {
    setSearchQuery(nearestName);
    toast.success(`GPS located: ${nearestName}`, { description: 'Showing nearest venue', duration: 3000 });
  }, []);

  return (
    // Wrap the entire app in a div that receives the theme classes
    <div className={`min-h-screen ${settings.colorblind ? 'colorblind-theme' : ''} ${settings.nightVision ? 'night-vision-theme' : ''}`}>
      
      {/* 🔴 INJECTED THEME FILTERS 🔴 */}
      <style>{`
        /* Shifts Red/Green palette to Orange/Blue by rotating the color wheel 50 degrees */
        .colorblind-theme {
          filter: hue-rotate(50deg) saturate(1.5) !important;
        }
        
        /* Forces a deep blue, high-contrast tactical dark mode */
        .night-vision-theme {
          filter: grayscale(100%) sepia(100%) hue-rotate(180deg) saturate(300%) brightness(45%) contrast(120%) !important;
          background-color: #030712 !important;
        }
        
        /* Smooth transition for the effect */
        .min-h-screen {
          transition: filter 0.5s ease, background-color 0.5s ease;
        }
      `}</style>

      <DashboardTopbar 
        venues={simulatedVenues}
        settings={settings}
        onUpdateSettings={setSettings}
        onOpenAlerts={() => toast.info('System Alerts', { description: 'Viewing recent notifications.' })}
        onOpenShield={() => toast.success('Security Status', { description: 'All camera encryption feeds active.' })}
        onOpenSettings={() => setShowAdmin(true)}
      />
      
      <Toaster
        position="bottom-right"
        theme="dark"
        toastOptions={{
          style: {
            background: 'var(--surface-2)',
            border: '1px solid var(--border)',
            color: 'var(--foreground)',
          },
        }}
      />

      {showAdmin && (
        <AdminPanel
          venues={venues} // Admin uses raw data, not simulated
          onAdd={handleAddVenue}
          onUpdate={handleUpdateVenue}
          onDelete={handleDeleteVenue}
          onClose={() => setShowAdmin(false)}
        />
      )}

      <main className="max-w-screen-2xl mx-auto px-4 lg:px-8 xl:px-10 2xl:px-16 py-6 space-y-6">
        {/* Live ticker */}
        <LiveTickerBar venues={simulatedVenues} lastRefresh={lastRefresh} />

        {/* Alert banner */}
        {highRiskVenues.length > 0 && <AlertBanner venues={highRiskVenues} />}

        {/* Search + GPS + Controls */}
        <SearchAndGPS
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          filterCategory={filterCategory}
          onCategoryChange={setFilterCategory}
          categories={categories}
          isSimulating={isSimulating}
          onToggleSimulation={() => setIsSimulating(s => !s)}
          refreshInterval={refreshInterval}
          onRefreshIntervalChange={setRefreshInterval}
          onGPSLocate={handleGPSLocate}
          venues={simulatedVenues}
        />

        {/* Summary KPI row */}
        <SummaryKPIRow
          venues={simulatedVenues}
          onVenuesAtRiskClick={() => setFilterHighRisk(prev => !prev)}
        />

        {/* Admin panel trigger */}
        <div className="flex items-center justify-between">
          <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
            <span className="font-semibold" style={{ color: 'var(--foreground)' }}>{filteredVenues.length}</span> venue{filteredVenues.length !== 1 ? 's' : ''} shown
            {filterHighRisk && (
              <span
                className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
                style={{ background: 'rgba(239,68,68,0.12)', color: 'var(--density-high)', border: '1px solid rgba(239,68,68,0.25)' }}
              >
                At Risk only
                <button
                  onClick={() => setFilterHighRisk(false)}
                  className="ml-1 hover:opacity-70"
                  aria-label="Clear at-risk filter"
                  style={{ lineHeight: 1 }}
                >
                  ×
                </button>
              </span>
            )}
          </p>
          <button
            onClick={() => setShowAdmin(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:scale-105"
            style={{
              background: 'rgba(34,211,238,0.08)',
              border: '1px solid rgba(34,211,238,0.2)',
              color: 'var(--primary)',
            }}
          >
            <Settings2 size={15} />
            Manage Venues
          </button>
        </div>

        {/* Venue grid */}
        <VenueGrid
          venues={filteredVenues}
          changedIds={changedIds}
          searchQuery={searchQuery}
          density={settings.gridDensity} // Passes the grid setting to the component!
        />
      </main>
    </div>
  );
}
