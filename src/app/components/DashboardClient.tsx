'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AlertTriangle, ShieldAlert, ArrowRight, ChevronDown, ChevronUp, X, Settings2, Download, Camera } from 'lucide-react';
import { Toaster, toast } from 'sonner';
import { Venue, getDensityLevel, checkIsOpen } from './venueData';
import { loadVenues, saveVenues } from './mockDb';
import SearchAndGPS from './SearchAndGPS';
import SummaryKPIRow from './SummaryKPIRow';
import VenueGrid from './VenueGrid';
import LiveTickerBar from './LiveTickerBar';
import AdminPanel from './AdminPanel';
import DashboardTopbar from './DashboardTopbar';
import LiveCameraScanner from './LiveCameraScanner';

export interface AppSettings {
  timeShift: number; 
  colorblind: boolean;
  nightVision: boolean;
  gridDensity: 'comfortable' | 'compact';
  deviceView: 'mobile' | 'tablet' | 'desktop';
  autoPilot: boolean;
  theme: 'dark' | 'light';
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
  
  // AI Actions State
  const [showProtocols, setShowProtocols] = useState(false);
  
  // NEW: Live AI Camera States
  const [showLiveCamera, setShowLiveCamera] = useState(false);
  const [liveAiCount, setLiveAiCount] = useState<number | null>(null);
  
  const prevHighRisk = useRef<string[]>([]);
  
