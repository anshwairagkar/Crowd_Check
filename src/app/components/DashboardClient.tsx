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
  timeShift: number; 
  gridDensity: 'comfortable' | 'compact';
  deviceView: 'mobile' | 'tablet' | 'desktop';
  autoPilot: boolean;
  
  // --- NEW ACCESSIBILITY SUITE ---
  pageZoom: number;
  fontSize: number;
  colorBlindMode: 'None' | 'Protanopia' | 'Deuteranopia' | 'Tritanopia' | 'Greyscale' | 'High Contrast';
  displayTools: {
    darkContrast: boolean;
    invert: boolean;
    saturation: boolean;
    highlightLinks: boolean;
    hideImages: boolean;
    largeCursor: boolean;
  };
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
    timeShift: 0, 
    gridDensity: 'comfortable',
    deviceView: 'desktop',
    autoPilot: false, 
    // Initial Accessibility State
    pageZoom: 100,
    fontSize: 100,
    colorBlindMode: 'None',
    displayTools: {
      darkContrast: false,
      invert: false,
      saturation: false,
      highlightLinks: false,
      hideImages: false,
      largeCursor: false,
    }
  });

  useEffect(() => {
    setVenues(loadVenues());
    setLastRefresh(new Date().toLocaleTimeString('en-US', { hour12: false }));
  }, []);

  const saveRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const persistVenues = useCallback((updated: Venue[]) => {
    if (saveRef.current) clearTimeout(saveRef.current);
    saveRef.current = setTimeout(() => saveVenues(updated), 500);
  }, []);

  useEffect(() => {
    if (!isSimulating || venues.length === 0) return;
    const interval = setInterval(() => {
      setVenues(prev => {
        const updated = prev.map(v => {
          const now = new Date().toLocaleTimeString('en-US', { hour12: false });
          const isOpen = checkIsOpen(v.openHours);
          if (!isOpen) return { ...v, presentCount: 0, waitingCount: 0, lastUpdated: now };
          const newPresent = fluctuateCount(v.presentCount, v.maxCapacity, 18);
          const newWaiting = fluctuateCount(v.waitingCount, Math.floor(v.maxCapacity * 0.3), 8);
          return { ...v, presentCount: newPresent, waitingCount: newWaiting, lastUpdated: now };
        });

        const highRiskNow = updated.filter(v => ['HIGH', 'CRITICAL'].includes(getDensityLevel(v.presentCount, v.maxCapacity))).map(v => v.id);
        const newlyHigh = highRiskNow.filter(id => !prevHighRisk.current.includes(id));
        newlyHigh.forEach(id => {
          const v = updated.find(x => x.id === id);
          if (v) toast.error(`⚠ ${v.name} reached HIGH density`, { description: `${v.presentCount} / ${v.maxCapacity} capacity`, duration: 5000 });
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

  // AUTO-PILOT LOOP
  useEffect(() => {
    if (!settings.autoPilot) return;
    let direction = 1; 
    const interval = setInterval(() => {
      setSettings(prev => {
        let nextShift = prev.timeShift + direction;
        if (nextShift >= 12) direction = -1; 
        if (nextShift <= -12) direction = 1; 
        return { ...prev, timeShift: nextShift };
      });
    }, 1500);
    return () => clearInterval(interval);
  }, [settings.autoPilot]);

  const handleAddVenue = useCallback((venue: Venue) => {
    setVenues(prev => { const updated = [...prev, venue]; saveVenues(updated); return updated; });
    toast.success(`Venue added: ${venue.name}`, { duration: 3000 });
  }, []);

  const handleUpdateVenue = useCallback((venue: Venue) => {
    setVenues(prev => { const updated = prev.map(v => v.id === venue.id ? venue : v); saveVenues(updated); return updated; });
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
      if (startMins <= endMins) return currentMinutes >= startMins && currentMinutes < endMins;
      return currentMinutes >= startMins || currentMinutes < endMins;
    } catch (e) { return true; }
  };

  const simulatedVenues = venues.map(venue => {
    const isSimulatedOpen = checkOpenWithOffset(venue.openHours, settings.timeShift);
    const isRealOpen = checkOpenWithOffset(venue.openHours, 0); 
    
    const shiftedDate = new Date();
    shiftedDate.setHours(shiftedDate.getHours() + settings.timeShift);
    const simulatedLastUpdated = shiftedDate.toLocaleTimeString('en-US', { hour12: false });

    if (!isSimulatedOpen) {
      return { ...venue, presentCount: 0, waitingCount: 0, lastUpdated: simulatedLastUpdated };
    }

    let simulatedPresent = venue.presentCount;
    let simulatedWaiting = venue.waitingCount;

    if (!isRealOpen && isSimulatedOpen) {
      simulatedPresent = Math.floor(venue.maxCapacity * 0.5); 
      simulatedWaiting = Math.floor(venue.maxCapacity * 0.05); 
    }

    if (settings.timeShift !== 0) {
      const shiftFactor = 1 + (settings.timeShift * 0.05);
      simulatedPresent = Math.min(venue.maxCapacity, Math.max(0, Math.floor(simulatedPresent * shiftFactor)));
      simulatedWaiting = Math.max(0, Math.floor(simulatedWaiting * (1 + settings.timeShift * 0.1)));
    }

    return { ...venue, presentCount: simulatedPresent, waitingCount: simulatedWaiting, lastUpdated: simulatedLastUpdated };
  });

  const filteredVenues = simulatedVenues.filter(v => {
    const matchesSearch = v.name.toLowerCase().includes(searchQuery.toLowerCase()) || v.address.toLowerCase().includes(searchQuery.toLowerCase()) || v.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'ALL' || v.category === filterCategory;
    const matchesHighRisk = !filterHighRisk || ['HIGH', 'CRITICAL'].includes(getDensityLevel(v.presentCount, v.maxCapacity));
    return matchesSearch && matchesCategory && matchesHighRisk;
  });

  const categories = ['ALL', ...Array.from(new Set(simulatedVenues.map(v => v.category)))];
  const highRiskVenues = simulatedVenues.filter(v => ['HIGH', 'CRITICAL'].includes(getDensityLevel(v.presentCount, v.maxCapacity)));

  const handleGPSLocate = useCallback((nearestName: string) => {
    setSearchQuery(nearestName);
    toast.success(`GPS located: ${nearestName}`, { description: 'Showing nearest venue', duration: 3000 });
  }, []);

  // --- DYNAMIC ACCESSIBILITY FILTERS ---
  const getFilterString = () => {
    let filters = [];
    if (settings.colorBlindMode === 'Protanopia') filters.push('sepia(40%) hue-rotate(-30deg) saturate(140%)');
    if (settings.colorBlindMode === 'Deuteranopia') filters.push('sepia(40%) hue-rotate(30deg) saturate(140%)');
    if (settings.colorBlindMode === 'Tritanopia') filters.push('sepia(40%) hue-rotate(180deg) saturate(140%)');
    if (settings.colorBlindMode === 'Greyscale') filters.push('grayscale(100%)');
    if (settings.colorBlindMode === 'High Contrast') filters.push('contrast(160%) saturate(120%) brightness(90%)');

    if (settings.displayTools.invert) filters.push('invert(100%) hue-rotate(180deg)');
    if (settings.displayTools.saturation) filters.push('saturate(200%)');
    if (settings.displayTools.darkContrast) filters.push('contrast(125%) brightness(80%)');

    return filters.length > 0 ? filters.join(' ') : 'none';
  };

  return (
    <div className="min-h-screen transition-all duration-300">
      
      {/* 🔴 INJECTED ACCESSIBILITY & PRINT CSS 🔴 */}
      <style>{`
        html { 
          font-size: ${settings.fontSize}% !important; 
          transition: font-size 0.3s ease;
        }
        body { 
          zoom: ${settings.pageZoom}%; 
          filter: ${getFilterString()};
          transition: filter 0.3s ease;
        }
        ${settings.displayTools.hideImages ? 'svg, img, video { opacity: 0 !important; }' : ''}
        ${settings.displayTools.highlightLinks ? 'button, a, input { outline: 2px solid #facc15 !important; outline-offset: 2px; }' : ''}
        ${settings.displayTools.largeCursor ? '* { cursor: crosshair !important; }' : ''}
        
        @media print {
          @page { size: landscape; margin: 10mm; }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          body { background-color: #060c18 !important; zoom: 100% !important; filter: none !important; }
          button { display: none !important; }
          .grid > div { break-inside: avoid; }
        }
      `}</style>

      <DashboardTopbar 
        venues={simulatedVenues}
        settings={settings}
        onUpdateSettings={setSettings}
      />
      
      <Toaster position="bottom-right" theme="dark" toastOptions={{ style: { background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--foreground)' } }} />

      {showAdmin && (
        <AdminPanel
          venues={venues} 
          onAdd={handleAddVenue}
          onUpdate={handleUpdateVenue}
          onDelete={handleDeleteVenue}
          onClose={() => setShowAdmin(false)}
        />
      )}

      {/* DYNAMIC DEVICE WRAPPER */}
      <main 
        className={`mx-auto px-4 lg:px-8 xl:px-10 py-6 space-y-6 transition-all duration-500 ease-in-out ${
          settings.deviceView === 'mobile' ? 'max-w-[430px] border-x border-dashed border-white/20 bg-black/20 shadow-2xl' : 
          settings.deviceView === 'tablet' ? 'max-w-[820px] border-x border-dashed border-white/20 bg-black/20 shadow-2xl' : 
          'max-w-screen-2xl'
        }`}
      >
        <LiveTickerBar venues={simulatedVenues} lastRefresh={lastRefresh} />
        {highRiskVenues.length > 0 && <AlertBanner venues={highRiskVenues} />}

        <SearchAndGPS
          searchQuery={searchQuery} onSearchChange={setSearchQuery} filterCategory={filterCategory}
          onCategoryChange={setFilterCategory} categories={categories} isSimulating={isSimulating}
          onToggleSimulation={() => setIsSimulating(s => !s)} refreshInterval={refreshInterval}
          onRefreshIntervalChange={setRefreshInterval} onGPSLocate={handleGPSLocate} venues={simulatedVenues}
        />

        <SummaryKPIRow venues={simulatedVenues} onVenuesAtRiskClick={() => setFilterHighRisk(prev => !prev)} />

        <div className="flex items-center justify-between">
          <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
            <span className="font-semibold" style={{ color: 'var(--foreground)' }}>{filteredVenues.length}</span> venue{filteredVenues.length !== 1 ? 's' : ''} shown
            {filterHighRisk && (
              <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: 'rgba(239,68,68,0.12)', color: 'var(--density-high)', border: '1px solid rgba(239,68,68,0.25)' }}>
                At Risk only <button onClick={() => setFilterHighRisk(false)} className="ml-1 hover:opacity-70" style={{ lineHeight: 1 }}>×</button>
              </span>
            )}
          </p>
          <button onClick={() => setShowAdmin(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:scale-105" style={{ background: 'rgba(34,211,238,0.08)', border: '1px solid rgba(34,211,238,0.2)', color: 'var(--primary)' }}>
            <Settings2 size={15} /> Manage Venues
          </button>
        </div>

        <VenueGrid venues={filteredVenues} changedIds={changedIds} searchQuery={searchQuery} density={settings.gridDensity} timeShift={settings.timeShift} />
      </main>
    </div>
  );
}

// 'use client';

// import React, { useState, useEffect, useCallback, useRef } from 'react';
// import { Toaster, toast } from 'sonner';
// import { Venue, getDensityLevel, checkIsOpen } from './venueData';
// import { loadVenues, saveVenues } from './mockDb';
// import SearchAndGPS from './SearchAndGPS';
// import SummaryKPIRow from './SummaryKPIRow';
// import VenueGrid from './VenueGrid';
// import AlertBanner from './AlertBanner';
// import LiveTickerBar from './LiveTickerBar';
// import AdminPanel from './AdminPanel';
// import { Settings2 } from 'lucide-react';
// import DashboardTopbar from './DashboardTopbar';

// export interface AppSettings {
//   timeShift: number; 
//   colorblind: boolean;
//   nightVision: boolean;
//   gridDensity: 'comfortable' | 'compact';
//   deviceView: 'mobile' | 'tablet' | 'desktop';
//   autoPilot: boolean;
// }

// function fluctuateCount(current: number, max: number, delta: number): number {
//   const noise = Math.floor((Math.random() - 0.45) * delta);
//   const next = current + noise;
//   return Math.max(0, Math.min(max, next));
// }

// export default function DashboardClient() {
//   const [venues, setVenues] = useState<Venue[]>([]);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [filterCategory, setFilterCategory] = useState<string>('ALL');
//   const [isSimulating, setIsSimulating] = useState(true);
//   const [refreshInterval, setRefreshInterval] = useState(3);
//   const [lastRefresh, setLastRefresh] = useState('');
//   const [changedIds, setChangedIds] = useState<Set<string>>(new Set());
//   const [showAdmin, setShowAdmin] = useState(false);
//   const [filterHighRisk, setFilterHighRisk] = useState(false);
//   const prevHighRisk = useRef<string[]>([]);
  
//   const [settings, setSettings] = useState<AppSettings>({
//     timeShift: 0, 
//     colorblind: false,
//     nightVision: false,
//     gridDensity: 'comfortable',
//     deviceView: 'desktop',
//     autoPilot: false, 
//   });

//   useEffect(() => {
//     setVenues(loadVenues());
//     setLastRefresh(new Date().toLocaleTimeString('en-US', { hour12: false }));
//   }, []);

//   const saveRef = useRef<ReturnType<typeof setTimeout> | null>(null);
//   const persistVenues = useCallback((updated: Venue[]) => {
//     if (saveRef.current) clearTimeout(saveRef.current);
//     saveRef.current = setTimeout(() => saveVenues(updated), 500);
//   }, []);

//   useEffect(() => {
//     if (!isSimulating || venues.length === 0) return;

//     const interval = setInterval(() => {
//       setVenues(prev => {
//         const updated = prev.map(v => {
//           const now = new Date().toLocaleTimeString('en-US', { hour12: false });
//           const isOpen = checkIsOpen(v.openHours);
//           if (!isOpen) return { ...v, presentCount: 0, waitingCount: 0, lastUpdated: now };
//           const newPresent = fluctuateCount(v.presentCount, v.maxCapacity, 18);
//           const newWaiting = fluctuateCount(v.waitingCount, Math.floor(v.maxCapacity * 0.3), 8);
//           return { ...v, presentCount: newPresent, waitingCount: newWaiting, lastUpdated: now };
//         });

//         const highRiskNow = updated.filter(v => ['HIGH', 'CRITICAL'].includes(getDensityLevel(v.presentCount, v.maxCapacity))).map(v => v.id);
//         const newlyHigh = highRiskNow.filter(id => !prevHighRisk.current.includes(id));
//         newlyHigh.forEach(id => {
//           const v = updated.find(x => x.id === id);
//           if (v) toast.error(`⚠ ${v.name} reached HIGH density`, { description: `${v.presentCount} / ${v.maxCapacity} capacity`, duration: 5000 });
//         });
//         prevHighRisk.current = highRiskNow;
//         setChangedIds(new Set(updated.map(v => v.id)));
//         setTimeout(() => setChangedIds(new Set()), 600);
//         return updated;
//       });
//       setLastRefresh(new Date().toLocaleTimeString('en-US', { hour12: false }));
//     }, refreshInterval * 1000);

//     return () => clearInterval(interval);
//   }, [isSimulating, refreshInterval, venues.length]);

//   // --- AUTO-PILOT LOOP ---
//   useEffect(() => {
//     if (!settings.autoPilot) return;
//     let direction = 1; 
//     const interval = setInterval(() => {
//       setSettings(prev => {
//         let nextShift = prev.timeShift + direction;
//         if (nextShift >= 12) direction = -1; 
//         if (nextShift <= -12) direction = 1; 
//         return { ...prev, timeShift: nextShift };
//       });
//     }, 1500);
//     return () => clearInterval(interval);
//   }, [settings.autoPilot]);

//   const handleAddVenue = useCallback((venue: Venue) => {
//     setVenues(prev => { const updated = [...prev, venue]; saveVenues(updated); return updated; });
//     toast.success(`Venue added: ${venue.name}`, { duration: 3000 });
//   }, []);

//   const handleUpdateVenue = useCallback((venue: Venue) => {
//     setVenues(prev => { const updated = prev.map(v => v.id === venue.id ? venue : v); saveVenues(updated); return updated; });
//     toast.success(`Updated: ${venue.name}`, { duration: 3000 });
//   }, []);

//   const handleDeleteVenue = useCallback((id: string) => {
//     setVenues(prev => {
//       const target = prev.find(v => v.id === id);
//       const updated = prev.filter(v => v.id !== id);
//       saveVenues(updated);
//       if (target) toast.info(`Removed: ${target.name}`, { duration: 3000 });
//       return updated;
//     });
//   }, []);

//   const checkOpenWithOffset = (hours: string, offsetHours: number) => {
//     if (hours === '24/7') return true;
//     try {
//       const now = new Date();
//       now.setHours(now.getHours() + offsetHours);
//       const currentMinutes = now.getHours() * 60 + now.getMinutes();
//       const [startStr, endStr] = hours.split(' - ');
//       if (!startStr || !endStr) return true;
//       const startMins = parseInt(startStr.split(':')[0]) * 60 + parseInt(startStr.split(':')[1]);
//       const endMins = parseInt(endStr.split(':')[0]) * 60 + parseInt(endStr.split(':')[1]);
//       if (startMins <= endMins) return currentMinutes >= startMins && currentMinutes < endMins;
//       return currentMinutes >= startMins || currentMinutes < endMins;
//     } catch (e) { return true; }
//   };

//   const simulatedVenues = venues.map(venue => {
//     const isSimulatedOpen = checkOpenWithOffset(venue.openHours, settings.timeShift);
//     const isRealOpen = checkOpenWithOffset(venue.openHours, 0); 
    
//     const shiftedDate = new Date();
//     shiftedDate.setHours(shiftedDate.getHours() + settings.timeShift);
//     const simulatedLastUpdated = shiftedDate.toLocaleTimeString('en-US', { hour12: false });

//     if (!isSimulatedOpen) {
//       return { ...venue, presentCount: 0, waitingCount: 0, lastUpdated: simulatedLastUpdated };
//     }

//     let simulatedPresent = venue.presentCount;
//     let simulatedWaiting = venue.waitingCount;

//     if (!isRealOpen && isSimulatedOpen) {
//       simulatedPresent = Math.floor(venue.maxCapacity * 0.5); 
//       simulatedWaiting = Math.floor(venue.maxCapacity * 0.05); 
//     }

//     if (settings.timeShift !== 0) {
//       const shiftFactor = 1 + (settings.timeShift * 0.05);
//       simulatedPresent = Math.min(venue.maxCapacity, Math.max(0, Math.floor(simulatedPresent * shiftFactor)));
//       simulatedWaiting = Math.max(0, Math.floor(simulatedWaiting * (1 + settings.timeShift * 0.1)));
//     }

//     return { ...venue, presentCount: simulatedPresent, waitingCount: simulatedWaiting, lastUpdated: simulatedLastUpdated };
//   });

//   const filteredVenues = simulatedVenues.filter(v => {
//     const matchesSearch = v.name.toLowerCase().includes(searchQuery.toLowerCase()) || v.address.toLowerCase().includes(searchQuery.toLowerCase()) || v.category.toLowerCase().includes(searchQuery.toLowerCase());
//     const matchesCategory = filterCategory === 'ALL' || v.category === filterCategory;
//     const matchesHighRisk = !filterHighRisk || ['HIGH', 'CRITICAL'].includes(getDensityLevel(v.presentCount, v.maxCapacity));
//     return matchesSearch && matchesCategory && matchesHighRisk;
//   });

//   const categories = ['ALL', ...Array.from(new Set(simulatedVenues.map(v => v.category)))];
//   const highRiskVenues = simulatedVenues.filter(v => ['HIGH', 'CRITICAL'].includes(getDensityLevel(v.presentCount, v.maxCapacity)));

//   const handleGPSLocate = useCallback((nearestName: string) => {
//     setSearchQuery(nearestName);
//     toast.success(`GPS located: ${nearestName}`, { description: 'Showing nearest venue', duration: 3000 });
//   }, []);

//   return (
//     <div className={`min-h-screen ${settings.colorblind ? 'colorblind-theme' : ''} ${settings.nightVision ? 'night-vision-theme' : ''}`}>
//       <style>{`
//         .colorblind-theme { filter: hue-rotate(50deg) saturate(1.5) !important; }
//         .night-vision-theme { filter: grayscale(100%) sepia(100%) hue-rotate(180deg) saturate(300%) brightness(45%) contrast(120%) !important; background-color: #030712 !important; }
//         .min-h-screen { transition: filter 0.5s ease, background-color 0.5s ease; }
        
//         /* 🔴 NEW: FORCE PERFECT PDF PRINTING 🔴 */
//         @media print {
//           @page { 
//             size: landscape; /* Force wide layout */
//             margin: 10mm; 
//           }
//           * {
//             -webkit-print-color-adjust: exact !important; /* Force browser to print dark backgrounds */
//             print-color-adjust: exact !important;
//           }
//           body {
//             background-color: #060c18 !important; /* Keep the dark theme */
//           }
//           button { 
//             display: none !important; /* Hide all clickable buttons on the PDF */
//           }
//           .grid > div {
//             break-inside: avoid; /* Prevent venue cards from getting cut in half across pages */
//           }
//         }
//       `}</style>

//       <DashboardTopbar 
//         venues={simulatedVenues}
//         settings={settings}
//         onUpdateSettings={setSettings}
//       />
      
//       <Toaster position="bottom-right" theme="dark" toastOptions={{ style: { background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--foreground)' } }} />

//       {showAdmin && (
//         <AdminPanel
//           venues={venues} 
//           onAdd={handleAddVenue}
//           onUpdate={handleUpdateVenue}
//           onDelete={handleDeleteVenue}
//           onClose={() => setShowAdmin(false)}
//         />
//       )}

//       {/* DYNAMIC DEVICE WRAPPER */}
//       <main 
//         className={`mx-auto px-4 lg:px-8 xl:px-10 py-6 space-y-6 transition-all duration-500 ease-in-out ${
//           settings.deviceView === 'mobile' ? 'max-w-[430px] border-x border-dashed border-white/20 bg-black/20 shadow-2xl' : 
//           settings.deviceView === 'tablet' ? 'max-w-[820px] border-x border-dashed border-white/20 bg-black/20 shadow-2xl' : 
//           'max-w-screen-2xl'
//         }`}
//       >
//         <LiveTickerBar venues={simulatedVenues} lastRefresh={lastRefresh} />
//         {highRiskVenues.length > 0 && <AlertBanner venues={highRiskVenues} />}

//         <SearchAndGPS
//           searchQuery={searchQuery} onSearchChange={setSearchQuery} filterCategory={filterCategory}
//           onCategoryChange={setFilterCategory} categories={categories} isSimulating={isSimulating}
//           onToggleSimulation={() => setIsSimulating(s => !s)} refreshInterval={refreshInterval}
//           onRefreshIntervalChange={setRefreshInterval} onGPSLocate={handleGPSLocate} venues={simulatedVenues}
//         />

//         <SummaryKPIRow venues={simulatedVenues} onVenuesAtRiskClick={() => setFilterHighRisk(prev => !prev)} />

//         <div className="flex items-center justify-between">
//           <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
//             <span className="font-semibold" style={{ color: 'var(--foreground)' }}>{filteredVenues.length}</span> venue{filteredVenues.length !== 1 ? 's' : ''} shown
//             {filterHighRisk && (
//               <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: 'rgba(239,68,68,0.12)', color: 'var(--density-high)', border: '1px solid rgba(239,68,68,0.25)' }}>
//                 At Risk only <button onClick={() => setFilterHighRisk(false)} className="ml-1 hover:opacity-70" style={{ lineHeight: 1 }}>×</button>
//               </span>
//             )}
//           </p>
//           <button onClick={() => setShowAdmin(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:scale-105" style={{ background: 'rgba(34,211,238,0.08)', border: '1px solid rgba(34,211,238,0.2)', color: 'var(--primary)' }}>
//             <Settings2 size={15} /> Manage Venues
//           </button>
//         </div>

//         <VenueGrid venues={filteredVenues} changedIds={changedIds} searchQuery={searchQuery} density={settings.gridDensity} timeShift={settings.timeShift} />
//       </main>
//     </div>
//   );
// }
