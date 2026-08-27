'use client';

import React, { useState } from 'react';
import AppLogo from '@/components/ui/AppLogo';
import { AppSettings } from './DashboardClient';
import { 
  Activity, Bell, Settings, Shield, AlertTriangle, X, 
  Lock, EyeOff, Server, BrainCircuit, Accessibility, 
  ZoomIn, ZoomOut, Type, Droplets, Link, ImageOff, 
  MousePointer2, Moon, Download, PlayCircle
} from 'lucide-react';
import { Venue } from './venueData';

interface DashboardTopbarProps {
  venues?: Venue[];
  settings: AppSettings;
  onUpdateSettings: (newSettings: AppSettings) => void;
}

export default function DashboardTopbar({
  venues = [],
  settings,
  onUpdateSettings,
}: DashboardTopbarProps) {
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);
  const [isShieldOpen, setIsShieldOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAccessOpen, setIsAccessOpen] = useState(false);
  
  const overcrowdedVenues = venues.filter(v => (v.presentCount / v.maxCapacity) >= 0.9);

  const toggleDropdown = (menu: 'alerts' | 'shield' | 'settings' | 'access') => {
    setIsAlertsOpen(menu === 'alerts' ? !isAlertsOpen : false);
    setIsShieldOpen(menu === 'shield' ? !isShieldOpen : false);
    setIsSettingsOpen(menu === 'settings' ? !isSettingsOpen : false);
    setIsAccessOpen(menu === 'access' ? !isAccessOpen : false);
  };

  const handleExportCSV = () => {
    const headers = ['Venue_Name', 'Category', 'Label_Density', 'Present_Count', 'Waiting_Queue', 'Max_Capacity', 'Occupancy_Pct'];
    const rows = venues.map(v => {
      const pct = Math.round((v.presentCount / v.maxCapacity) * 100);
      const status = pct >= 90 ? 'CRITICAL' : pct >= 75 ? 'HIGH' : pct >= 50 ? 'MEDIUM' : 'LOW';
      return `"${v.name}","${v.category}","${status}",${v.presentCount},${v.waitingCount},${v.maxCapacity},${pct}`;
    });
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `crowd_dataset_sim_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- ACCESSIBILITY HELPER FUNCTIONS ---
  const updateZoom = (val: number) => {
    const newZoom = Math.min(Math.max(settings.pageZoom + val, 50), 200);
    onUpdateSettings({ ...settings, pageZoom: val === 0 ? 100 : newZoom });
  };

  const updateFont = (val: number) => {
    const newFont = Math.min(Math.max(settings.fontSize + val, 50), 200);
    onUpdateSettings({ ...settings, fontSize: val === 0 ? 100 : newFont });
  };

  const toggleTool = (tool: keyof typeof settings.displayTools) => {
    onUpdateSettings({
      ...settings,
      displayTools: { ...settings.displayTools, [tool]: !settings.displayTools[tool] }
    });
  };

  return (
    <header className="sticky top-0 z-50 border-b" style={{ background: 'rgba(6, 12, 24, 0.92)', backdropFilter: 'blur(12px)', borderColor: 'var(--border)' }}>
      <div className="max-w-screen-2xl mx-auto px-4 lg:px-8 xl:px-10 2xl:px-16">
        <div className="flex items-center justify-between h-16">
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 cursor-pointer">
              <AppLogo size={32} />
              <span className="font-semibold text-lg tracking-tight" style={{ color: 'var(--foreground)' }}>
                Crowd Check <span className="ml-1 text-xs font-medium px-1.5 py-0.5 rounded" style={{ background: 'rgba(34,211,238,0.12)', color: 'var(--primary)' }}>AI</span>
              </span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-2 text-sm" style={{ color: 'var(--muted-foreground)' }}>
            <span className="flex items-center gap-1.5"><span className="inline-block w-2 h-2 rounded-full live-pulse" style={{ background: 'var(--density-low)' }} /><span>Live Monitoring Active</span></span>
            <span className="mx-2 opacity-30">|</span>
            <Activity size={14} style={{ color: 'var(--primary)' }} />
            <span style={{ color: 'var(--primary)' }} className="font-medium">AI Camera Feeds Online</span>
          </div>

          <div className="flex items-center gap-2">
            
            {/* ALERTS */}
            <div className="relative">
              <button onClick={() => toggleDropdown('alerts')} className="relative p-2 rounded-lg transition-colors hover:bg-white/10 active:scale-95">
                <Bell size={18} style={{ color: 'var(--muted-foreground)' }} />
                {overcrowdedVenues.length > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full" style={{ background: 'var(--density-high)' }} />}
              </button>
              {isAlertsOpen && (
                <div className="absolute right-0 mt-2 w-80 rounded-xl border shadow-xl z-50 overflow-hidden" style={{ background: 'var(--surface-1)', borderColor: 'var(--border)' }}>
                  <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'var(--border)', background: 'var(--surface-2)' }}>
                    <h3 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>System Alerts</h3>
                    <button onClick={() => setIsAlertsOpen(false)} className="hover:bg-white/5 p-1 rounded"><X size={14} style={{ color: 'var(--muted-foreground)' }}/></button>
                  </div>
                  <div className="max-h-80 overflow-y-auto p-2 space-y-1">
                    {overcrowdedVenues.length === 0 ? <div className="p-4 text-xs text-center" style={{ color: 'var(--muted-foreground)' }}>All venues safe.</div> : 
                      overcrowdedVenues.map(v => (
                        <div key={v.id} className="flex items-start gap-3 p-3 rounded-lg border" style={{ background: 'rgba(239,68,68,0.05)', borderColor: 'rgba(239,68,68,0.2)' }}>
                          <AlertTriangle size={16} style={{ color: '#ef4444', marginTop: '2px' }} className="flex-shrink-0" />
                          <div>
                            <p className="text-xs font-semibold" style={{ color: 'var(--foreground)' }}>Crowd Alert: {v.name}</p>
                            <p className="text-xs mt-1 leading-snug" style={{ color: 'var(--muted-foreground)' }}>Avoid going to {v.name}. <span className="font-bold text-red-400">{Math.round((v.presentCount / v.maxCapacity) * 100)}% full</span>.</p>
                          </div>
                        </div>
                      ))
                    }
                  </div>
                </div>
              )}
            </div>

            {/* SECURITY */}
            <div className="relative">
              <button onClick={() => toggleDropdown('shield')} className="p-2 rounded-lg transition-colors hover:bg-white/10 active:scale-95">
                <Shield size={18} style={{ color: 'var(--muted-foreground)' }} />
              </button>
              {isShieldOpen && (
                <div className="absolute right-0 mt-2 w-72 rounded-xl border shadow-xl z-50 overflow-hidden" style={{ background: 'var(--surface-1)', borderColor: 'var(--border)' }}>
                  <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'var(--border)', background: 'var(--surface-2)' }}>
                    <h3 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Network Security</h3>
                    <button onClick={() => setIsShieldOpen(false)} className="hover:bg-white/5 p-1 rounded"><X size={14} style={{ color: 'var(--muted-foreground)' }}/></button>
                  </div>
                  <div className="p-4 space-y-4">
                    <div className="flex items-center justify-between"><div className="flex items-center gap-2"><Lock size={14} style={{ color: '#22c55e' }} /><span className="text-sm" style={{ color: 'var(--foreground)' }}>AES-256</span></div><span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ background: 'rgba(34,197,94,0.15)', color: '#22c55e' }}>Active</span></div>
                    <div className="pt-3 border-t" style={{ borderColor: 'var(--border)' }}><div className="flex items-center justify-between"><div className="flex items-center gap-2"><EyeOff size={14} style={{ color: 'var(--primary)' }} /><span className="text-sm" style={{ color: 'var(--foreground)' }}>Privacy Masking</span></div><div className="w-8 h-4 rounded-full flex items-center p-0.5" style={{ background: 'var(--primary)' }}><div className="w-3 h-3 rounded-full bg-white transform translate-x-4"></div></div></div></div>
                  </div>
                </div>
              )}
            </div>

            {/* --- NEW: ACCESSIBILITY MENU --- */}
            <div className="relative">
              <button onClick={() => toggleDropdown('access')} className="p-2 rounded-lg transition-colors hover:bg-white/10 active:scale-95" aria-label="Accessibility">
                <Accessibility size={18} style={{ color: 'var(--muted-foreground)' }} />
              </button>
              {isAccessOpen && (
                <div className="absolute right-0 mt-2 w-[380px] rounded-xl border shadow-xl z-50 overflow-hidden flex flex-col max-h-[85vh]" style={{ background: 'var(--surface-1)', borderColor: 'var(--border)' }}>
                  
                  {/* Purple Modal Header */}
                  <div className="flex items-center justify-between px-4 py-4 shrink-0" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
                        <Accessibility size={18} className="text-indigo-600" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-white leading-tight">Accessibility</h3>
                        <p className="text-xs text-white/80 font-medium">Customise your viewing experience</p>
                      </div>
                    </div>
                    <button onClick={() => setIsAccessOpen(false)} className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors">
                      <X size={14} className="text-white" />
                    </button>
                  </div>

                  {/* Scrollable Content Body */}
                  <div className="p-4 space-y-4 overflow-y-auto">
                    
                    {/* Page Zoom */}
                    <div className="p-4 rounded-xl border" style={{ background: 'var(--surface-2)', borderColor: 'var(--border)' }}>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="p-1.5 rounded bg-blue-500/10"><ZoomIn size={14} className="text-blue-400" /></div>
                        <div>
                          <p className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>Page Zoom</p>
                          <p className="text-[10px]" style={{ color: 'var(--muted-foreground)' }}>Scale the entire page</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <button onClick={() => updateZoom(-10)} className="w-10 h-10 rounded-full flex items-center justify-center border-2 hover:bg-white/5 transition-colors" style={{ borderColor: 'var(--primary)', color: 'var(--primary)' }}><ZoomOut size={16} /></button>
                        <div className="flex-1 h-10 rounded-lg flex items-center justify-center font-bold border" style={{ background: 'var(--surface-1)', borderColor: 'var(--border)', color: 'var(--foreground)' }}>{settings.pageZoom}%</div>
                        <button onClick={() => updateZoom(10)} className="w-10 h-10 rounded-full flex items-center justify-center border-2 hover:bg-white/5 transition-colors" style={{ borderColor: 'var(--primary)', color: 'var(--primary)' }}><ZoomIn size={16} /></button>
                        <button onClick={() => updateZoom(0)} className="h-10 px-4 rounded-full text-xs font-semibold border hover:bg-white/5 transition-colors" style={{ borderColor: 'var(--border)', color: 'var(--muted-foreground)' }}>Reset</button>
                      </div>
                    </div>

                    {/* Font Size */}
                    <div className="p-4 rounded-xl border" style={{ background: 'var(--surface-2)', borderColor: 'var(--border)' }}>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="p-1.5 rounded bg-purple-500/10"><Type size={14} className="text-purple-400" /></div>
                        <div>
                          <p className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>Font Size</p>
                          <p className="text-[10px]" style={{ color: 'var(--muted-foreground)' }}>Adjust text size across the page</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <button onClick={() => updateFont(-10)} className="w-10 h-10 rounded-full flex items-center justify-center border-2 font-bold hover:bg-white/5 transition-colors" style={{ borderColor: 'var(--primary)', color: 'var(--primary)' }}>A-</button>
                        <div className="flex-1 h-10 rounded-lg flex items-center justify-center font-bold border" style={{ background: 'var(--surface-1)', borderColor: 'var(--border)', color: 'var(--foreground)' }}>Default</div>
                        <button onClick={() => updateFont(10)} className="w-10 h-10 rounded-full flex items-center justify-center border-2 font-bold hover:bg-white/5 transition-colors" style={{ borderColor: 'var(--primary)', color: 'var(--primary)' }}>A+</button>
                        <button onClick={() => updateFont(0)} className="h-10 px-4 rounded-full text-xs font-semibold border hover:bg-white/5 transition-colors" style={{ borderColor: 'var(--border)', color: 'var(--muted-foreground)' }}>Reset</button>
                      </div>
                    </div>

                    {/* Color Blind Mode */}
                    <div className="p-4 rounded-xl border" style={{ background: 'var(--surface-2)', borderColor: 'var(--border)' }}>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="p-1.5 rounded bg-pink-500/10"><Eye size={14} className="text-pink-400" /></div>
                        <div>
                          <p className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>Color Blind Mode</p>
                          <p className="text-[10px]" style={{ color: 'var(--muted-foreground)' }}>Apply vision-friendly colour filters</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {['None', 'Protanopia', 'Deuteranopia', 'Tritanopia', 'Greyscale', 'High Contrast'].map(mode => (
                          <button 
                            key={mode}
                            onClick={() => onUpdateSettings({ ...settings, colorBlindMode: mode as any })}
                            className={`py-2 rounded-full text-xs font-semibold border transition-all ${settings.colorBlindMode === mode ? 'bg-indigo-600 text-white border-indigo-600' : 'hover:bg-white/5'}`}
                            style={settings.colorBlindMode !== mode ? { borderColor: 'var(--border)', color: 'var(--foreground)' } : {}}
                          >
                            {mode}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Display Tools */}
                    <div className="p-4 rounded-xl border" style={{ background: 'var(--surface-2)', borderColor: 'var(--border)' }}>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="p-1.5 rounded bg-cyan-500/10"><LayoutGrid size={14} className="text-cyan-400" /></div>
                        <div>
                          <p className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>Display Tools</p>
                          <p className="text-[10px]" style={{ color: 'var(--muted-foreground)' }}>Quick visual adjustments</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {/* Recreated the 8 Buttons exactly from image */}
                        <ToolButton active={settings.displayTools.darkContrast} onClick={() => toggleTool('darkContrast')} icon={<Moon size={18}/>} label="Dark Contrast" />
                        <ToolButton active={settings.displayTools.invert} onClick={() => toggleTool('invert')} icon={<div className="w-4 h-4 rounded-full border-2 border-current flex overflow-hidden"><div className="w-1/2 h-full bg-current"></div></div>} label="Invert" />
                        <ToolButton active={settings.displayTools.saturation} onClick={() => toggleTool('saturation')} icon={<Droplets size={18}/>} label="Saturation" />
                        <ToolButton onClick={() => updateFont(10)} icon={<span className="font-black text-sm">A+</span>} label="Text Size Increase" />
                        <ToolButton onClick={() => updateFont(-10)} icon={<span className="font-black text-sm">A-</span>} label="Text Size Decrease" />
                        <ToolButton active={settings.displayTools.highlightLinks} onClick={() => toggleTool('highlightLinks')} icon={<Link size={18}/>} label="Highlight Links" />
                        <ToolButton active={settings.displayTools.hideImages} onClick={() => toggleTool('hideImages')} icon={<ImageOff size={18}/>} label="Hide Images" />
                        <ToolButton active={settings.displayTools.largeCursor} onClick={() => toggleTool('largeCursor')} icon={<MousePointer2 size={18} className="fill-current"/>} label="Default Cursor" />
                      </div>
                    </div>

                  </div>
                </div>
              )}
            </div>

            {/* AI ENGINE */}
            <div className="relative">
              <button onClick={() => toggleDropdown('settings')} className="p-2 rounded-lg transition-colors hover:bg-white/10 active:scale-95">
                <Settings size={18} style={{ color: 'var(--muted-foreground)' }} />
              </button>
              {isSettingsOpen && (
                <div className="absolute right-0 mt-2 w-[340px] rounded-xl border shadow-xl z-50 overflow-hidden" style={{ background: 'var(--surface-1)', borderColor: 'var(--border)' }}>
                  <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'var(--border)', background: 'var(--surface-2)' }}>
                    <div className="flex items-center gap-2">
                      <BrainCircuit size={16} style={{ color: 'var(--foreground)' }} />
                      <h3 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>AI Engine</h3>
                    </div>
                    <button onClick={() => setIsSettingsOpen(false)} className="hover:bg-white/5 p-1 rounded"><X size={14} style={{ color: 'var(--muted-foreground)' }}/></button>
                  </div>
                  
                  <div className="p-4 space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2"><Activity size={14} style={{ color: 'var(--foreground)' }} /><span className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>Timeline Forecaster</span></div>
                          <p className="text-[10px] mt-0.5" style={{ color: 'var(--muted-foreground)' }}>Shift data from -12h past to +12h future</p>
                        </div>
                        <div className="text-xs font-bold" style={{ color: settings.timeShift === 0 ? 'var(--primary)' : settings.timeShift > 0 ? '#facc15' : '#60a5fa' }}>
                          {settings.timeShift === 0 ? 'LIVE' : settings.timeShift > 0 ? `+${settings.timeShift} hrs` : `${settings.timeShift} hrs`}
                        </div>
                      </div>
                      <input type="range" min="-12" max="12" step="1" value={settings.timeShift} disabled={settings.autoPilot} onChange={(e) => onUpdateSettings({ ...settings, timeShift: parseInt(e.target.value) })} className={`w-full h-1.5 rounded-full appearance-none ${settings.autoPilot ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`} style={{ background: 'var(--surface-3)', accentColor: 'var(--primary)' }} />
                      <div className="flex justify-between text-[10px]" style={{ color: 'var(--muted-foreground)' }}><span>-12h</span><span>Live</span><span>+12h</span></div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
                      <div>
                        <div className="flex items-center gap-2"><PlayCircle size={14} style={{ color: 'var(--foreground)' }} /><span className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>Exhibition Auto-Pilot</span></div>
                        <p className="text-[10px] mt-0.5" style={{ color: 'var(--muted-foreground)' }}>Hands-free timeline loop</p>
                      </div>
                      <div onClick={() => onUpdateSettings({ ...settings, autoPilot: !settings.autoPilot, timeShift: 0 })} className="w-8 h-4 rounded-full flex items-center p-0.5 cursor-pointer transition-colors" style={{ background: settings.autoPilot ? 'var(--primary)' : 'var(--surface-3)' }}><div className={`w-3 h-3 rounded-full bg-white transform transition-transform ${settings.autoPilot ? 'translate-x-4' : ''}`}></div></div>
                    </div>

                    <div className="pt-2">
                      <button onClick={handleExportCSV} className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-colors hover:bg-white/10" style={{ background: 'rgba(34,211,238,0.1)', color: 'var(--primary)', border: '1px solid rgba(34,211,238,0.2)' }}><Download size={14} /> Export Current State (CSV)</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ml-2" style={{ background: 'rgba(34,211,238,0.15)', color: 'var(--primary)' }}>AW</div>
          </div>
        </div>
      </div>
    </header>
  );
}

// Custom internal component for the 8-grid display tools
function ToolButton({ active, onClick, icon, label }: { active?: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button 
      onClick={onClick}
      className="flex flex-col items-center justify-center gap-2 p-3 rounded-xl border transition-all"
      style={{ 
        background: active ? 'var(--primary)' : 'var(--surface-1)', 
        borderColor: active ? 'transparent' : 'var(--border)',
        color: active ? '#000' : 'var(--foreground)'
      }}
    >
      <div className="h-6 flex items-center justify-center">{icon}</div>
      <span className="text-[10px] font-semibold text-center leading-tight">{label}</span>
    </button>
  );
}

// 'use client';

// import React, { useState } from 'react';
// import AppLogo from '@/components/ui/AppLogo';
// import { AppSettings } from './DashboardClient';
// import { 
//   Activity, Bell, Settings, Shield, AlertTriangle, X, 
//   Lock, EyeOff, Server, BrainCircuit, Eye, LayoutGrid, Moon,
//   Smartphone, Tablet, Laptop, Download, PlayCircle
// } from 'lucide-react';
// import { Venue } from './venueData';

// interface DashboardTopbarProps {
//   venues?: Venue[];
//   settings: AppSettings;
//   onUpdateSettings: (newSettings: AppSettings) => void;
// }

// export default function DashboardTopbar({
//   venues = [],
//   settings,
//   onUpdateSettings,
// }: DashboardTopbarProps) {
//   const [isAlertsOpen, setIsAlertsOpen] = useState(false);
//   const [isShieldOpen, setIsShieldOpen] = useState(false);
//   const [isSettingsOpen, setIsSettingsOpen] = useState(false);
//   const [settingsTab, setSettingsTab] = useState<'ai' | 'accessibility'>('ai');
  
//   const overcrowdedVenues = venues.filter(v => (v.presentCount / v.maxCapacity) >= 0.9);

//   const toggleDropdown = (menu: 'alerts' | 'shield' | 'settings') => {
//     setIsAlertsOpen(menu === 'alerts' ? !isAlertsOpen : false);
//     setIsShieldOpen(menu === 'shield' ? !isShieldOpen : false);
//     setIsSettingsOpen(menu === 'settings' ? !isSettingsOpen : false);
//   };

//   // --- CSV EXPORT FUNCTION ---
//   const handleExportCSV = () => {
//     const headers = ['Venue_Name', 'Category', 'Label_Density', 'Present_Count', 'Waiting_Queue', 'Max_Capacity', 'Occupancy_Pct'];
    
//     const rows = venues.map(v => {
//       const pct = Math.round((v.presentCount / v.maxCapacity) * 100);
//       const status = pct >= 90 ? 'CRITICAL' : pct >= 75 ? 'HIGH' : pct >= 50 ? 'MEDIUM' : 'LOW';
//       return `"${v.name}","${v.category}","${status}",${v.presentCount},${v.waitingCount},${v.maxCapacity},${pct}`;
//     });

//     const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
//     const encodedUri = encodeURI(csvContent);
//     const link = document.createElement('a');
//     link.setAttribute('href', encodedUri);
//     link.setAttribute('download', `crowd_dataset_sim_${new Date().getTime()}.csv`);
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//   };

//   return (
//     <header
//       className="sticky top-0 z-50 border-b"
//       style={{ background: 'rgba(6, 12, 24, 0.92)', backdropFilter: 'blur(12px)', borderColor: 'var(--border)' }}
//     >
//       <div className="max-w-screen-2xl mx-auto px-4 lg:px-8 xl:px-10 2xl:px-16">
//         <div className="flex items-center justify-between h-16">
//           <div className="flex items-center gap-3">
//             <div className="flex items-center gap-2 cursor-pointer">
//               <AppLogo size={32} />
//               <span className="font-semibold text-lg tracking-tight" style={{ color: 'var(--foreground)' }}>
//                 Crowd Check
//                 <span className="ml-1 text-xs font-medium px-1.5 py-0.5 rounded" style={{ background: 'rgba(34,211,238,0.12)', color: 'var(--primary)' }}>AI</span>
//               </span>
//             </div>
//           </div>

//           <div className="hidden md:flex items-center gap-2 text-sm" style={{ color: 'var(--muted-foreground)' }}>
//             <span className="flex items-center gap-1.5">
//               <span className="inline-block w-2 h-2 rounded-full live-pulse" style={{ background: 'var(--density-low)' }} />
//               <span>Live Monitoring Active</span>
//             </span>
//             <span className="mx-2 opacity-30">|</span>
//             <Activity size={14} style={{ color: 'var(--primary)' }} />
//             <span style={{ color: 'var(--primary)' }} className="font-medium">AI Camera Feeds Online</span>
//           </div>

//           <div className="flex items-center gap-2">
            
//             {/* BELL / ALERTS */}
//             <div className="relative">
//               <button onClick={() => toggleDropdown('alerts')} className="relative p-2 rounded-lg transition-colors hover:bg-white/10 active:scale-95">
//                 <Bell size={18} style={{ color: 'var(--muted-foreground)' }} />
//                 {overcrowdedVenues.length > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full" style={{ background: 'var(--density-high)' }} />}
//               </button>
//               {isAlertsOpen && (
//                 <div className="absolute right-0 mt-2 w-80 rounded-xl border shadow-xl z-50 overflow-hidden" style={{ background: 'var(--surface-1)', borderColor: 'var(--border)' }}>
//                   <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'var(--border)', background: 'var(--surface-2)' }}>
//                     <h3 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>System Alerts</h3>
//                     <button onClick={() => setIsAlertsOpen(false)} className="hover:bg-white/5 p-1 rounded"><X size={14} style={{ color: 'var(--muted-foreground)' }}/></button>
//                   </div>
//                   <div className="max-h-80 overflow-y-auto p-2 space-y-1">
//                     {overcrowdedVenues.length === 0 ? (
//                       <div className="p-4 text-xs text-center" style={{ color: 'var(--muted-foreground)' }}>All venues are currently at safe capacity.</div>
//                     ) : (
//                       overcrowdedVenues.map(v => {
//                         const pct = Math.round((v.presentCount / v.maxCapacity) * 100);
//                         return (
//                           <div key={v.id} className="flex items-start gap-3 p-3 rounded-lg border" style={{ background: 'rgba(239,68,68,0.05)', borderColor: 'rgba(239,68,68,0.2)' }}>
//                             <AlertTriangle size={16} style={{ color: '#ef4444', marginTop: '2px' }} className="flex-shrink-0" />
//                             <div>
//                               <p className="text-xs font-semibold" style={{ color: 'var(--foreground)' }}>Crowd Alert: {v.name}</p>
//                               <p className="text-xs mt-1 leading-snug" style={{ color: 'var(--muted-foreground)' }}>Avoid going to {v.name}. It is <span className="font-bold text-red-400">{pct}% full</span>.</p>
//                             </div>
//                           </div>
//                         )
//                       })
//                     )}
//                   </div>
//                 </div>
//               )}
//             </div>

//             {/* SHIELD / SECURITY */}
//             <div className="relative">
//               <button onClick={() => toggleDropdown('shield')} className="p-2 rounded-lg transition-colors hover:bg-white/10 active:scale-95">
//                 <Shield size={18} style={{ color: 'var(--muted-foreground)' }} />
//               </button>
//               {isShieldOpen && (
//                 <div className="absolute right-0 mt-2 w-72 rounded-xl border shadow-xl z-50 overflow-hidden" style={{ background: 'var(--surface-1)', borderColor: 'var(--border)' }}>
//                   <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'var(--border)', background: 'var(--surface-2)' }}>
//                     <h3 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Network Security</h3>
//                     <button onClick={() => setIsShieldOpen(false)} className="hover:bg-white/5 p-1 rounded"><X size={14} style={{ color: 'var(--muted-foreground)' }}/></button>
//                   </div>
//                   <div className="p-4 space-y-4">
//                     <div className="flex items-center justify-between">
//                       <div className="flex items-center gap-2"><Lock size={14} style={{ color: '#22c55e' }} /><span className="text-sm" style={{ color: 'var(--foreground)' }}>AES-256 Encryption</span></div>
//                       <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ background: 'rgba(34,197,94,0.15)', color: '#22c55e' }}>Active</span>
//                     </div>
//                     <div className="flex items-center justify-between">
//                       <div className="flex items-center gap-2"><Server size={14} style={{ color: '#22c55e' }} /><span className="text-sm" style={{ color: 'var(--foreground)' }}>Mainframe Uplink</span></div>
//                       <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ background: 'rgba(34,197,94,0.15)', color: '#22c55e' }}>Secure</span>
//                     </div>
//                     <div className="pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
//                       <div className="flex items-center justify-between">
//                         <div className="flex items-center gap-2"><EyeOff size={14} style={{ color: 'var(--primary)' }} /><span className="text-sm" style={{ color: 'var(--foreground)' }}>Privacy Masking</span></div>
//                         <div className="w-8 h-4 rounded-full flex items-center p-0.5 cursor-pointer" style={{ background: 'var(--primary)' }}><div className="w-3 h-3 rounded-full bg-white transform translate-x-4"></div></div>
//                       </div>
//                       <p className="text-xs mt-2" style={{ color: 'var(--muted-foreground)' }}>AI blurs faces in CCTV feeds to protect identity.</p>
//                     </div>
//                   </div>
//                 </div>
//               )}
//             </div>

//             {/* SETTINGS / PREFERENCES */}
//             <div className="relative">
//               <button onClick={() => toggleDropdown('settings')} className="p-2 rounded-lg transition-colors hover:bg-white/10 active:scale-95">
//                 <Settings size={18} style={{ color: 'var(--muted-foreground)' }} />
//               </button>
//               {isSettingsOpen && (
//                 <div className="absolute right-0 mt-2 w-[340px] rounded-xl border shadow-xl z-50 overflow-hidden" style={{ background: 'var(--surface-1)', borderColor: 'var(--border)' }}>
//                   <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'var(--border)', background: 'var(--surface-2)' }}>
//                     <h3 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>System Preferences</h3>
//                     <button onClick={() => setIsSettingsOpen(false)} className="hover:bg-white/5 p-1 rounded"><X size={14} style={{ color: 'var(--muted-foreground)' }}/></button>
//                   </div>
                  
//                   <div className="flex border-b" style={{ borderColor: 'var(--border)', background: 'var(--surface-2)' }}>
//                     <button onClick={() => setSettingsTab('ai')} className={`flex-1 py-2.5 text-xs font-semibold flex items-center justify-center gap-2 transition-colors ${settingsTab === 'ai' ? 'border-b-2' : ''}`} style={{ borderColor: settingsTab === 'ai' ? 'var(--primary)' : 'transparent', color: settingsTab === 'ai' ? 'var(--primary)' : 'var(--muted-foreground)' }}><BrainCircuit size={14} />AI Engine</button>
//                     <button onClick={() => setSettingsTab('accessibility')} className={`flex-1 py-2.5 text-xs font-semibold flex items-center justify-center gap-2 transition-colors ${settingsTab === 'accessibility' ? 'border-b-2' : ''}`} style={{ borderColor: settingsTab === 'accessibility' ? 'var(--primary)' : 'transparent', color: settingsTab === 'accessibility' ? 'var(--primary)' : 'var(--muted-foreground)' }}><Eye size={14} />Control Room</button>
//                   </div>

//                   <div className="p-4 space-y-5">
//                     {/* AI ENGINE TAB */}
//                     {settingsTab === 'ai' && (
//                       <div className="space-y-4">
//                         <div className="space-y-3">
//                           <div className="flex items-center justify-between">
//                             <div>
//                               <div className="flex items-center gap-2">
//                                 <Activity size={14} style={{ color: 'var(--foreground)' }} />
//                                 <span className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>Timeline Forecaster</span>
//                               </div>
//                               <p className="text-[10px] mt-0.5" style={{ color: 'var(--muted-foreground)' }}>Shift data from -12h past to +12h future</p>
//                             </div>
//                             <div className="text-xs font-bold" style={{ color: settings.timeShift === 0 ? 'var(--primary)' : settings.timeShift > 0 ? '#facc15' : '#60a5fa' }}>
//                               {settings.timeShift === 0 ? 'LIVE' : settings.timeShift > 0 ? `+${settings.timeShift} hrs` : `${settings.timeShift} hrs`}
//                             </div>
//                           </div>
                          
//                           <input 
//                             type="range" min="-12" max="12" step="1" 
//                             value={settings.timeShift} 
//                             disabled={settings.autoPilot}
//                             onChange={(e) => onUpdateSettings({ ...settings, timeShift: parseInt(e.target.value) })}
//                             className={`w-full h-1.5 rounded-full appearance-none ${settings.autoPilot ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
//                             style={{ background: 'var(--surface-3)', accentColor: 'var(--primary)' }}
//                           />
//                           <div className="flex justify-between text-[10px]" style={{ color: 'var(--muted-foreground)' }}><span>-12h</span><span>Live</span><span>+12h</span></div>
//                         </div>

//                         {/* AUTO-PILOT TOGGLE */}
//                         <div className="flex items-center justify-between pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
//                           <div>
//                             <div className="flex items-center gap-2">
//                               <PlayCircle size={14} style={{ color: 'var(--foreground)' }} />
//                               <span className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>Exhibition Auto-Pilot</span>
//                             </div>
//                             <p className="text-[10px] mt-0.5" style={{ color: 'var(--muted-foreground)' }}>Hands-free timeline loop</p>
//                           </div>
//                           <div onClick={() => onUpdateSettings({ ...settings, autoPilot: !settings.autoPilot, timeShift: 0 })} className="w-8 h-4 rounded-full flex items-center p-0.5 cursor-pointer transition-colors" style={{ background: settings.autoPilot ? 'var(--primary)' : 'var(--surface-3)' }}>
//                             <div className={`w-3 h-3 rounded-full bg-white transform transition-transform ${settings.autoPilot ? 'translate-x-4' : ''}`}></div>
//                           </div>
//                         </div>

//                         {/* CSV EXPORT */}
//                         <div className="pt-2">
//                           <button onClick={handleExportCSV} className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-colors hover:bg-white/10" style={{ background: 'rgba(34,211,238,0.1)', color: 'var(--primary)', border: '1px solid rgba(34,211,238,0.2)' }}>
//                             <Download size={14} /> Export Current State (CSV)
//                           </button>
//                         </div>
//                       </div>
//                     )}

//                     {/* CONTROL ROOM TAB */}
//                     {settingsTab === 'accessibility' && (
//                       <>
//                         <div className="flex items-center justify-between">
//                           <div>
//                             <div className="flex items-center gap-2"><Eye size={14} style={{ color: 'var(--foreground)' }} /><span className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>Colorblind Mode</span></div>
//                             <p className="text-[10px] mt-0.5" style={{ color: 'var(--muted-foreground)' }}>Shift density palette to Blue/Orange</p>
//                           </div>
//                           <div onClick={() => onUpdateSettings({ ...settings, colorblind: !settings.colorblind })} className="w-8 h-4 rounded-full flex items-center p-0.5 cursor-pointer transition-colors" style={{ background: settings.colorblind ? 'var(--primary)' : 'var(--surface-3)' }}><div className={`w-3 h-3 rounded-full bg-white transform transition-transform ${settings.colorblind ? 'translate-x-4' : ''}`}></div></div>
//                         </div>

//                         <div className="flex items-center justify-between">
//                           <div>
//                             <div className="flex items-center gap-2"><Moon size={14} style={{ color: 'var(--foreground)' }} /><span className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>Night Vision UI</span></div>
//                             <p className="text-[10px] mt-0.5" style={{ color: 'var(--muted-foreground)' }}>Ultra-dark mode for night shifts</p>
//                           </div>
//                           <div onClick={() => onUpdateSettings({ ...settings, nightVision: !settings.nightVision })} className="w-8 h-4 rounded-full flex items-center p-0.5 cursor-pointer transition-colors" style={{ background: settings.nightVision ? 'var(--primary)' : 'var(--surface-3)' }}><div className={`w-3 h-3 rounded-full bg-white transform transition-transform ${settings.nightVision ? 'translate-x-4' : ''}`}></div></div>
//                         </div>

//                         <div className="space-y-2 pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
//                           <div className="flex items-center gap-2"><LayoutGrid size={14} style={{ color: 'var(--foreground)' }} /><span className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>Grid Density</span></div>
//                           <div className="flex gap-2">
//                             <button onClick={() => onUpdateSettings({ ...settings, gridDensity: 'comfortable' })} className="flex-1 py-1.5 text-xs rounded-md border transition-colors" style={{ borderColor: settings.gridDensity === 'comfortable' ? 'var(--primary)' : 'var(--border)', color: settings.gridDensity === 'comfortable' ? 'var(--primary)' : 'var(--muted-foreground)', background: settings.gridDensity === 'comfortable' ? 'rgba(34,211,238,0.1)' : 'transparent' }}>Comfortable</button>
//                             <button onClick={() => onUpdateSettings({ ...settings, gridDensity: 'compact' })} className="flex-1 py-1.5 text-xs rounded-md border transition-colors" style={{ borderColor: settings.gridDensity === 'compact' ? 'var(--primary)' : 'var(--border)', color: settings.gridDensity === 'compact' ? 'var(--primary)' : 'var(--muted-foreground)', background: settings.gridDensity === 'compact' ? 'rgba(34,211,238,0.1)' : 'transparent' }}>Compact View</button>
//                           </div>
//                         </div>

//                         <div className="space-y-2 pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
//                           <div className="flex items-center gap-2"><Laptop size={14} style={{ color: 'var(--foreground)' }} /><span className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>Device Preview</span></div>
//                           <div className="flex gap-2">
//                             <button onClick={() => onUpdateSettings({ ...settings, deviceView: 'mobile' })} className="flex-1 py-1.5 text-xs rounded-md border flex items-center justify-center gap-1.5 transition-colors" style={{ borderColor: settings.deviceView === 'mobile' ? 'var(--primary)' : 'var(--border)', color: settings.deviceView === 'mobile' ? 'var(--primary)' : 'var(--muted-foreground)', background: settings.deviceView === 'mobile' ? 'rgba(34,211,238,0.1)' : 'transparent' }}><Smartphone size={12} /> Mobile</button>
//                             <button onClick={() => onUpdateSettings({ ...settings, deviceView: 'tablet' })} className="flex-1 py-1.5 text-xs rounded-md border flex items-center justify-center gap-1.5 transition-colors" style={{ borderColor: settings.deviceView === 'tablet' ? 'var(--primary)' : 'var(--border)', color: settings.deviceView === 'tablet' ? 'var(--primary)' : 'var(--muted-foreground)', background: settings.deviceView === 'tablet' ? 'rgba(34,211,238,0.1)' : 'transparent' }}><Tablet size={12} /> Tablet</button>
//                             <button onClick={() => onUpdateSettings({ ...settings, deviceView: 'desktop' })} className="flex-1 py-1.5 text-xs rounded-md border flex items-center justify-center gap-1.5 transition-colors" style={{ borderColor: settings.deviceView === 'desktop' ? 'var(--primary)' : 'var(--border)', color: settings.deviceView === 'desktop' ? 'var(--primary)' : 'var(--muted-foreground)', background: settings.deviceView === 'desktop' ? 'rgba(34,211,238,0.1)' : 'transparent' }}><Laptop size={12} /> Laptop</button>
//                           </div>
//                         </div>
//                       </>
//                     )}
//                   </div>
//                 </div>
//               )}
//             </div>
            
//             <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ml-2" style={{ background: 'rgba(34,211,238,0.15)', color: 'var(--primary)' }}>AW</div>
//             <div className="hidden sm:block text-left">
//               <p className="text-xs font-medium" style={{ color: 'var(--foreground)' }}>Ansh Wairagkar</p>
//               <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Admin</p>
//             </div>
//           </div>
//         </div>
//       </div>
//     </header>
//   );
// }