  const [settings, setSettings] = useState<AppSettings>({
    timeShift: 0, 
    colorblind: false,
    nightVision: false,
    gridDensity: 'comfortable',
    deviceView: 'desktop',
    autoPilot: false, 
    theme: 'dark',
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

  const getEmergencyProtocols = (occupancyPercentage: number) => {
    if (occupancyPercentage >= 95) {
      return [
        "CRITICAL: Initiate immediate partial evacuation.",
        "Deploy security team to main entrances to halt inbound foot traffic.",
        "Switch exterior traffic intersection signals to RED.",
        "Open all auxiliary and emergency exits."
      ];
    } else if (occupancyPercentage >= 85) {
      return [
        "WARNING: Throttle entry gates to 50% flow.",
        "Broadcast crowd dispersal announcements over PA system.",
        "Prepare emergency exits for potential opening."
      ];
    }
    return []; 
  };

  const handleExportReport = () => {
    const highRiskVenuesNow = venues.filter(v => ['HIGH', 'CRITICAL'].includes(getDensityLevel(v.presentCount, v.maxCapacity)));
    if (highRiskVenuesNow.length === 0) {
        toast.error('No incident to report.');
        return;
    }

    const maxRiskPercentageNow = Math.max(...highRiskVenuesNow.map(v => (v.presentCount / v.maxCapacity) * 100));

    let reportContent = `=========================================\n`;
    reportContent += `   SANJAY AI - INCIDENT REPORT\n`;
    reportContent += `=========================================\n`;
    reportContent += `Generated: ${new Date().toLocaleString()}\n`;
    reportContent += `Operator: Admin / Security Desk\n\n`;

    reportContent += `🚨 CRITICAL VENUES DETECTED:\n`;
    highRiskVenuesNow.forEach(v => {
      reportContent += `- ${v.name} | Capacity: ${v.presentCount}/${v.maxCapacity} (${Math.round((v.presentCount/v.maxCapacity)*100)}%)\n`;
    });

    reportContent += `\n-----------------------------------------\n`;
    reportContent += `EXECUTED EMERGENCY PROTOCOLS:\n`;
    getEmergencyProtocols(maxRiskPercentageNow).forEach(step => {
      reportContent += `[X] ${step}\n`;
    });

    reportContent += `\n=========================================\n`;
    reportContent += `End of Log. System ID: ${Date.now()}\n`;

    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Incident_Log_${Date.now()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success('Incident Report Generated', { description: 'The official log has been downloaded.' });
  };
  
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('light-theme', 'colorblind-theme', 'night-vision-theme');
    
    if (settings.theme === 'light') root.classList.add('light-theme');
    if (settings.colorblind) root.classList.add('colorblind-theme');
    if (settings.nightVision) root.classList.add('night-vision-theme');

    if (!settings.autoPilot) return;
    let direction = 1; 
    const interval = setInterval(() => {
      setSettings(prev => {
        let nextShift = prev.timeShift + direction;
        if (nextShift >= 12) direction = -1; 
        if (nextShift <= -12) direction = 1; 
        return { ...prev, timeShift: nextShift };
      });
    }, 500);
    
    return () => {
      clearInterval(interval);
      root.classList.remove('light-theme', 'colorblind-theme', 'night-vision-theme');
    };
  }, [settings.autoPilot, settings.theme, settings.colorblind, settings.nightVision]);

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

    // 🔴 NEW: AI LIVE CAMERA OVERRIDE 🔴
    // If the camera is on, override the very first venue in the list with the real-time AI count
    if (showLiveCamera && liveAiCount !== null && venue.id === venues[0]?.id) {
      simulatedPresent = liveAiCount;
      simulatedWaiting = 0;
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
  
  const maxRiskPercentage = highRiskVenues.length > 0 
    ? Math.max(...highRiskVenues.map(v => (v.presentCount / v.maxCapacity) * 100))
    : 0;

  const handleGPSLocate = useCallback((nearestName: string) => {
    setSearchQuery(nearestName);
    toast.success(`GPS located: ${nearestName}`, { description: 'Showing nearest venue', duration: 3000 });
  }, []);

  return (
    <div className="min-h-screen">
      <style>{`
        /* 🔴 GLOBAL THEMES APPLIED SECURELY TO THE HTML ROOT 🔴 */
        html.colorblind-theme { filter: hue-rotate(50deg) saturate(1.5) !important; }
        
        html.night-vision-theme { 
          filter: grayscale(100%) sepia(100%) hue-rotate(180deg) saturate(300%) brightness(45%) contrast(120%) !important; 
          background-color: #030712 !important; 
        }
        
        html.light-theme { 
          filter: invert(1) hue-rotate(180deg) brightness(1.05) contrast(0.95) !important; 
          background-color: #ffffff !important; 
        }
        
        html.light-theme body {
          background-color: #ffffff !important;
        }

        html.light-theme .bg-slate-900,
        html.light-theme [style*="var(--surface-1)"] {
          background-color: #f8fafc !important;
        }
        
        html.light-theme svg {
          filter: invert(1) hue-rotate(180deg) !important;
        }

        html.light-theme .text-slate-400 {
          color: #64748b !important;
        }

        .min-h-screen { transition: filter 0.5s ease, background-color 0.5s ease; }
        
        @media print {
          @page { size: landscape; margin: 10mm; }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          body { background-color: #060c18 !important; }
          button { display: none !important; }
          .grid > div { break-inside: avoid; }
        }
      `}</style>

      <DashboardTopbar venues={simulatedVenues} settings={settings} onUpdateSettings={setSettings} />
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

      <main 
        className={`mx-auto px-4 lg:px-8 xl:px-10 py-6 space-y-6 transition-all duration-500 ease-in-out ${
          settings.deviceView === 'mobile' ? 'max-w-[430px] border-x border-dashed border-white/20 bg-black/20 shadow-2xl' : 
          settings.deviceView === 'tablet' ? 'max-w-[820px] border-x border-dashed border-white/20 bg-black/20 shadow-2xl' : 
          'max-w-screen-2xl'
        }`}
      >
        <LiveTickerBar venues={simulatedVenues} lastRefresh={lastRefresh} />
        
        {highRiskVenues.length > 0 && (
          <div className="bg-red-500/10 border border-red-500/50 rounded-xl shadow-[0_0_15px_rgba(239,68,68,0.15)] transition-all duration-300">
            <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start md:items-center gap-3">
                <AlertTriangle className="w-6 h-6 text-red-500 animate-pulse mt-1 md:mt-0" />
                <div>
                  <h2 className="text-red-400 font-bold text-lg">CRITICAL: {highRiskVenues.length} venue(s) approaching or exceeding safe capacity</h2>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {highRiskVenues.map(v => (
                      <span key={v.id} className="bg-red-500/20 text-red-300 text-xs px-2 py-1 rounded border border-red-500/30">
                        {v.name} — {Math.round((v.presentCount / v.maxCapacity) * 100)}% full
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              
              <button onClick={() => setShowProtocols(!showProtocols)} className="flex items-center justify-center gap-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 px-4 py-2 rounded-lg border border-red-500/30 transition-colors font-semibold shrink-0">
                <ShieldAlert className="w-5 h-5" />
                {showProtocols ? 'Hide Protocols' : 'View AI Protocols'}
                {showProtocols ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>

            {showProtocols && (
              <div className="border-t border-red-500/30 bg-red-950/30 p-5 rounded-b-xl">
                <p className="text-red-300 text-sm font-semibold mb-3 tracking-wider uppercase">Recommended Immediate Actions:</p>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {getEmergencyProtocols(maxRiskPercentage).map((step, index) => (
                    <li key={index} className="flex items-start gap-3 bg-slate-900/60 p-3 rounded-lg border border-red-500/20 shadow-sm">
                      <ArrowRight className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                      <span className="text-slate-200 text-sm">{step}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-5 flex flex-col md:flex-row gap-3">
                  <button onClick={() => setShowProtocols(false)} className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-2.5 rounded-lg shadow-md transition-colors">
                    Acknowledge & Execute Protocols
                  </button>
                  <button onClick={handleExportReport} className="flex items-center justify-center gap-2 px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-lg border border-slate-600 transition-colors">
                    <Download className="w-5 h-5" /> Export Incident Log
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        <SearchAndGPS
          searchQuery={searchQuery} onSearchChange={setSearchQuery} filterCategory={filterCategory}
          onCategoryChange={setFilterCategory} categories={categories} isSimulating={isSimulating}
          onToggleSimulation={() => setIsSimulating(s => !s)} refreshInterval={refreshInterval}
          onRefreshIntervalChange={setRefreshInterval} onGPSLocate={handleGPSLocate} venues={simulatedVenues}
        />

        <SummaryKPIRow venues={simulatedVenues} onVenuesAtRiskClick={() => setFilterHighRisk(prev => !prev)} />

        {/* 🔴 NEW: Live Camera Toggle Button & Video Display 🔴 */}
        <div className="flex items-center justify-between">
          <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
            <span className="font-semibold" style={{ color: 'var(--foreground)' }}>{filteredVenues.length}</span> venue{filteredVenues.length !== 1 ? 's' : ''} shown
            {filterHighRisk && (
              <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: 'rgba(239,68,68,0.12)', color: 'var(--density-high)', border: '1px solid rgba(239,68,68,0.25)' }}>
                At Risk only <button onClick={() => setFilterHighRisk(false)} className="ml-1 hover:opacity-70" style={{ lineHeight: 1 }}>×</button>
              </span>
            )}
          </p>
          <div className="flex gap-2">
            <button 
              onClick={() => setShowLiveCamera(!showLiveCamera)} 
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:scale-105" 
              style={{ background: showLiveCamera ? 'rgba(239,68,68,0.1)' : 'rgba(34,211,238,0.08)', border: showLiveCamera ? '1px solid rgba(239,68,68,0.3)' : '1px solid rgba(34,211,238,0.2)', color: showLiveCamera ? '#ef4444' : 'var(--primary)' }}
            >
              <Camera size={15} /> {showLiveCamera ? 'Stop Live AI Camera' : 'Start Live AI Camera'}
            </button>
            <button onClick={() => setShowAdmin(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:scale-105" style={{ background: 'rgba(34,211,238,0.08)', border: '1px solid rgba(34,211,238,0.2)', color: 'var(--primary)' }}>
              <Settings2 size={15} /> Manage Venues
            </button>
          </div>
        </div>

        {showLiveCamera && (
          <div className="mb-6">
            <LiveCameraScanner onCountUpdate={setLiveAiCount} />
            <div className="mt-3 text-center text-sm text-cyan-400 font-semibold animate-pulse">
              Live AI Override Active: Pushing {liveAiCount || 0} detected people into {venues[0]?.name}
            </div>
          </div>
        )}

        <VenueGrid venues={filteredVenues} changedIds={changedIds} searchQuery={searchQuery} density={settings.gridDensity} timeShift={settings.timeShift} />
      </main>
    </div>
  );
}
